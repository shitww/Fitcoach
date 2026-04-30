"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Dumbbell, Search, X, Target, AlertTriangle, CheckCircle, Zap, ChevronRight, Plus, Trash2, Edit2, Loader2, Star } from 'lucide-react';
import { createCustomExercise, getUserCustomExercises, updateCustomExercise, deleteCustomExercise } from '@/app/actions/exercise-actions';
import { logger } from '@/lib/logger';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  category: string;
  description?: string | null;
  instructions?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  tips?: string[];
  commonMistakes?: string[];
  isCustom?: boolean;
  userNotes?: string;
}

// 内置动作库
const BUILT_IN_EXERCISES: Exercise[] = [
  { id: 'b1',  name: '卧推 (Bench Press)', muscleGroup: 'chest',    category: '力量', description: '卧推是一种基础的胸部训练动作，主要锻炼胸大肌、三角肌前束和肱三头肌。', instructions: '1. 仰卧在平板凳上，双脚平放在地面\n2. 双手握杠，宽度略宽于肩\n3. 控制杠铃缓慢下降到胸部\n4. 推起杠铃回到起始位置', tips: ['保持核心收紧，背部贴紧凳面', '下降时控制速度，避免反弹', '推起时呼气，下降时吸气'], commonMistakes: ['腰部拱起', '手腕弯曲', '下降过快'], equipment: '杠铃', difficulty: '中等' },
  { id: 'b2',  name: '深蹲 (Squat)',       muscleGroup: 'legs',     category: '力量', description: '深蹲是一种全身性的训练动作，主要锻炼股四头肌、臀大肌和核心肌群。', instructions: '1. 双脚与肩同宽，脚尖稍向外\n2. 保持胸部挺直，核心收紧\n3. 弯曲膝盖和髋关节，下降身体\n4. 当大腿与地面平行时，推起身体回到起始位置', tips: ['保持膝盖与脚尖方向一致', '重心在脚后跟', '下降时吸气，推起时呼气'], commonMistakes: ['膝盖内扣', '背部弯曲', '深度不够'], equipment: '杠铃', difficulty: '困难' },
  { id: 'b3',  name: '硬拉 (Deadlift)',     muscleGroup: 'back',     category: '力量', description: '硬拉是一种复合训练动作，主要锻炼背部、臀部和腿部肌群。', instructions: '1. 站在杠铃前，双脚与肩同宽\n2. 弯腰抓住杠铃，双手与肩同宽\n3. 保持背部挺直，核心收紧\n4. 用腿部力量提起杠铃，直到身体直立', tips: ['保持背部挺直，避免弯腰', '用腿发力，不是用背', '提起时呼气，下降时吸气'], commonMistakes: ['背部弯曲', '膝盖内扣', '提起时腰部过度伸展'], equipment: '杠铃', difficulty: '困难' },
  { id: 'b4',  name: '引体向上 (Pull Up)',  muscleGroup: 'back',     category: '力量', description: '引体向上是一种有效的背部训练动作，主要锻炼背阔肌、大圆肌和肱二头肌。', instructions: '1. 双手握住单杠，宽度略宽于肩\n2. 保持身体挺直，核心收紧\n3. 用背部力量拉动身体向上\n4. 直到下巴超过单杠\n5. 控制身体缓慢下降回到起始位置', tips: ['保持核心收紧，避免摆动', '拉动时呼气，下降时吸气', '尝试全范围运动'], commonMistakes: ['身体摆动', '动作范围不足', '只用手臂力量'], equipment: '单杠', difficulty: '困难' },
  { id: 'b5',  name: '肩上推举 (Overhead Press)', muscleGroup: 'shoulders', category: '力量', description: '肩上推举是一种肩部训练动作，主要锻炼三角肌前束和中束。', instructions: '1. 双手握杠，宽度与肩同宽\n2. 将杠铃放在肩部前方\n3. 保持核心收紧，双脚与肩同宽\n4. 推起杠铃直到手臂伸直\n5. 控制杠铃缓慢下降回到肩部', tips: ['保持核心收紧，避免腰部过度伸展', '推起时呼气，下降时吸气', '保持手腕中立'], commonMistakes: ['腰部过度伸展', '手腕弯曲', '下降过快'], equipment: '杠铃', difficulty: '中等' },
  { id: 'b6',  name: '二头肌弯举 (Bicep Curl)', muscleGroup: 'arms', category: '力量', description: '二头肌弯举是一种手臂训练动作，主要锻炼肱二头肌。', instructions: '1. 双手握哑铃，手臂自然下垂\n2. 保持肘部固定在身体两侧\n3. 弯曲手臂，将哑铃向肩部抬起\n4. 缓慢放下哑铃回到起始位置', tips: ['保持肘部固定，避免晃动', '弯曲时呼气，放下时吸气', '控制动作速度'], commonMistakes: ['身体摆动', '肘部移动', '动作过快'], equipment: '哑铃', difficulty: '简单' },
  { id: 'b7',  name: '三头肌下压 (Tricep Pushdown)', muscleGroup: 'arms', category: '力量', description: '三头肌下压是一种手臂训练动作，主要锻炼肱三头肌。', instructions: '1. 站在绳索器械前，双手握住手柄\n2. 保持肘部固定在身体两侧\n3. 向下推动手柄，直到手臂伸直\n4. 缓慢回到起始位置', tips: ['保持肘部固定，避免移动', '推动时呼气，回到时吸气', '控制动作速度'], commonMistakes: ['肘部移动', '动作范围不足', '身体前倾'], equipment: '绳索器械', difficulty: '简单' },
  { id: 'b8',  name: '平板支撑 (Plank)',     muscleGroup: 'abs',     category: '核心', description: '平板支撑是一种核心训练动作，主要锻炼腹肌和核心肌群。', instructions: '1. 俯卧，用前臂和脚尖支撑身体\n2. 保持身体成一条直线，不要下垂或抬起臀部\n3. 收紧核心，保持呼吸均匀\n4. 坚持指定的时间', tips: ['保持身体成一条直线', '收紧核心和臀部', '保持均匀呼吸'], commonMistakes: ['臀部抬起', '腰部下垂', '呼吸不均匀'], equipment: '无', difficulty: '中等' },
  { id: 'b9',  name: '腿举 (Leg Press)',    muscleGroup: 'legs',    category: '力量', description: '腿举是一种腿部训练动作，主要锻炼股四头肌、臀大肌和腘绳肌。', instructions: '1. 坐在腿举机上，双脚放在踏板上\n2. 调整座椅位置，确保膝盖弯曲约90度\n3. 推起踏板，直到腿部几乎伸直\n4. 控制踏板缓慢下降回到起始位置', tips: ['保持背部贴紧座椅', '双脚与肩同宽，脚尖稍向外', '推起时呼气，下降时吸气'], commonMistakes: ['背部离开座椅', '膝盖内扣', '下降过低'], equipment: '腿举机', difficulty: '中等' },
  { id: 'b10', name: '侧平举 (Lateral Raise)', muscleGroup: 'shoulders', category: '力量', description: '侧平举是一种肩部训练动作，主要锻炼三角肌中束。', instructions: '1. 双手握哑铃，手臂自然下垂\n2. 保持手臂微屈，将哑铃向两侧抬起\n3. 直到手臂与肩同高\n4. 缓慢放下哑铃回到起始位置', tips: ['保持手臂微屈，不要完全伸直', '抬起时呼气，放下时吸气', '控制动作速度'], commonMistakes: ['手臂完全伸直', '身体摆动', '动作过快'], equipment: '哑铃', difficulty: '简单' },
  { id: 'b11', name: '单臂龙门架Y字侧平举', muscleGroup: 'shoulders', category: '力量', description: '单臂龙门架Y字侧平举是一种肩部训练动作，主要锻炼三角肌中束和后束。', instructions: '1. 站在龙门架一侧，单手握住绳索手柄\n2. 保持手臂微屈，身体略微向对侧倾斜\n3. 将手臂向侧上方抬起，形成Y字形\n4. 缓慢放下回到起始位置', tips: ['保持手臂微屈，避免锁定关节', '控制动作速度，避免摆动', '感受肩部肌肉的收缩'], commonMistakes: ['手臂完全伸直', '身体过度摆动', '动作范围不足'], equipment: '龙门架', difficulty: '中等' },
  { id: 'b12', name: '仰卧臂屈伸',          muscleGroup: 'arms',    category: '力量', description: '仰卧臂屈伸是一种手臂训练动作，主要锻炼肱三头肌长头。', instructions: '1. 仰卧在平板凳上，双手握哑铃或杠铃\n2. 手臂伸直，垂直于地面\n3. 缓慢弯曲手肘，将重量向头部方向下降\n4. 推起重量回到起始位置', tips: ['保持上臂固定，只移动前臂', '下降时控制速度，避免反弹', '推起时呼气，下降时吸气'], commonMistakes: ['上臂移动', '下降过快', '手腕弯曲'], equipment: '哑铃/杠铃', difficulty: '中等' },
  { id: 'b13', name: '单腿哑铃硬拉',        muscleGroup: 'legs',    category: '力量', description: '单腿哑铃硬拉是一种腿部训练动作，主要锻炼腘绳肌、臀大肌和核心肌群。', instructions: '1. 单脚站立，另一只脚向后抬起\n2. 双手握哑铃，手臂自然下垂\n3. 保持背部挺直，向前弯曲身体\n4. 直到哑铃接近地面\n5. 用后腿的力量拉起身体回到起始位置', tips: ['保持背部挺直，避免弯腰', '核心收紧，保持平衡', '动作要控制，避免晃动'], commonMistakes: ['背部弯曲', '失去平衡', '动作过快'], equipment: '哑铃', difficulty: '中等' },
  { id: 'b14', name: '保加利亚分腿蹲',      muscleGroup: 'legs',    category: '力量', description: '保加利亚分腿蹲是一种腿部训练动作，主要锻炼股四头肌、腘绳肌和臀大肌。', instructions: '1. 站在长凳前，将一只脚放在凳面上\n2. 另一只脚向前迈出一步\n3. 保持胸部挺直，核心收紧\n4. 弯曲前腿，下降身体\n5. 直到前大腿与地面平行\n6. 推起身体回到起始位置', tips: ['保持前膝盖与脚尖方向一致', '核心收紧，保持平衡', '控制动作速度'], commonMistakes: ['膝盖内扣', '身体过度前倾', '动作范围不足'], equipment: '长凳', difficulty: '中等' },
  { id: 'b15', name: '高脚杯深蹲',          muscleGroup: 'legs',    category: '力量', description: '高脚杯深蹲是一种腿部训练动作，主要锻炼股四头肌、臀大肌和核心肌群。', instructions: '1. 双手握住哑铃或壶铃，放在胸前\n2. 双脚与肩同宽，脚尖稍向外\n3. 保持胸部挺直，核心收紧\n4. 弯曲膝盖和髋关节，下降身体\n5. 直到大腿与地面平行\n6. 推起身体回到起始位置', tips: ['保持核心收紧，背部挺直', '重心在脚后跟', '控制动作速度'], commonMistakes: ['背部弯曲', '膝盖内扣', '深度不够'], equipment: '哑铃/壶铃', difficulty: '中等' },
  { id: 'b16', name: '杠铃罗马尼亚硬拉',    muscleGroup: 'legs',    category: '力量', description: '杠铃罗马尼亚硬拉是一种腿部训练动作，主要锻炼腘绳肌、臀大肌和竖脊肌。', instructions: '1. 站在杠铃前，双脚与肩同宽\n2. 弯腰抓住杠铃，双手与肩同宽\n3. 保持背部挺直，膝盖微屈\n4. 向前弯曲身体，直到杠铃接近地面\n5. 用臀部力量拉起杠铃回到起始位置', tips: ['保持背部挺直，避免弯腰', '膝盖微屈，不要完全伸直', '控制动作速度'], commonMistakes: ['背部弯曲', '膝盖完全伸直', '动作过快'], equipment: '杠铃', difficulty: '中等' },
  { id: 'b17', name: '山羊挺身',            muscleGroup: 'back',    category: '力量', description: '山羊挺身是一种背部训练动作，主要锻炼竖脊肌和臀大肌。', instructions: '1. 俯卧在山羊挺身机上，髋部放在垫子上\n2. 双脚固定在器械上\n3. 身体自然下垂\n4. 收紧核心，抬起上半身\n5. 直到身体成一条直线\n6. 缓慢放下回到起始位置', tips: ['保持核心收紧', '动作要控制，避免摆动', '感受背部肌肉的收缩'], commonMistakes: ['过度抬头或低头', '动作过快', '腰部过度伸展'], equipment: '山羊挺身机', difficulty: '中等' },
  { id: 'b18', name: '单手钢线下拉',        muscleGroup: 'back',    category: '力量', description: '单手钢线下拉是一种背部训练动作，主要锻炼背阔肌和大圆肌。', instructions: '1. 站在钢线机前，单手握住手柄\n2. 保持核心收紧，身体略微向后倾斜\n3. 拉动手柄向同侧髋部方向\n4. 缓慢回到起始位置', tips: ['保持核心收紧，避免身体过度摆动', '拉动时感受背部肌肉的收缩', '控制动作速度'], commonMistakes: ['身体过度摆动', '动作范围不足', '只用手臂力量'], equipment: '钢线机', difficulty: '中等' },
  { id: 'b19', name: '单手器械划船',        muscleGroup: 'back',    category: '力量', description: '单手器械划船是一种背部训练动作，主要锻炼背阔肌、大圆肌和菱形肌。', instructions: '1. 坐在器械上，单手握住手柄\n2. 另一只手支撑在器械上\n3. 保持背部挺直，核心收紧\n4. 拉动手柄向胸部方向\n5. 缓慢回到起始位置', tips: ['保持背部挺直，避免扭曲', '拉动时感受背部肌肉的收缩', '控制动作速度'], commonMistakes: ['背部扭曲', '动作范围不足', '只用手臂力量'], equipment: '划船机', difficulty: '中等' },
  { id: 'b20', name: '对握下拉',            muscleGroup: 'back',    category: '力量', description: '对握下拉是一种背部训练动作，主要锻炼背阔肌和大圆肌。', instructions: '1. 坐在下拉机前，双手对握手柄\n2. 保持核心收紧，背部挺直\n3. 拉动手柄向胸部方向\n4. 缓慢回到起始位置', tips: ['保持核心收紧，背部挺直', '拉动时感受背部肌肉的收缩', '控制动作速度'], commonMistakes: ['身体过度后倾', '动作范围不足', '只用手臂力量'], equipment: '下拉机', difficulty: '中等' },
  { id: 'b21', name: '开肘划船',            muscleGroup: 'back',    category: '力量', description: '开肘划船是一种背部训练动作，主要锻炼上背部肌群，如菱形肌和中斜方肌。', instructions: '1. 站在钢线机前，双手握住手柄\n2. 保持核心收紧，身体略微向前倾斜\n3. 肘部向外展开，拉动手柄向胸部方向\n4. 缓慢回到起始位置', tips: ['保持核心收紧，背部挺直', '肘部向外展开，不要贴近身体', '控制动作速度'], commonMistakes: ['背部弯曲', '肘部贴近身体', '动作范围不足'], equipment: '钢线机', difficulty: '中等' },
  { id: 'b22', name: '杠铃卧推',            muscleGroup: 'chest',   category: '力量', description: '杠铃卧推是一种基础的胸部训练动作，主要锻炼胸大肌、三角肌前束和肱三头肌。', instructions: '1. 仰卧在平板凳上，双脚平放在地面\n2. 双手握杠，宽度略宽于肩\n3. 控制杠铃缓慢下降到胸部\n4. 推起杠铃回到起始位置', tips: ['保持核心收紧，背部贴紧凳面', '下降时控制速度，避免反弹', '推起时呼气，下降时吸气'], commonMistakes: ['腰部拱起', '手腕弯曲', '下降过快'], equipment: '杠铃', difficulty: '中等' },
  { id: 'b23', name: '上斜哑铃卧推',        muscleGroup: 'chest',   category: '力量', description: '上斜哑铃卧推是一种胸部训练动作，主要锻炼上胸肌、三角肌前束和肱三头肌。', instructions: '1. 仰卧在上斜凳上，双脚平放在地面\n2. 双手握哑铃，手臂伸直\n3. 控制哑铃缓慢下降到胸部两侧\n4. 推起哑铃回到起始位置', tips: ['保持核心收紧，背部贴紧凳面', '下降时控制速度，避免反弹', '推起时呼气，下降时吸气'], commonMistakes: ['腰部拱起', '手腕弯曲', '下降过快'], equipment: '哑铃', difficulty: '中等' },
  { id: 'b24', name: '胸肌飞鸟',            muscleGroup: 'chest',   category: '力量', description: '胸肌飞鸟是一种胸部训练动作，主要锻炼胸大肌和胸小肌。', instructions: '1. 仰卧在平板凳上，双手握哑铃，手臂伸直\n2. 保持手臂微屈，缓慢将哑铃向身体两侧下降\n3. 感受到胸部拉伸后，用力夹起回到起始位置', tips: ['保持手臂微屈，避免完全伸直', '感受胸部肌肉的拉伸和收缩', '控制动作速度'], commonMistakes: ['手臂完全伸直', '下降过低', '动作过快'], equipment: '哑铃', difficulty: '中等' },
  { id: 'b25', name: '俯卧撑',              muscleGroup: 'chest',   category: '力量', description: '俯卧撑是一种自重训练动作，主要锻炼胸大肌、三角肌前束和肱三头肌。', instructions: '1. 双手撑地，与肩同宽或略宽\n2. 身体保持一条直线\n3. 弯曲手肘，下降身体直到胸部接近地面\n4. 推起身体回到起始位置', tips: ['保持身体成一条直线', '核心收紧', '下降时吸气，推起时呼气'], commonMistakes: ['臀部抬起或下沉', '下降不够深', '动作过快'], equipment: '无', difficulty: '简单' },
  { id: 'b26', name: '双杠臂屈伸',           muscleGroup: 'chest',   category: '力量', description: '双杠臂屈伸是一种复合训练动作，主要锻炼胸大肌下部和肱三头肌。', instructions: '1. 双手撑在双杠上，身体悬空\n2. 保持身体直立或微微前倾\n3. 弯曲手肘，下降身体直到上臂与地面平行\n4. 推起身体回到起始位置', tips: ['身体略微前倾更多锻炼胸部', '身体直立更多锻炼三头', '控制下降速度'], commonMistakes: ['下降不够深', '身体过度前倾', '动作过快'], equipment: '双杠', difficulty: '中等' },
  { id: 'b27', name: '胸肌夹胸',            muscleGroup: 'chest',   category: '力量', description: '胸肌夹胸是一种绳索训练动作，主要锻炼胸大肌中缝。', instructions: '1. 站在龙门架中间，双手握住绳索手柄\n2. 身体略微前倾，手臂微屈\n3. 用力将手柄在身前合拢，挤压胸肌\n4. 缓慢回到起始位置', tips: ['感受胸肌的收缩', '保持手臂微屈', '控制动作速度'], commonMistakes: ['手臂完全伸直', '身体过度前倾', '动作过快'], equipment: '龙门架', difficulty: '简单' },
  { id: 'b28', name: '上斜卧推',            muscleGroup: 'chest',   category: '力量', description: '上斜卧推是一种胸部训练动作，主要锻炼上胸肌。', instructions: '1. 仰卧在上斜凳上，角度约30-45度\n2. 双手握杠，宽度略宽于肩\n3. 控制杠铃缓慢下降到上胸部\n4. 推起杠铃回到起始位置', tips: ['角度不要超过45度', '保持核心收紧', '推起时呼气'], commonMistakes: ['角度过高', '腰部拱起', '下降过快'], equipment: '杠铃', difficulty: '中等' },
  { id: 'b29', name: '下斜卧推',            muscleGroup: 'chest',   category: '力量', description: '下斜卧推是一种胸部训练动作，主要锻炼下胸肌。', instructions: '1. 仰卧在下斜凳上，双脚固定\n2. 双手握杠，宽度略宽于肩\n3. 控制杠铃缓慢下降到下胸部\n4. 推起杠铃回到起始位置', tips: ['双脚必须固定好', '保持核心收紧', '控制下降速度'], commonMistakes: ['双脚未固定', '腰部拱起', '下降过快'], equipment: '杠铃', difficulty: '中等' },
  { id: 'b30', name: '腹肌卷腹',            muscleGroup: 'abs',     category: '力量', description: '腹肌卷腹是一种腹部训练动作，主要锻炼腹直肌。', instructions: '1. 仰卧在地上，双腿弯曲，双脚平放\n2. 双手放在耳侧或胸前\n3. 收缩腹肌，上背部离开地面\n4. 缓慢回到起始位置', tips: ['不要用力拉头', '动作幅度不需要太大', '感受腹肌收缩'], commonMistakes: ['用力拉头', '动作幅度过大', '憋气'], equipment: '无', difficulty: '简单' },
  { id: 'b31', name: '仰卧起坐',            muscleGroup: 'abs',     category: '力量', description: '仰卧起坐是一种腹部训练动作，主要锻炼腹直肌和髂腰肌。', instructions: '1. 仰卧在地上，双腿弯曲，双脚平放\n2. 双手放在耳侧或胸前\n3. 收缩腹肌，上半身完全抬起\n4. 缓慢回到起始位置', tips: ['双手不要用力拉头', '动作要缓慢控制', '感受腹肌发力'], commonMistakes: ['用力拉头', '惯性摆动', '动作过快'], equipment: '无', difficulty: '简单' },
  { id: 'b32', name: '悬垂举腿',            muscleGroup: 'abs',     category: '力量', description: '悬垂举腿是一种腹部训练动作，主要锻炼下腹肌和髂腰肌。', instructions: '1. 双手握住单杠，身体悬空\n2. 保持身体直立，核心收紧\n3. 抬起双腿直到与地面平行或更高\n4. 缓慢放下双腿回到起始位置', tips: ['避免摆动', '保持核心收紧', '控制下降速度'], commonMistakes: ['身体摆动', '动作过快', '弯腰'], equipment: '单杠', difficulty: '困难' },
  { id: 'b33', name: '侧平板支撑',          muscleGroup: 'abs',     category: '力量', description: '侧平板支撑是一种核心训练动作，主要锻炼腹斜肌和腹横肌。', instructions: '1. 侧卧，用一只前臂和脚侧支撑身体\n2. 身体保持一条直线\n3. 收紧核心，保持身体稳定\n4. 坚持指定时间后换边', tips: ['保持身体成一条直线', '收紧核心', '均匀呼吸'], commonMistakes: ['臀部下垂', '身体前倾或后仰', '憋气'], equipment: '无', difficulty: '简单' },
  { id: 'b34', name: '俄罗斯转体',          muscleGroup: 'abs',     category: '力量', description: '俄罗斯转体是一种腹部训练动作，主要锻炼腹斜肌。', instructions: '1. 坐在地上，双腿弯曲抬起，脚离地\n2. 身体微微向后倾斜，保持背部挺直\n3. 双手握拳或持哑铃，左右转动身体\n4. 手臂跟随身体转动，触碰地面', tips: ['保持脚离地增加难度', '感受腹斜肌发力', '控制转动幅度'], commonMistakes: ['脚落地', '只用臂力', '动作过快'], equipment: '哑铃（可选）', difficulty: '中等' },
  { id: 'b35', name: '登山者',              muscleGroup: 'abs',     category: '力量', description: '登山者是一种全身训练动作，主要锻炼核心和有氧心肺功能。', instructions: '1. 俯卧撑姿势准备\n2. 右腿向前跑向胸部\n3. 快速换腿，左腿向前\n4. 交替进行', tips: ['保持核心收紧', '节奏要快', '保持俯卧撑姿势稳定'], commonMistakes: ['臀部抬高', '动作过慢', '身体晃动'], equipment: '无', difficulty: '中等' },
];

