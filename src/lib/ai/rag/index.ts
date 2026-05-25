import type { RAGDocument, RAGResult } from '../types';
import { EXERCISE_KNOWLEDGE } from './knowledge/exercises';
import { NUTRITION_KNOWLEDGE } from './knowledge/nutrition';
import { ANATOMY_KNOWLEDGE } from './knowledge/anatomy';
import { RECOVERY_KNOWLEDGE } from './knowledge/recovery';
import { SUPPLEMENT_KNOWLEDGE } from './knowledge/supplements';
import { TRAINING_METHODS_KNOWLEDGE } from './knowledge/training-methods';
import { BODY_COMPOSITION_KNOWLEDGE } from './knowledge/body-composition';
import { DIET_STRATEGIES_KNOWLEDGE } from './knowledge/diet-strategies';
import { TTLCache } from '@/lib/server-cache';

const RAG_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — knowledge base is static
const ragCache = new TTLCache<RAGResult[]>();

const ALL_DOCUMENTS: RAGDocument[] = [
  ...EXERCISE_KNOWLEDGE,
  ...NUTRITION_KNOWLEDGE,
  ...ANATOMY_KNOWLEDGE,
  ...RECOVERY_KNOWLEDGE,
  ...SUPPLEMENT_KNOWLEDGE,
  ...TRAINING_METHODS_KNOWLEDGE,
  ...BODY_COMPOSITION_KNOWLEDGE,
  ...DIET_STRATEGIES_KNOWLEDGE,
];

// ── Query Expansion ────────────────────────────────────────────────────────────
/**
 * Synonym / alias expansion for common Chinese fitness terms.
 * Maps alternative phrasings to canonical keywords that appear in the knowledge base.
 */
