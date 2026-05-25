import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { complete } from '@/lib/ai/orchestrator';

/**
 * POST /api/foods/scan
 * 接收图片（base64 或 multipart），调用通义千问-VL 识别营养成分表，
 * 返回结构化营养数据。
 *
 * 请求体：multipart/form-data，字段名 "image"（图片文件）
 * 或 application/json，字段 "base64"（data:image/...;base64,xxx）
 *
 * 响应：{ nutrition: { name?, calories, protein, carbs, fat, fiber?, sugar?, sodium?, servingSize? } }
 */

interface NutritionResult {
  name?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: number;
  confidence: 'high' | 'medium' | 'low';
  rawText?: string;
}

const SYSTEM_PROMPT = `你是一个专业的食品营养成分识别助手。
用户会上传一张食品营养成分表（营养标签）的照片。
请仔细识别图片中的所有营养信息，并以 JSON 格式返回结果。

返回格式（严格 JSON，不要包含注释或额外文字）：
{
  "name": "食品名称（如果图片上有的话，否则不包含此字段）",
  "servingSize": 100,
  "calories": 数字（千卡/kcal，每100g）,
  "protein": 数字（克，每100g）,
  "carbs": 数字（克，每100g，即碳水化合物）,
  "fat": 数字（克，每100g）,
  "fiber": 数字或null（克，膳食纤维，每100g）,
  "sugar": 数字或null（克，糖，每100g）,
  "sodium": 数字或null（毫克mg，钠，每100g）,
  "confidence": "high" 或 "medium" 或 "low"（识别置信度）
}

注意事项：
1. 所有数值必须转换为每100g的量。如果标签标注的是每份(serving)，请按比例换算。
2. 热量单位统一换算为千卡(kcal)。如果标签只有千焦(kJ)，请除以4.184。
3. 钠(Na)单位统一为毫克(mg)。
4. 如果某个字段无法识别，用 null。
5. 只返回 JSON，不要有任何其他文字。`;

async function callQwenVL(imageBase64: string, mimeType: string): Promise<string> {
  const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
  const resp = await complete({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } },
          { type: 'text', text: '请识别这张营养成分表，按照要求返回 JSON 格式的营养数据。' },
        ],
      },
    ],
    model: 'qwen-vl-plus',
    timeoutMs: 30_000,
  });
  return resp.content;
}

function parseNutritionJson(raw: string): NutritionResult {
  // 提取 JSON 块（模型有时会包裹在 ```json ... ``` 中）
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) ||
                    raw.match(/```\s*([\s\S]*?)\s*```/) ||
                    raw.match(/(\{[\s\S]*\})/);

  const jsonStr = jsonMatch ? jsonMatch[1] : raw.trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('无法解析识别结果为 JSON');
  }

  const safeNum = (v: unknown, max = 9999): number | undefined => {
    if (v == null || v === '') return undefined;
    const n = parseFloat(String(v));
    if (isNaN(n) || n < 0) return undefined;
    return Math.min(Math.round(n * 10) / 10, max);
  };

  const protein = safeNum(parsed.protein);
  const carbs = safeNum(parsed.carbs) ?? safeNum(parsed.carbohydrates);
  const fat = safeNum(parsed.fat);

  if (protein == null || carbs == null || fat == null) {
    throw new Error('关键营养字段（蛋白质/碳水/脂肪）识别失败，请重拍更清晰的照片');
  }

  // 根据碳蛋脂自动校正热量（Atwater: 碳4 + 蛋4 + 脂9）
  const calories = Math.round(carbs * 4 + protein * 4 + fat * 9);

  return {
    name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : undefined,
    servingSize: safeNum(parsed.servingSize),
    calories,
    protein,
    carbs,
    fat,
    fiber: safeNum(parsed.fiber),
    sugar: safeNum(parsed.sugar),
    sodium: safeNum(parsed.sodium, 99999),
    confidence: (['high', 'medium', 'low'].includes(String(parsed.confidence))
      ? parsed.confidence
      : 'medium') as 'high' | 'medium' | 'low',
    rawText: raw.slice(0, 500),
  };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: '拍照识别功能未配置，请联系管理员设置 DASHSCOPE_API_KEY' },
        { status: 503 }
      );
    }

    let imageBase64: string;
    let mimeType = 'image/jpeg';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // multipart 上传
      const formData = await request.formData();
      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json({ error: '未提供图片文件' }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: '图片大小不能超过 10MB' }, { status: 400 });
      }
      mimeType = file.type || 'image/jpeg';
      const buffer = await file.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString('base64');
    } else {
      // JSON body with base64
      const body = await request.json();
      const raw = body?.base64 as string;
      if (!raw) {
        return NextResponse.json({ error: '未提供图片数据' }, { status: 400 });
      }
      // 提取 mime type
      const mimeMatch = raw.match(/^data:([^;]+);base64,/);
      if (mimeMatch) mimeType = mimeMatch[1];
      imageBase64 = raw;
    }

    // 注入 system prompt 并调用 Qwen-VL
    const rawResponse = await callQwenVLWithSystem(imageBase64, mimeType);
    const nutrition = parseNutritionJson(rawResponse);

    return NextResponse.json({ nutrition });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '识别失败';
    logger.error('POST /api/foods/scan error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function callQwenVLWithSystem(imageBase64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY!;
  const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  const body = {
    model: 'qwen-vl-plus',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
          {
            type: 'text',
            text: '请识别这张营养成分表，只返回 JSON。',
          },
        ],
      },
    ],
    temperature: 0.1,
  };

  const res = await fetch(
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`AI 服务错误 ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI 服务返回内容为空');
  return typeof content === 'string' ? content : JSON.stringify(content);
}
