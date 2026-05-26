export interface WarmupItem {
  name: string;
  reps: number | string;
  done: boolean;
}

export const WARMUP_PRESETS: Record<string, WarmupItem[]> = {
  shoulders: [
    { name: '弹力带外旋', reps: 15, done: false },
    { name: '肩关节环绕', reps: 10, done: false },
    { name: '轻重量侧平举', reps: 15, done: false },
  ],
  chest: [
    { name: '动态俯卧撑（半程）', reps: 15, done: false },
    { name: '动态胸部拉伸', reps: '30s', done: false },
    { name: '空重卧推', reps: 15, done: false },
  ],
  back: [
    { name: '猫牛式拉伸', reps: '30s', done: false },
    { name: '弹力带直臂下压', reps: 15, done: false },
    { name: '轻重量单臂划船', reps: 12, done: false },
  ],
  legs: [
    { name: '臀桥激活', reps: 15, done: false },
    { name: '腿部动态拉伸', reps: '30s', done: false },
    { name: '空重深蹲', reps: 15, done: false },
  ],
  arms: [
    { name: '手腕绕环', reps: '20s', done: false },
    { name: '肘关节热身', reps: '20s', done: false },
    { name: '空重弯举', reps: 15, done: false },
  ],
  abs: [
    { name: '骨盆前倾后倾', reps: '30s', done: false },
    { name: '死虫式激活', reps: 10, done: false },
    { name: '平板支撑激活', reps: '20s', done: false },
  ],
  fullbody: [
    { name: '全身动态热身', reps: '60s', done: false },
    { name: '弓步拉伸', reps: 10, done: false },
    { name: '肩部环绕', reps: 10, done: false },
  ],
  default: [
    { name: '全身动态热身', reps: '60s', done: false },
    { name: '关节环绕活动', reps: '30s', done: false },
    { name: '轻度有氧激活', reps: '2min', done: false },
  ],
};