const QUERY_EXPANSION: Record<string, string[]> = {
  // ── 疼痛与损伤 ────────────────────────────────────────────────────────────
  '肩膀痛': ['肩袖', '肩关节', '肩痛'],
  '肩痛': ['肩袖', '肩关节', '夹挤'],
  '腰痛': ['腰椎', '脊柱', '圆背', '核心稳定'],
  '腰疼': ['腰椎', '脊柱', '核心稳定'],
  '膝盖痛': ['膝关节', '髌腱', '膝内扣'],
  '膝盖疼': ['膝关节', '髌腱'],
  '受伤': ['急性损伤', 'RICE', '受伤处理'],
  '扭伤': ['急性损伤', 'RICE', '冰敷'],
  '拉伤': ['急性损伤', '肌肉撕裂', 'RICE'],
  // ── 体成分目标 ────────────────────────────────────────────────────────────
  '增肌': ['蛋白质', '超负荷', '肌肉合成', '热量盈余'],
  '减脂': ['热量缺口', '有氧', '蛋白质', '代谢适应'],
  '减肥': ['热量缺口', '有氧', '饮食', 'NEAT'],
  '减腹': ['顽固脂肪', '热量缺口', '腹部脂肪'],
  '马甲线': ['体脂率', '热量缺口', '顽固脂肪'],
  '减小肚子': ['顽固脂肪', '热量缺口', '腹部脂肪'],
  '增肌减脂': ['再构', '身体再构', '新手'],
  '同时增肌减脂': ['再构', '身体再构', '热量盈余'],
  // ── 疲劳与恢复 ────────────────────────────────────────────────────────────
  '没力气': ['疲劳', '恢复', '睡眠', 'OTS'],
  '恢复慢': ['主动恢复', '睡眠', 'DOMS'],
  '酸痛': ['DOMS', '主动恢复', '延迟性肌肉酸痛'],
  '过度训练': ['OTS', '过度训练综合征', '疲劳累积'],
  '训练后酸': ['DOMS', '主动恢复', '拉伸'],
  '训练后累': ['疲劳', '恢复', '睡眠', '营养'],
  // ── 饮食策略 ─────────────────────────────────────────────────────────────
  '减脂停滞': ['代谢适应', '回补日', 'refeed', '平台期'],
  '平台期': ['代谢适应', '回补日', '饮食暂停', 'NEAT'],
  '断食': ['间歇性禁食', '16:8', 'IF'],
  '不吃早饭': ['间歇性禁食', '16:8', '空腹训练'],
  '不吃碳水': ['低碳日', '碳水循环', '生酮'],
  '节食': ['热量缺口', '代谢适应', '灵活饮食'],
  '增肌期吃什么': ['热量盈余', '蛋白质', '碳水', '精益增肌'],
  '减脂期吃什么': ['热量缺口', '蛋白质', '灵活饮食', 'IIFYM'],
  '训练前吃什么': ['训练前饮食', '碳水', '餐前补充'],
  '训练后吃什么': ['训练后营养', '蛋白质', '碳水', '糖原恢复'],
  // ── 补剂 ──────────────────────────────────────────────────────────────────
  '吃什么补剂': ['蛋白粉', '肌酸', '咖啡因', '补剂'],
  '前补': ['咖啡因', '瓜氨酸', '训练前', '补剂'],
  '蛋白粉': ['蛋白质', '乳清蛋白', 'BCAA'],
  '鱼油': ['omega3', 'EPA', 'DHA', '炎症'],
  '维D': ['维生素D', '睾酮', '骨密度'],
  '抽筋': ['镁', '电解质', '肌肉痉挛'],
  '泵感差': ['瓜氨酸', '一氧化氮', '血流'],
  // ── 训练技术 ──────────────────────────────────────────────────────────────
  '感受不到肌肉': ['心力联系', '肌肉感受', '预疲劳'],
  '感受不到胸': ['心力联系', '胸肌', '预疲劳'],
  '感受不到背': ['背阔肌', '肩胛骨', '心力联系'],
  '臀部不发力': ['臀肌激活', '臀肌失忆', '骨盆前倾'],
  '背部激活': ['背阔肌', '肩胛骨', '划船'],
  '上胸': ['锁骨头', '上斜卧推', '胸肌'],
  '怎么进步更快': ['渐进超负荷', '周期化', '5/3/1'],
  '训练计划': ['周期化', '减量周', '渐进超负荷', 'PPL'],
  '分化': ['PPL', '推拉腿', '训练分化'],
  '递减': ['递减组', 'drop set', '代谢压力'],
  '停顿法': ['停顿法', 'rest pause', '力竭训练'],
  // ── 其他 ──────────────────────────────────────────────────────────────────
  '柔韧性差': ['关节活动度', '拉伸', 'ROM'],
  '睡不好': ['睡眠', '恢复', '皮质醇', '镁'],
  'deload': ['减量周', '超量恢复', '周期化'],
  '停训了': ['肌肉记忆', '停训', '复训'],
  '测体脂': ['体脂率', 'BIA', 'DEXA', '体脂测量'],
  '有氧选择': ['Zone 2', '有氧基础', 'HIIT', '低强度有氧'],
};

/** Detect the likely topic category of the query for boosting. */
type QueryCategory = 'exercise' | 'nutrition' | 'recovery' | 'anatomy' | 'general';

const CATEGORY_SIGNALS: Record<QueryCategory, string[]> = {
  exercise: ['动作', '训练', '卧推', '深蹲', '硬拉', '哑铃', '杠铃', '组数', '次数', '重量', 'RM', 'RPE', '分化', 'PPL', '递减', '超级组', '方案', '周期'],
  nutrition: ['吃', '饮食', '蛋白质', '热量', '碳水', '脂肪', '营养', '饿', '体重', '减脂', '增肌', '补剂', '禁食', '宏量', 'kcal', '卡路里', '肠道'],
  recovery: ['恢复', '疲劳', '酸痛', '睡眠', '休息', '减量', '伤', '痛', '抽筋', '镁', '拉伸'],
  anatomy: ['肌肉', '关节', '肩', '腰', '膝', '背', '胸', '臀', '解剖', '肌纤维', '筋膜'],
  general: [],
};