const muscleGroupOptions = [
  { value: 'chest',     label: '胸部', color: '#FF6B6B' },
  { value: 'back',      label: '背部', color: '#60A5FA' },
  { value: 'shoulders', label: '肩部', color: '#A855F7' },
  { value: 'arms',      label: '手臂', color: '#FBBF24' },
  { value: 'legs',      label: '腿部', color: '#34D399' },
  { value: 'abs',       label: '腹部', color: '#F472B6' },
];

const difficultyOptions = ['简单', '中等', '困难'];

// 训练建议和常见错误的输入组件
const TipInput = ({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) => (
  <div className="space-y-2">
    {values.map((tip, i) => (
      <div key={i} className="flex gap-2">
        <input
          value={tip}
          onChange={(e) => {
            const next = [...values];
            next[i] = e.target.value;
            onChange(next);
          }}
          placeholder={placeholder || `建议 ${i + 1}`}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-zinc-500"
        />
        {values.length > 1 && (
          <button 
            onClick={() => onChange(values.filter((_, j) => j !== i))} 
            className="px-2 text-zinc-500 hover:text-red-400 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>
    ))}
    <button
      onClick={() => onChange([...values, ''])}
      className="text-xs text-zinc-500 hover:text-zinc-300"
    >+ 添加建议</button>
  </div>
);

export default function ExercisesPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [dbCustomExercises, setDbCustomExercises] = useState<Exercise[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSelectingExercise, setIsSelectingExercise] = useState(false);
  const [selectedTrainingExercise, setSelectedTrainingExercise] = useState<Exercise | null>(null);

  const [newForm, setNewForm] = useState({
    name: '', muscleGroup: 'chest', difficulty: '中等',
    equipment: '', description: '', instructions: '',
    tips: [''], commonMistakes: ['']
  });

  useEffect(() => {
    loadCustomExercises();
  }, []);

  const loadCustomExercises = async () => {
    setDbLoading(true);
    try {
      const exercises = await getUserCustomExercises();
      setDbCustomExercises(exercises);
    } catch (e) {
      logger.error('加载自定义动作失败:', e);
    } finally {
      setDbLoading(false);
    }
  };

  // 合并内置 + 数据库自定义动作
  const allExercises = [
    ...BUILT_IN_EXERCISES,
    ...dbCustomExercises.map(ex => ({ ...ex, isCustom: true }))
  ];

  const filteredExercises = allExercises.filter(ex => {
    const matchesGroup = selectedFilter === 'all' || selectedFilter === 'mine'
      ? true
      : ex.muscleGroup === selectedFilter;
    const matchesMine = selectedFilter !== 'mine' || (ex as any).isCustom === true;
    const matchesSearch = !searchTerm ||
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.description && ex.description.includes(searchTerm));
    return matchesGroup && matchesMine && matchesSearch;
  });

  const getMuscleGroupColor = (group: string) => {
    const found = muscleGroupOptions.find(g => g.value === group);
    return found ? found.color : '#999';
  };

  const getMuscleGroupLabel = (group: string) => {
    const found = muscleGroupOptions.find(g => g.value === group);
    return found ? found.label : group;
  };

  const difficultyColors: Record<string, string> = {
    '简单': '#34D399', '中等': '#FBBF24', '困难': '#F87171'
  };

  // 添加新动作
  const handleAddExercise = async () => {
    if (!newForm.name.trim()) return;
    setSaving(true);
    try {
      await createCustomExercise(newForm.name, newForm.muscleGroup, {
        difficulty: newForm.difficulty,
        equipment: newForm.equipment || undefined,
        description: newForm.description || undefined,
        instructions: newForm.instructions || undefined,
        tips: newForm.tips.filter(t => t.trim()),
        commonMistakes: newForm.commonMistakes.filter(m => m.trim())
      });
      await loadCustomExercises();
      setShowAddModal(false);
      setNewForm({ name: '', muscleGroup: 'chest', difficulty: '中等', equipment: '', description: '', instructions: '', tips: [''], commonMistakes: [''] });
    } finally {
      setSaving(false);
    }
  };

  // 打开编辑弹窗
  const openEditModal = (exercise: Exercise) => {
    if (!exercise.isCustom) {
      // 内置动作只能查看，不能编辑
      setSelectedExercise(exercise);
      return;
    }
    setEditTarget({ ...exercise });
    setShowEditModal(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateCustomExercise(editTarget.id, {
        name: editTarget.name,
        muscleGroup: editTarget.muscleGroup,
        difficulty: editTarget.difficulty || undefined,
        equipment: editTarget.equipment || undefined,
        description: editTarget.description || undefined,
        instructions: editTarget.instructions || undefined,
        tips: editTarget.tips?.filter(t => t.trim()) || [],
        commonMistakes: editTarget.commonMistakes?.filter(m => m.trim()) || []
      });
      await loadCustomExercises();
      setShowEditModal(false);
      setEditTarget(null);
    } finally {
      setSaving(false);
    }
  };

  // 删除动作
  const handleDeleteExercise = async (exercise: Exercise) => {
    if (!exercise.isCustom) return;
    if (!confirm(`确定删除动作"${exercise.name}"？`)) return;
    await deleteCustomExercise(exercise.id);
    await loadCustomExercises();
    if (selectedExercise?.id === exercise.id) setSelectedExercise(null);
    if (editTarget?.id === exercise.id) { setShowEditModal(false); setEditTarget(null); }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(100,116,139,0.06) 0%, transparent 60%)'
      }} />

      <div className="relative max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">动作库</h1>
              <p className="text-sm text-zinc-500">专业动作指导与技巧</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!dbLoading && (
              <span className="text-sm text-zinc-500">{filteredExercises.length} 个动作</span>
            )}
            {selectedTrainingExercise ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${getMuscleGroupColor(selectedTrainingExercise.muscleGroup)}18` }}>
                    <Dumbbell className="w-4 h-4" style={{ color: getMuscleGroupColor(selectedTrainingExercise.muscleGroup) }} />
                  </div>
                  <span className="text-sm font-semibold text-white">{selectedTrainingExercise.name.split(' (')[0]}</span>
                </div>
                <button
                  onClick={() => setSelectedTrainingExercise(null)}
                  className="px-3 py-2 rounded-xl bg-zinc-700 text-white text-sm hover:bg-zinc-600 transition-colors"
                >
                  更换动作
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSelectingExercise(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                选择动作
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加动作
            </button>
          </div>
        </div>

        {!selectedTrainingExercise && (
          <>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索动作名称..."
                  className="w-full rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 text-sm bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-zinc-600 transition-colors"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-zinc-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap mb-8">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setSelectedFilter('mine')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedFilter === 'mine'
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                我的
              </button>
              {muscleGroupOptions.map((group) => (
                <button
                  key={group.value}
                  onClick={() => setSelectedFilter(group.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedFilter === group.value
                      ? 'text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                  }`}
                  style={selectedFilter === group.value ? { background: group.color } : {}}
                >
                  {group.label}
                </button>
              ))}
            </div>

            {/* Loading */}
            {dbLoading && (
              <div className="flex items-center justify-center h-40 gap-3">
                <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                <span className="text-sm text-zinc-500">加载自定义动作...</span>
              </div>
            )}

            {/* Grid */}
            {!dbLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="rounded-2xl p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer"
                    onClick={() => {
                      if (isSelectingExercise) {
                        setSelectedTrainingExercise(exercise);
                        setIsSelectingExercise(false);
                      } else {
                        setSelectedExercise(exercise);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${getMuscleGroupColor(exercise.muscleGroup)}18` }}>
                          <Dumbbell className="w-5 h-5" style={{ color: getMuscleGroupColor(exercise.muscleGroup) }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white truncate">{exercise.name.split(' (')[0]}</h3>
                          <p className="text-xs text-zinc-500">{getMuscleGroupLabel(exercise.muscleGroup)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* 编辑按钮 */}
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(exercise); }}
                          className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                          title={exercise.isCustom ? '编辑动作' : '查看动作'}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                        </button>
                        {/* 删除按钮（仅自定义） */}
                        {exercise.isCustom && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteExercise(exercise); }}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="删除动作"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    {exercise.description && (
                      <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{exercise.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {exercise.difficulty && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{ background: `${difficultyColors[exercise.difficulty]}18`, color: difficultyColors[exercise.difficulty] }}>
                          {exercise.difficulty}
                        </span>
                      )}
                      {exercise.equipment && (
                        <span className="px-2 py-0.5 rounded-md text-xs bg-zinc-800 text-zinc-500">
                          {exercise.equipment}
                        </span>
                      )}
                      {exercise.isCustom && (
                        <span className="px-2 py-0.5 rounded-md text-xs bg-amber-500/15 text-amber-400 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" /> 自定义
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ========== 动作详情弹窗 ========== */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedExercise(null)}>
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${getMuscleGroupColor(selectedExercise.muscleGroup)}18` }}>
                  <Dumbbell className="w-5 h-5" style={{ color: getMuscleGroupColor(selectedExercise.muscleGroup) }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedExercise.name}</h2>
                  <p className="text-xs text-zinc-500">
                    {getMuscleGroupLabel(selectedExercise.muscleGroup)} · {selectedExercise.category}
                    {selectedExercise.isCustom && <span className="ml-2 text-amber-400">· 自定义动作</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedExercise(null)} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedExercise.description && (
                <p className="text-sm text-zinc-400">{selectedExercise.description}</p>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {selectedExercise.difficulty && (
                  <div className="rounded-xl p-4 bg-zinc-950 border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">难度</div>
                    <span className="text-sm font-semibold" style={{ color: difficultyColors[selectedExercise.difficulty] }}>
                      {selectedExercise.difficulty}
                    </span>
                  </div>
                )}
                {selectedExercise.equipment && (
                  <div className="rounded-xl p-4 bg-zinc-950 border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">器械</div>
                    <p className="text-sm font-semibold text-zinc-300">{selectedExercise.equipment}</p>
                  </div>
                )}
              </div>

              {selectedExercise.instructions && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-base font-semibold text-white">执行步骤</h3>
                  </div>
                  <pre className="rounded-xl p-4 text-sm whitespace-pre-wrap bg-zinc-950 border border-zinc-800 text-zinc-400 font-sans">
                    {selectedExercise.instructions}
                  </pre>
                </div>
              )}

              {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-semibold text-white">训练建议</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedExercise.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-xl p-3 bg-emerald-500/5 border border-emerald-500/15">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-400">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedExercise.commonMistakes && selectedExercise.commonMistakes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-base font-semibold text-white">常见错误</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedExercise.commonMistakes.map((m, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-xl p-3 bg-amber-500/5 border border-amber-500/15">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-400">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 flex gap-3 bg-zinc-900 border-t border-zinc-800">
              <button onClick={() => setSelectedExercise(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                关闭
              </button>
              <button
                onClick={() => { setSelectedExercise(null); router.push(`/workout?exercise=${encodeURIComponent(selectedExercise.name)}`); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-black hover:bg-zinc-200"
              >
                <Zap className="w-4 h-4" />开始训练
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 添加动作弹窗 ========== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}>
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 z-10">
              <h2 className="text-lg font-bold text-white">添加新动作</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">动作名称 *</label>
                <input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500"
                  placeholder="例如：哑铃牧师凳弯举" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">主练肌群</label>
                  <select value={newForm.muscleGroup}
                    onChange={(e) => setNewForm({ ...newForm, muscleGroup: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500">
                    {muscleGroupOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">难度</label>
                  <select value={newForm.difficulty}
                    onChange={(e) => setNewForm({ ...newForm, difficulty: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500">
                    {difficultyOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">器械需求</label>
                <input value={newForm.equipment}
                  onChange={(e) => setNewForm({ ...newForm, equipment: e.target.value })}
                  placeholder="例如：哑铃、杠铃、龙门架"
                  className="w-full rounded-xl px-4 py-3 text-white text-sm bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">动作描述</label>
                <textarea value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="简要描述这个动作锻炼哪些肌群"
                  className="w-full rounded-xl px-4 py-3 text-white text-sm min-h-[80px] resize-none bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">执行步骤</label>
                <textarea value={newForm.instructions}
                  onChange={(e) => setNewForm({ ...newForm, instructions: e.target.value })}
                  placeholder="每行一个步骤，例如：\n1. 仰卧在平板凳上\n2. 双手握杠，宽度略宽于肩\n3. 控制速度下降\n4. 推起回到起始位置"
                  className="w-full rounded-xl px-4 py-3 text-white text-sm min-h-[100px] resize-none bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500 font-sans" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">训练建议</label>
                <TipInput values={newForm.tips} onChange={(v) => setNewForm({ ...newForm, tips: v })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">常见错误</label>
                <TipInput values={newForm.commonMistakes} onChange={(v) => setNewForm({ ...newForm, commonMistakes: v })} />
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-4 flex gap-3 bg-zinc-900 border-t border-zinc-800">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                取消
              </button>
              <button
                onClick={handleAddExercise}
                disabled={saving || !newForm.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />保存中...</> : <><Plus className="w-4 h-4" />添加动作</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 编辑自定义动作弹窗 ========== */}
      {showEditModal && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowEditModal(false)}>
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 z-10">
              <h2 className="text-lg font-bold text-white">编辑动作</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">动作名称 *</label>
                <input value={editTarget.name}
                  onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">主练肌群</label>
                  <select value={editTarget.muscleGroup}
                    onChange={(e) => setEditTarget({ ...editTarget, muscleGroup: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500">
                    {muscleGroupOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">难度</label>
                  <select value={editTarget.difficulty || '中等'}
                    onChange={(e) => setEditTarget({ ...editTarget, difficulty: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500">
                    {difficultyOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">器械需求</label>
                <input value={editTarget.equipment || ''}
                  onChange={(e) => setEditTarget({ ...editTarget, equipment: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">动作描述</label>
                <textarea value={editTarget.description || ''}
                  onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm min-h-[80px] resize-none bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">执行步骤</label>
                <textarea value={editTarget.instructions || ''}
                  onChange={(e) => setEditTarget({ ...editTarget, instructions: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm min-h-[100px] resize-none bg-zinc-950 border border-zinc-700 focus:outline-none focus:border-zinc-500 font-sans" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">训练建议</label>
                <TipInput values={editTarget.tips || ['']} onChange={(v) => setEditTarget({ ...editTarget, tips: v })} placeholder="训练建议" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">常见错误</label>
                <TipInput values={editTarget.commonMistakes || ['']} onChange={(v) => setEditTarget({ ...editTarget, commonMistakes: v })} placeholder="常见错误" />
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-4 flex gap-3 bg-zinc-900 border-t border-zinc-800">
              <button onClick={() => { setShowEditModal(false); setEditTarget(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editTarget.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />保存中...</> : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
