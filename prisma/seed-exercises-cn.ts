/**
 * 中文健身动作库（含详细描述与分步指导）
 * 运行: npx tsx prisma/seed-exercises-cn.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface Ex {
  name: string; nameEn: string;
  muscleGroup: string; category: string; equipment: string | null; difficulty: string;
  description: string; instructions: string[]; tips: string[]; commonMistakes: string[];
}

const exercises: Ex[] = [
  // ─── 胸部 ───
  { name:'杠铃卧推', nameEn:'Barbell Bench Press', muscleGroup:'chest', category:'compound', equipment:'Barbell', difficulty:'中等',
    description:'卧推是最经典的胸部复合动作，主要刺激胸大肌中部，同时锻炼三角肌前束和肱三头肌。',
    instructions:['握距略宽于肩，背部贴凳，脚踩实地面，肩胛骨夹紧收回。','深吸气，杠铃缓慢下落至乳头线，肘约呈45°。','呼气，以胸肌发力将杠铃推回，轨迹呈微弧线。','每组结束后缓慢归架。'],
    tips:['想象用胸肌"夹住"杠铃向上推。','保持腰部自然弓形，不要过度拱腰。'],
    commonMistakes:['臀部抬离凳面借力。','握距过窄导致三头肌过度代偿。'] },

  { name:'上斜杠铃卧推', nameEn:'Incline Barbell Bench Press', muscleGroup:'chest', category:'compound', equipment:'Barbell', difficulty:'中等',
    description:'凳面30°角将重心转移至胸大肌上束，有效改善胸部上缘线条。',
    instructions:['凳面调至30°，握距略宽于肩，肩胛骨贴紧收回。','杠铃下落至上胸（锁骨下方），肘关节微外展。','呼气以上胸发力推起。','保持臀部不离开凳面。'],
    tips:['角度不超过45°，过大变成肩部推举。','控制下落节奏，约2秒。'],
    commonMistakes:['凳面角度过大。','下落位置偏低至腹部。'] },

  { name:'哑铃卧推', nameEn:'Dumbbell Bench Press', muscleGroup:'chest', category:'compound', equipment:'Dumbbell', difficulty:'中等',
    description:'哑铃卧推允许双臂独立运动，弥补双侧力量不平衡，胸肌拉伸幅度更大。',
    instructions:['坐于凳边用膝盖顶起哑铃，同步躺下至训练位置。','肘关节略低于肩，手心朝前。','吸气下落至肘与凳面平行，充分拉伸胸肌。','呼气以胸肌发力推起，顶部两铃靠近不相碰。'],
    tips:['顶部两铃靠近保持张力。','结束后弯肘将哑铃放回大腿再起身。'],
    commonMistakes:['哑铃间距过宽导致肩关节承压。','只做半程动作。'] },

  { name:'哑铃飞鸟', nameEn:'Dumbbell Fly', muscleGroup:'chest', category:'isolation', equipment:'Dumbbell', difficulty:'简单',
    description:'通过大范围弧线运动最大化拉伸胸大肌，激活胸部肌纤维，常用于胸部训练补充。',
    instructions:['躺平于凳，手臂向上伸直，手心相对，肘关节保持微弯（约10°）。','吸气，双臂沿弧线向两侧打开至充分拉伸，底部短暂停顿。','呼气，以"拥抱大树"的感觉将哑铃合拢。','全程保持肘关节略弯不可完全伸直。'],
    tips:['顶部两铃不相碰，保持张力。','重量宁轻勿重以维持弧线轨迹。'],
    commonMistakes:['将飞鸟变成按压动作。','下落过低致肩关节拉伤。'] },

  { name:'绳索夹胸', nameEn:'Cable Crossover', muscleGroup:'chest', category:'isolation', equipment:'Cable', difficulty:'简单',
    description:'绳索提供全程恒定张力，有效刺激胸肌内侧，改善胸中缝线条。',
    instructions:['站于绳索架中间，两侧高位各抓手柄，身体微前倾。','双臂向前向下做弧线运动，在身体前方汇聚。','终点停顿1-2秒挤压胸肌，然后控制回位。','躯干固定，只让手臂做弧线运动。'],
    tips:['终点挤压是关键。','两脚前后站立增加稳定性。'],
    commonMistakes:['肘关节弯曲过多变成推的动作。','躯干随动作摇摆借力。'] },

  { name:'俯卧撑', nameEn:'Push-up', muscleGroup:'chest', category:'compound', equipment:'Bodyweight', difficulty:'简单',
    description:'最基础的上肢推力动作，无需器械有效锻炼胸大肌、三头肌和三角肌前束。',
    instructions:['双手撑地略宽于肩，脚尖点地，身体从头到脚成一直线。','收紧腹部和臀部，弯肘控制身体向下，胸部接近不触地。','呼气推起恢复初始位，手臂接近伸直。','保持全程身体绷直。'],
    tips:['无法完成可从跪姿开始练习。','宽握增加胸肌刺激，窄握增加三头肌参与。'],
    commonMistakes:['臀部高翘身体不成直线。','只做半程肘关节未充分弯曲。'] },

  { name:'双杠臂屈伸（胸肌向）', nameEn:'Chest Dips', muscleGroup:'chest', category:'compound', equipment:'Bodyweight', difficulty:'中等',
    description:'身体前倾角度将重心转移至胸肌，有效刺激胸大肌下束。',
    instructions:['双手握双杠撑起，膝盖弯曲向后，身体前倾15-30°。','吸气，弯肘缓慢下落至肩关节略低于肘，感受胸肌拉伸。','呼气以胸肌发力推起，肘关节不完全锁死。','全程保持躯干前倾角度。'],
    tips:['下落深度根据肩关节灵活性调整。','熟练后可挂杠铃片增加负重。'],
    commonMistakes:['身体过于直立变成三头肌主导。','下落速度过快冲击肩关节。'] },

  { name:'夹胸', nameEn:'Chest Fly', muscleGroup:'chest', category:'isolation', equipment:'Machine', difficulty:'简单',
    description:'通过器械或哑铃弧线合拢，孤立刺激胸大肌内侧，增强胸中缝线条。',
    instructions:['调整器械或躺凳，手臂向两侧展开呈弧形。','呼气，以胸肌发力将双臂在身体前方合拢。','顶点停顿挤压胸肌1秒。','吸气缓慢回放，充分拉伸胸肌。'],
    tips:['全程保持肘关节微弯，避免肘关节锁死。','顶点挤压是关键，重量宁轻勿重。'],
    commonMistakes:['用手臂发力代替胸肌。','重量过大导致动作变形。'] },

  { name:'蝴蝶机夹胸', nameEn:'Machine Pec Deck', muscleGroup:'chest', category:'isolation', equipment:'Machine', difficulty:'简单',
    description:'轨迹固定的胸部孤立器械动作，安全性高，初学者也能精准感受胸肌收缩。',
    instructions:['调整座椅高度使把手与肩同高，背部贴紧靠垫。','双臂抵住臂垫，初始位置双臂向两侧张开。','呼气，胸肌发力将双臂向前合拢，顶部停顿1秒。','吸气，缓慢回到初始位置充分拉伸。'],
    tips:['终点挤压想象"夹住一个物体"。','选择能控制10-15次的重量。'],
    commonMistakes:['手臂发力代替胸肌。','回程速度过快失去离心刺激。'] },

  // ─── 背部 ───
  { name:'引体向上', nameEn:'Pull-up', muscleGroup:'back', category:'compound', equipment:'Bodyweight', difficulty:'中等',
    description:'背部黄金复合动作，主要锻炼背阔肌和大圆肌，同时刺激二头肌和核心。',
    instructions:['正手握单杠，握距略宽于肩，手臂伸直悬挂。','收紧核心和肩胛骨，以背阔肌发力向上拉，肘关节向下向外。','拉至下巴超过单杠，短暂停顿。','缓慢控制身体下落至充分伸展。'],
    tips:['感受"用肘关节入后口袋"激活背阔肌。','初学者可用弹力带辅助。'],
    commonMistakes:['用肩膀耸起代替背部发力。','摆动身体借力。'] },

  { name:'高位下拉', nameEn:'Lat Pulldown', muscleGroup:'back', category:'compound', equipment:'Cable', difficulty:'简单',
    description:'引体向上的替代/辅助动作，通过调节重量让不同水平训练者精准锻炼背阔肌。',
    instructions:['腿垫固定大腿，正手宽握手柄，身体微后仰约10-15°。','呼气，背阔肌发力将手柄下拉至下巴或上胸。','最低点挤压背阔肌保持1秒。','吸气缓慢回升充分拉伸背阔肌。'],
    tips:['手只是"挂钩"，用背部发力而非手臂。','可用助力带减少前臂疲劳。'],
    commonMistakes:['拉到颈部后方增加颈椎风险。','身体过于后仰变成划船动作。'] },

  { name:'俯身杠铃划船', nameEn:'Bent-over Barbell Row', muscleGroup:'back', category:'compound', equipment:'Barbell', difficulty:'困难',
    description:'背部厚度训练的王者，主要锻炼中背部和背阔肌，是增大背部体积最高效的动作之一。',
    instructions:['握杠与深蹲站距相似，膝盖微弯，髋关节铰链向前，上身与地面约45-60°。','双臂自然下垂，背部保持平直。','呼气，收缩背部将杠铃拉向肚脐，肘沿身体侧面向后。','吸气缓慢放下，充分伸展。'],
    tips:['"夹住一支铅笔"让肩胛骨靠拢。','核心始终收紧防止腰椎弯曲。'],
    commonMistakes:['腰椎弓起（猫背）极易受伤。','用爆发力摆荡杠铃失去控制。'] },

  { name:'单臂哑铃划船', nameEn:'Dumbbell Row', muscleGroup:'back', category:'compound', equipment:'Dumbbell', difficulty:'简单',
    description:'单侧独立训练，纠正双侧力量不平衡，对背阔肌的孤立效果更好。',
    instructions:['非训练侧手和同侧膝盖支撑凳上，身体与地面平行。','训练侧手握哑铃，手臂下垂，背部平直。','呼气将哑铃拉至腹部侧面，肘关节朝天花板方向。','吸气缓慢放下至完全伸展。'],
    tips:['拉起时"把肘装进后口袋"。','不要旋转躯干借力。'],
    commonMistakes:['肩部耸起斜方肌代偿。','只拉半程没有充分收缩。'] },

  { name:'坐姿绳索划船', nameEn:'Seated Cable Row', muscleGroup:'back', category:'compound', equipment:'Cable', difficulty:'简单',
    description:'全程稳定拉力，有利于感受中背部收缩，是初学者建立背部意识的优质动作。',
    instructions:['坐于划船机，双脚踩踏板腿微弯，握V型把手，挺胸直立。','呼气，将把手拉向腹部，肩胛骨向脊柱靠拢，停顿。','吸气，手臂向前伸展，上身可略微前倾，充分拉伸背肌。','腰部保持挺直不过度弯曲或后仰。'],
    tips:['回程允许上身前倾15°增加背部拉伸。','不要用前后摇摆借力。'],
    commonMistakes:['腰部反弓代替背部发力。','肘关节外展三角肌代偿。'] },

  { name:'硬拉', nameEn:'Conventional Deadlift', muscleGroup:'back', category:'compound', equipment:'Barbell', difficulty:'困难',
    description:'力量举三大项之一，全身性复合动作之王，主要锻炼竖脊肌、臀大肌和腘绳肌，强化整个后侧链。',
    instructions:['双脚与髋同宽，杠铃在脚背中段正上方，弯腰握杠，膝盖朝向脚尖。','深吸气收紧核心，挺胸，肩胛下沉，将杠铃"拉紧"地面。','同时蹬地发力，杠铃贴着腿向上，髋膝同步伸展直至站直。','顶部完全伸髋夹臀，然后控制下放。'],
    tips:['全程背部平直，"胸椎伸展"意识极重要。','可使用助力带让握力不限制背部训练。'],
    commonMistakes:['腰椎弓起最危险，极易受伤。','杠铃离身体太远力矩过大。'] },

  { name:'罗马尼亚硬拉', nameEn:'Romanian Deadlift', muscleGroup:'back', category:'compound', equipment:'Barbell', difficulty:'中等',
    description:'以臀部铰链为核心，主要锻炼腘绳肌和臀大肌，是提高后侧链柔韧性和力量的优秀动作。',
    instructions:['站立持杠，双脚与髋同宽，手臂伸直。','保持背部平直，膝关节轻微弯曲，用髋关节铰链向前弯腰，杠铃沿腿前侧下滑。','下降至腘绳肌充分拉伸（杠铃到小腿中部）。','挺髋推前，臀大肌和腘绳肌发力回到直立。'],
    tips:['弯腰时"用屁股往后顶墙"找髋铰链感觉。','下背感受紧张是正常等长收缩，但不能弓腰。'],
    commonMistakes:['膝盖弯曲过多变成深蹲模式。','背部弓起危及腰椎。'] },

  { name:'直臂下压', nameEn:'Straight-arm Pulldown', muscleGroup:'back', category:'isolation', equipment:'Cable', difficulty:'简单',
    description:'保持手臂伸直排除二头肌代偿，让背阔肌获得极强的收缩感，是建立背部连接感的理想动作。',
    instructions:['面向高位绳索，微微前倾，握住直杠，保持手臂伸直肘微弯。','以背阔肌发力将手柄向下压向大腿前方。','最低点停顿感受背阔肌强烈收缩。','缓慢将手臂抬回，充分拉伸背阔肌。'],
    tips:['可在最低点做小幅度下压"挤压"动作。','适合在热身时建立背部激活感。'],
    commonMistakes:['肘关节弯曲过多让二头肌参与。','重量太重导致轨迹变形。'] },

  // ─── 肩部 ───
  { name:'杠铃推举', nameEn:'Barbell Overhead Press', muscleGroup:'shoulders', category:'compound', equipment:'Barbell', difficulty:'困难',
    description:'肩部复合训练核心动作，主要刺激三角肌前束和中束，同时锻炼斜方肌和肱三头肌。',
    instructions:['杠铃置于锁骨上，握距略宽于肩，肘关节朝斜前方。','收紧核心，保持胸椎伸展不过度弓腰。','呼气将杠铃垂直推过头顶，手臂完全伸直。','吸气缓慢控制杠铃下落至锁骨位置。'],
    tips:['核心全程收紧防止腰椎过伸。','可坐姿进行减少腰部代偿。'],
    commonMistakes:['腰部过度弓起（香蕉腰）。','肘关节过于外展肩关节受压。'] },

  { name:'哑铃推举', nameEn:'Dumbbell Shoulder Press', muscleGroup:'shoulders', category:'compound', equipment:'Dumbbell', difficulty:'中等',
    description:'独立双臂运动弥补双侧力量不平衡，轨迹更自由，适合初学者和有肩关节问题的训练者。',
    instructions:['坐于有靠背凳，哑铃举至肩部两侧，肘约90°，拳眼斜内。','呼气推起，至手臂接近伸直，顶部两铃可靠拢挤压。','吸气缓慢下落至肩部两侧，控制全程。','背部贴紧靠垫不要拱腰借力。'],
    tips:['顶部旋转手腕可增加三角肌前束收缩。','比杠铃版本更安全适合独自训练。'],
    commonMistakes:['耸肩代替肩部发力。','腰部过度反弓借力。'] },

  { name:'侧平举', nameEn:'Lateral Raise', muscleGroup:'shoulders', category:'isolation', equipment:'Dumbbell', difficulty:'简单',
    description:'孤立三角肌中束的最直接动作，是打造宽肩视觉效果的核心动作。',
    instructions:['站立或坐姿，双手持哑铃，手臂下垂手心相对，肘微弯。','以三角肌中束发力将手臂向两侧抬起至肩膀高度。','小拇指侧略高于拇指侧（"倒水姿势"），停顿感受中束收缩。','缓慢下落，2秒上举2秒下落。'],
    tips:['重量宁轻勿重，保证中束真正发力。','在身体侧前方抬起可减少斜方肌代偿。'],
    commonMistakes:['耸肩严重斜方肌代偿，肩部无感。','用摆动惯性完成，失去孤立效果。'] },

  { name:'俯身侧平举', nameEn:'Bent-over Lateral Raise', muscleGroup:'shoulders', category:'isolation', equipment:'Dumbbell', difficulty:'简单',
    description:'专门孤立三角肌后束，是改善肩部立体感、预防圆肩的关键动作。',
    instructions:['坐凳边或站立前弯腰，上身与地面平行，双手持哑铃下垂。','保持背部平直，肘微弯，以后束发力将哑铃向两侧抬起。','抬至上臂与地面平行，停顿挤压后束。','缓慢下落至完全伸展。'],
    tips:['重量要轻，后束本身较弱。','可用绳索提供更稳定拉力。'],
    commonMistakes:['斜方肌主导出现耸肩式飞鸟。','腰部弯曲脊椎受压。'] },

  { name:'面拉', nameEn:'Face Pull', muscleGroup:'shoulders', category:'isolation', equipment:'Cable', difficulty:'简单',
    description:'训练三角肌后束和外旋肌群，对改善肩部健康、预防和矫正圆肩有显著效果。',
    instructions:['绳索调至面部高度，双手各握绳子一端向后退。','将绳子拉向面部两侧，同时做外旋（大拇指指向头后方）。','拉至双手与耳朵平行，停顿感受后束收缩。','缓慢控制归位保持张力。'],
    tips:['不需要大重量，感受肌肉收缩最重要。','可作为每次推举训练的对抗动作维持肩关节健康。'],
    commonMistakes:['不做外旋，只是把绳子拉向面部。','耸肩借力完成动作。'] },

  { name:'哑铃耸肩', nameEn:'Dumbbell Shrug', muscleGroup:'shoulders', category:'isolation', equipment:'Dumbbell', difficulty:'简单',
    description:'孤立斜方肌上部，通过垂直方向肩胛骨提升刺激上斜方肌，塑造强壮的颈背过渡。',
    instructions:['双手持较重哑铃，手臂下垂，站立背部挺直。','仅用肩膀做"耸起"动作，将肩胛骨向耳朵方向提升，不弯肘。','最高点停顿1-2秒，感受上斜方肌收缩。','呼气缓慢放下至完全伸展。'],
    tips:['顶点停顿是关键。','可使用助力带让握力不限制斜方肌训练。'],
    commonMistakes:['旋转肩膀（滚动动作）对斜方肌无效还伤肩。','动作幅度太小，没有充分收缩和拉伸。'] },

  // ─── 手臂 ───
  { name:'杠铃弯举', nameEn:'Barbell Curl', muscleGroup:'arms', category:'isolation', equipment:'Barbell', difficulty:'简单',
    description:'手臂肱二头肌训练中最基础最有效的动作，同时训练二头肌长头和短头，允许使用较大重量。',
    instructions:['站立正手握杠，握距与肩同宽，手臂伸直垂于身体前方。','上臂紧贴身体两侧固定，以二头肌发力将杠铃弯举至肩部高度。','顶部短暂停顿挤压二头肌。','吸气缓慢下落至手臂完全伸直。'],
    tips:['上臂固定是关键，肘关节不前后摆动。','下落阶段同样重要，不要让杠铃自由落下。'],
    commonMistakes:['后仰借力用腰背摆动抬起杠铃。','肘关节向前移动三角肌前束代偿。'] },

  { name:'哑铃弯举', nameEn:'Dumbbell Curl', muscleGroup:'arms', category:'isolation', equipment:'Dumbbell', difficulty:'简单',
    description:'弯举过程中旋转手腕增强二头肌长头收缩感，是雕塑手臂峰值的重要动作。',
    instructions:['站立或坐姿，双手持哑铃，手臂下垂手心朝身体。','上臂固定，弯举同时将手腕旋外（手心转向上）。','抬至最高点手心完全朝上，挤压二头肌。','缓慢下落，手腕旋回中立位。'],
    tips:['旋腕动作是哑铃弯举区别于杠铃弯举的优势。','重量过重时用身体摆动代替二头肌发力。'],
    commonMistakes:['全程使用锤式握法没有利用旋腕优势。','肘关节移位破坏孤立效果。'] },

  { name:'锤式弯举', nameEn:'Hammer Curl', muscleGroup:'arms', category:'isolation', equipment:'Dumbbell', difficulty:'简单',
    description:'以中立握法主要刺激肱肌和肱桡肌，比普通弯举更好地增加手臂整体围度，前臂也得到锻炼。',
    instructions:['站立或坐姿，双手持哑铃拳眼朝前，上臂固定于体侧。','保持手腕和手肘中立，以肱肌发力将哑铃向上弯举。','弯举至前臂与地面垂直，感受肱肌收缩。','缓慢下落至手臂完全伸直。'],
    tips:['可以比普通弯举使用稍大重量。','是增加前臂围度的好选择。'],
    commonMistakes:['前臂向外偏转变成变形弯举。','借腰发力上臂前后摆动。'] },

  { name:'绳索三头肌下压', nameEn:'Tricep Pushdown', muscleGroup:'arms', category:'isolation', equipment:'Cable', difficulty:'简单',
    description:'训练肱三头肌最常用的孤立动作，恒定张力持续刺激三头肌，适合高次数泵感训练。',
    instructions:['面向高位绳索，握直杠或V型把手，肘关节弯曲，上臂贴紧体侧。','核心收紧，上臂保持固定不动。','呼气以三头肌发力将把手下压至大腿前方，手臂完全伸直。','最低点挤压三头肌1-2秒，然后缓慢归位。'],
    tips:['上臂紧贴身体是关键。','绳子把手可在底部外旋腕部增加挤压感。'],
    commonMistakes:['肘关节外展减少三头肌孤立效果。','上臂上下摆动用肩关节代偿。'] },

  { name:'哑铃颈后臂屈伸', nameEn:'Overhead Tricep Extension', muscleGroup:'arms', category:'isolation', equipment:'Dumbbell', difficulty:'简单',
    description:'专门拉伸并收缩肱三头肌长头，对三头肌长头的刺激效果优于其他下压动作。',
    instructions:['坐姿或站立，双手握哑铃内侧，举过头顶手臂伸直。','上臂保持竖直固定，吸气弯肘让哑铃向下落向颈后，感受拉伸。','呼气以三头肌发力推回，手臂伸直。','全程上臂竖直只有前臂运动。'],
    tips:['可单臂进行，拉伸感更明显。','使用较轻重量，动作控制比重量更重要。'],
    commonMistakes:['上臂前后摆动失去孤立效果。','肘关节向外张开肩关节受压。'] },

  { name:'窄距卧推', nameEn:'Close-grip Bench Press', muscleGroup:'arms', category:'compound', equipment:'Barbell', difficulty:'中等',
    description:'通过缩小握距将重心转移至三头肌，是增加三头肌整体体积最有效的复合动作之一。',
    instructions:['躺于卧推凳，握距约与肩同宽（不要过窄），取出杠铃。','肘关节贴近体侧（不外展），控制杠铃下落至下胸。','呼气以三头肌为主发力推起，充分锁定肘关节。','全程上臂贴紧身体。'],
    tips:['握距不要过窄（手指相触），会损伤手腕。','可作为常规卧推结束后的补充动作。'],
    commonMistakes:['握距过窄手腕和肩关节受压。','肘关节外展失去三头肌主导效果。'] },

  // ─── 腿部 ───
  { name:'杠铃深蹲', nameEn:'Barbell Back Squat', muscleGroup:'legs', category:'compound', equipment:'Barbell', difficulty:'困难',
    description:'被誉为"运动之王"，全身性复合动作，主要锻炼股四头肌、臀大肌和腘绳肌，是提高整体力量的终极动作。',
    instructions:['杠铃置于肩膀（斜方肌上方），站距与肩同宽，脚尖略微外八。','深呼气收紧核心，膝盖朝向脚尖方向开始蹲下，背部保持中立。','蹲至大腿与地面平行或以下，底部短暂稳定。','呼气发力蹬地推起，膝关节和髋关节同步伸展至站直。'],
    tips:['"膝盖跟着脚尖走"防止膝关节内扣。','可在脚跟下垫小板弥补踝关节灵活性不足。'],
    commonMistakes:['膝盖内扣对膝关节损伤风险极大。','腰椎过度弯曲危及腰椎。'] },

  { name:'腿举', nameEn:'Leg Press', muscleGroup:'legs', category:'compound', equipment:'Machine', difficulty:'简单',
    description:'机器提供固定轨迹，允许使用大重量安全训练股四头肌和臀部，适合初学者学习腿部发力模式。',
    instructions:['坐入腿举机，背部和臀部完全贴合靠垫，双脚与肩同宽踩于踏板，脚尖略外八。','松开保险，控制踏板向下至膝盖弯曲约90°，感受股四头肌拉伸。','呼气蹬起，膝盖不完全锁死保持张力。','完成后扣好保险再起身。'],
    tips:['脚的位置越高越刺激臀部，越低越刺激四头肌。','不要让膝盖内扣，全程朝向脚尖方向。'],
    commonMistakes:['膝盖锁死承受冲击力。','臀部离开靠垫导致腰椎弯曲。'] },

  { name:'腿弯举', nameEn:'Lying Leg Curl', muscleGroup:'legs', category:'isolation', equipment:'Machine', difficulty:'简单',
    description:'专门孤立腘绳肌的器械动作，是大腿后侧肌肉发展最直接的孤立练习。',
    instructions:['俯卧于腿弯举机，膝盖刚好对齐机器转动轴，脚踝置于滚轮下方。','保持臀部贴紧垫面，以腘绳肌发力将小腿向上弯曲至最大。','顶部停顿挤压腘绳肌1秒。','缓慢下落至起始位置，充分拉伸。'],
    tips:['臀部不要抬起以避免借力。','可以将脚尖向外旋以刺激腘绳肌外侧，向内旋刺激内侧。'],
    commonMistakes:['臀部抬起借力，失去孤立效果。','动作速度过快，失去离心控制。'] },

  { name:'腿伸展', nameEn:'Leg Extension', muscleGroup:'legs', category:'isolation', equipment:'Machine', difficulty:'简单',
    description:'专门孤立股四头肌，特别适合训练末段（膝关节伸展最后阶段）的四头肌收缩感。',
    instructions:['坐于腿伸展机，背部贴紧靠垫，脚踝置于滚轮上方，膝盖刚好对齐轴心。','呼气以股四头肌发力将小腿向前伸直至膝关节接近锁定。','顶部停顿挤压四头肌2秒。','吸气缓慢下落至起始位置。'],
    tips:['速度宜慢，感受四头肌全程收缩。','作为深蹲后的补充孤立动作效果更好。'],
    commonMistakes:['速度过快用惯性完成。','未充分伸展至顶部，四头肌收缩不彻底。'] },

  { name:'保加利亚分腿蹲', nameEn:'Bulgarian Split Squat', muscleGroup:'legs', category:'compound', equipment:'Dumbbell', difficulty:'困难',
    description:'单腿主导的复合动作，强化股四头肌和臀大肌，同时改善双侧力量不平衡，是功能性腿部训练的高效动作。',
    instructions:['后脚脚背搭于凳面，前脚向前迈至合适距离，双手持哑铃。','保持躯干直立，吸气控制身体向下，前脚大腿与地面平行。','呼气以前脚股四头肌和臀大肌发力推起，恢复站立。','完成单侧后换另一侧。'],
    tips:['前脚距离不够会导致膝盖超过脚尖过多。','可以只用自重开始练习，熟悉动作后增加哑铃。'],
    commonMistakes:['躯干过度前倾。','膝关节内扣，没有朝向脚尖。'] },

  { name:'弓步蹲', nameEn:'Lunge', muscleGroup:'legs', category:'compound', equipment:'Bodyweight', difficulty:'简单',
    description:'基础腿部复合动作，训练股四头肌、臀大肌和腘绳肌，同时提高下肢稳定性和平衡能力。',
    instructions:['站立，双脚并拢，双手叉腰或持哑铃。','一脚向前迈出一大步，前脚踩实，后脚跟抬起。','屈膝下蹲，前脚大腿约与地面平行，后膝接近但不触地。','呼气蹬起，将前脚收回，换腿重复。'],
    tips:['前膝不要内扣，保持朝向脚尖。','可以做行走弓步增加训练强度。'],
    commonMistakes:['前脚步距过短导致膝盖超过脚尖过多。','身体左右摇晃失去平衡。'] },

  { name:'臀推', nameEn:'Hip Thrust', muscleGroup:'legs', category:'compound', equipment:'Barbell', difficulty:'中等',
    description:'针对臀大肌的最高效动作之一，通过水平向上推的力学结构最大化刺激臀大肌，对提臀和增加臀部尺寸效果显著。',
    instructions:['上背部靠于凳边，杠铃置于髋部（垫保护垫），双脚踩地宽度与肩同宽。','吸气，呼气时以臀部发力推起髋关节，上半身与大腿成一直线，顶部挤压臀大肌。','身体从头到膝保持直线，小腿垂直地面。','吸气缓慢下落，髋部接近但不触地，重复。'],
    tips:['顶部挤压停顿2秒是关键。','脚跟踩实地面，不要用脚尖蹬。'],
    commonMistakes:['腰椎过伸代替臀部发力。','下落速度过快，失去离心控制。'] },

  { name:'站姿提踵', nameEn:'Standing Calf Raise', muscleGroup:'legs', category:'isolation', equipment:'Machine', difficulty:'简单',
    description:'专门孤立小腿腓肠肌的经典动作，通过足背屈-跖屈的完整范围运动刺激小腿肌肉增长。',
    instructions:['站于提踵机，肩膀顶住肩垫，脚掌前1/3踩于踏台，脚跟悬空。','以小腿发力将脚跟尽可能抬高，顶部停顿1-2秒挤压小腿。','缓慢下落，让脚跟低于踏台边缘，充分拉伸腓肠肌。','每次都完成完整的上下动作幅度。'],
    tips:['不同脚尖方向：中立刺激外侧，外八刺激内侧，内八刺激外侧。','小腿肌肉恢复快，可使用较高次数（15-25次）。'],
    commonMistakes:['用膝盖弹力借力，没有用小腿完成动作。','不在底部充分拉伸，减少训练效果。'] },

  { name:'臀桥', nameEn:'Glute Bridge', muscleGroup:'legs', category:'compound', equipment:'Bodyweight', difficulty:'简单',
    description:'臀大肌基础激活动作，适合热身或作为独立训练，通过髋部伸展刺激臀大肌，对改善臀腿连接和激活臀肌有显著效果。',
    instructions:['仰卧，屈膝脚踩实地面，双脚与髋同宽，手臂自然放于体侧。','深吸气，呼气时以臀部发力将髋关节推起，使身体从肩到膝成一直线。','顶部挤压臀大肌2-3秒。','缓慢下落至髋部接近地面，重复。'],
    tips:['熟练后可在大腿上放杠铃片或哑铃增加难度。','顶部主动夹紧臀部，不要只是靠后仰推起。'],
    commonMistakes:['腰椎过伸，弓背严重。','膝盖内扣，没有保持与脚尖同向。'] },

  // ─── 腹部 ───
  { name:'卷腹', nameEn:'Crunch', muscleGroup:'abs', category:'isolation', equipment:'Bodyweight', difficulty:'简单',
    description:'腹部最基础的孤立动作，通过脊柱屈曲主要刺激腹直肌上部，是腹部训练的入门首选动作。',
    instructions:['仰卧，膝盖弯曲脚踩实地面，双手轻放于头部两侧（不要扣住脑袋用力）。','收紧腹部，呼气，将肩胛骨抬离地面，保持下背紧贴地面。','在顶部停顿1秒，感受腹直肌收缩。','吸气缓慢下落，但肩胛骨不完全触地以保持张力，重复。'],
    tips:['下背始终紧贴地面，卷腹不是仰卧起坐。','想象"将肋骨拉向髋骨"找到正确发力感。'],
    commonMistakes:['用颈部发力，导致颈部酸痛。','下背离地，动作变成仰卧起坐。'] },

  { name:'平板支撑', nameEn:'Plank', muscleGroup:'abs', category:'compound', equipment:'Bodyweight', difficulty:'简单',
    description:'核心稳定性训练的基础动作，通过等长收缩强化整个核心肌群（腹横肌、腹直肌、腹斜肌），同时锻炼竖脊肌。',
    instructions:['俯卧，前臂撑地，肘关节在肩正下方，脚尖点地。','收紧腹部、臀部，身体从头到脚成一条直线。','保持自然呼吸，不要屏住呼吸，维持目标时间。','如感觉髋部下沉立即停止本组。'],
    tips:['质量大于时间，保持正确姿势比撑更久更重要。','进阶版：抬腿、单臂或在平衡板上进行。'],
    commonMistakes:['臀部下沉或过高，身体不成直线。','屏气导致核心保护功能降低。'] },

  { name:'仰卧起坐', nameEn:'Sit-up', muscleGroup:'abs', category:'compound', equipment:'Bodyweight', difficulty:'简单',
    description:'通过全范围脊柱屈曲训练腹直肌，同时髂腰肌也参与，是经典的腹部训练动作，适合增强核心功能性力量。',
    instructions:['仰卧，膝盖弯曲脚踩地或固定，双手轻放于胸前或头两侧。','呼气，收紧腹部将上半身完全坐起至与大腿接近垂直。','顶部短暂停顿。','吸气缓慢下落至肩胛骨接近地面，重复。'],
    tips:['重点是腹肌发力，而非颈部或手臂拉拽。','可以在下落时加慢速度增加离心刺激。'],
    commonMistakes:['用颈部力量把自己拉起。','下落过快没有控制。'] },

  { name:'俄罗斯转体', nameEn:'Russian Twist', muscleGroup:'abs', category:'isolation', equipment:'Bodyweight', difficulty:'简单',
    description:'专门训练腹内外斜肌的旋转力量动作，有效雕塑腰部线条，同时提高躯干旋转稳定性。',
    instructions:['坐姿，膝盖弯曲，上半身后倾约45°，脚可踩地（基础版）或抬起（进阶版）。','双手合十或持重物（哑铃/药球），以腹斜肌发力向一侧旋转触碰地面。','回到中间后向另一侧旋转，保持节奏。','始终保持腰背中立不要弓背。'],
    tips:['旋转时是躯干的旋转，而非手臂甩动。','可手持哑铃或药球增加阻力。'],
    commonMistakes:['手臂甩动代替躯干旋转。','弓腰完成动作，腰椎承压。'] },

  { name:'悬挂举腿', nameEn:'Hanging Leg Raise', muscleGroup:'abs', category:'isolation', equipment:'Bodyweight', difficulty:'中等',
    description:'悬挂于单杠进行举腿，对腹直肌下部的刺激效果极强，同时对腰大肌和核心稳定性也有很好的训练效果。',
    instructions:['双手正握单杠悬挂，握距与肩同宽，身体自然下垂稳定。','收紧核心，呼气以腹部发力将双腿（弯膝或直腿）向上抬起至与地面平行或更高。','顶部短暂停顿，感受腹部收缩。','吸气缓慢下落，不要摆荡借力。'],
    tips:['初学者可以弯膝（举膝盖），进阶可直腿。','控制摆动是核心挑战，保持身体稳定。'],
    commonMistakes:['用摆荡惯性带动腿部，失去腹肌刺激。','只抬了一半没有达到与地面平行。'] },

  { name:'绳索卷腹', nameEn:'Cable Crunch', muscleGroup:'abs', category:'isolation', equipment:'Cable', difficulty:'简单',
    description:'通过绳索提供可调节的阻力进行卷腹，比徒手卷腹可以使用更大负荷，有效促进腹直肌力量和厚度增长。',
    instructions:['面向高位绳索下跪，双手握绳索把手置于头部两侧。','核心收紧，以腹直肌发力将上身向下卷曲，肘关节向膝盖方向运动。','在最低点停顿1-2秒，充分挤压腹肌。','缓慢上升，控制回到初始位置，臀部保持不动。'],
    tips:['重点是上半身向下卷而不是臀部上起。','可以通过改变重量精确调节腹部训练强度。'],
    commonMistakes:['用臀部起伏代替腹部卷曲。','速度过快，失去腹肌的离心控制。'] },

  { name:'山地攀登者', nameEn:'Mountain Climber', muscleGroup:'abs', category:'compound', equipment:'Bodyweight', difficulty:'中等',
    description:'动态核心训练动作，在平板支撑基础上加入膝盖交替拉向胸部的运动，同时提高心率，是核心力量与心肺耐力结合的高效动作。',
    instructions:['俯撑姿势，双手在肩正下方，手臂伸直，身体成一直线。','保持髋部稳定不抬高，将一侧膝盖拉向胸部。','迅速换另一侧，交替进行，模拟爬山动作。','保持核心收紧，不要让腰部下沉。'],
    tips:['速度可以快慢结合：慢速强化核心，快速增加有氧强度。','保持髋部与地面平行，不要随动作左右晃动。'],
    commonMistakes:['臀部抬得过高，失去核心训练效果。','腰部下沉，脊椎不成直线。'] },
];

async function main() {
  console.log('🔄 开始导入中文动作库...');

  // 删除英文动作（名称全为ASCII字符，无中文）
  const all = await prisma.exercise.findMany({ where: { userId: null }, select: { id: true, name: true } });
  const englishIds = all.filter(e => !/[\u4e00-\u9fa5]/.test(e.name)).map(e => e.id);
  if (englishIds.length > 0) {
    await prisma.exercise.deleteMany({ where: { id: { in: englishIds } } });
    console.log(`🗑️  已删除英文动作: ${englishIds.length} 个`);
  }

  // 获取现有中文动作名
  const existing = await prisma.exercise.findMany({ where: { userId: null }, select: { name: true } });
  const existingNames = new Set(existing.map(e => e.name));

  let inserted = 0, skipped = 0;
  for (const ex of exercises) {
    if (existingNames.has(ex.name)) { skipped++; continue; }
    await prisma.exercise.create({
      data: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        category: ex.category,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        description: ex.description,
        instructions: ex.instructions.join('\n'),
        tips: JSON.stringify(ex.tips),
        commonMistakes: JSON.stringify(ex.commonMistakes),
        userId: null,
      }
    });
    existingNames.add(ex.name);
    inserted++;
  }

  console.log(`✅ 新增: ${inserted} 个，跳过(已存在): ${skipped} 个`);
  const total = await prisma.exercise.count({ where: { userId: null } });
  console.log(`📊 数据库系统动作合计: ${total} 个`);
}

main()
  .catch(e => { console.error('❌ 错误:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