function detectCategory(query: string): QueryCategory | null {
  let best: QueryCategory | null = null;
  let bestScore = 0;
  for (const [cat, signals] of Object.entries(CATEGORY_SIGNALS) as [QueryCategory, string[]][]) {
    if (cat === 'general') continue;
    const score = signals.filter(s => query.includes(s)).length;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return bestScore > 0 ? best : null;
}

/**
 * Tokenise Chinese and English text into a flat keyword set.
 * Splits on whitespace, punctuation, and CJK character boundaries.
 */
function tokenize(text: string): Set<string> {
  const lower = text.toLowerCase();
  const tokens = new Set<string>();

  const wordMatches = lower.match(/[a-z0-9]+/g);
  if (wordMatches) wordMatches.forEach(w => tokens.add(w));

  const cjkMatches = lower.match(/[\u4e00-\u9fff]+/g);
  if (cjkMatches) {
    for (const seg of cjkMatches) {
      for (let i = 0; i < seg.length; i++) {
        tokens.add(seg[i]);
        if (i + 1 < seg.length) tokens.add(seg.slice(i, i + 2));
        if (i + 2 < seg.length) tokens.add(seg.slice(i, i + 3));
      }
    }
  }

  return tokens;
}

/** Expand query tokens using synonym map */
function expandQuery(query: string, base: Set<string>): Set<string> {
  const expanded = new Set(base);
  for (const [phrase, expansions] of Object.entries(QUERY_EXPANSION)) {
    if (query.includes(phrase)) {
      for (const e of expansions) {
        const eTokens = tokenize(e);
        eTokens.forEach(t => expanded.add(t));
      }
    }
  }
  return expanded;
}

/**
 * Score a document against a query.
 * - Curated keyword exact match: +4 pts
 * - Curated keyword partial match (Chinese substring): +1.5 pts
 * - Content token overlap: +1 pt
 * - Category match bonus: ×1.3 multiplier
 */
function scoreDocument(
  doc: RAGDocument,
  queryTokens: Set<string>,
  detectedCategory: QueryCategory | null,
): number {
  if (queryTokens.size === 0) return 0;

  let matches = 0;

  for (const kw of doc.keywords) {
    const kwLower = kw.toLowerCase();
    if (queryTokens.has(kwLower)) {
      matches += 4;
    } else {
      for (const qt of queryTokens) {
        if (qt.length >= 2 && kwLower.includes(qt)) { matches += 1.5; break; }
      }
    }
  }

  const docTokens = tokenize(doc.title + ' ' + doc.content);
  for (const qt of queryTokens) {
    if (docTokens.has(qt)) matches += 1;
  }

  let score = matches / queryTokens.size;

  // Category-aware boost: reward docs that match the detected intent
  if (detectedCategory && doc.category === detectedCategory) {
    score *= 1.3;
  }

  return score;
}

/**
 * Retrieve the top-K most relevant documents for a natural language query.
 *
 * @param query     - Natural language question (Chinese or English)
 * @param topK      - Number of results to return (default 3)
 * @param threshold - Minimum score to include a result (default 0.25)
 * @param category  - Optional category filter override
 */
export function retrieve(
  query: string,
  topK = 3,
  threshold = 0.25,
  category?: 'exercise' | 'nutrition' | 'recovery' | 'anatomy',
): RAGResult[] {
  const cacheKey = `${query}|${topK}|${threshold}|${category ?? ''}`;
  const cached = ragCache.get(cacheKey);
  if (cached) return cached;

  const baseTokens = tokenize(query);
  const queryTokens = expandQuery(query, baseTokens);
  const detectedCategory = (category as QueryCategory | undefined) ?? detectCategory(query);

  const pool = category
    ? ALL_DOCUMENTS.filter(d => d.category === category)
    : ALL_DOCUMENTS;

  const scored: RAGResult[] = pool.map(doc => ({
    document: doc,
    score: scoreDocument(doc, queryTokens, detectedCategory),
  }));

  const results = scored
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  ragCache.set(cacheKey, results, RAG_CACHE_TTL_MS);
  return results;
}

/**
 * Format retrieved documents as a compact context block for injection into prompts.
 * Includes confidence indicator for transparency.
 */
export function formatRAGContext(results: RAGResult[]): string {
  if (results.length === 0) return '';
  const lines = results.map(r => `【${r.document.title}】${r.document.content}`);
  return `\n\n--- 相关运动科学知识（权威文献支撑）---\n${lines.join('\n\n')}`;
}
