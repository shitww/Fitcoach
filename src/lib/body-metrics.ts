export function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export type BodyDataRecord = {
  id: string;
  date: string; // API JSON: ISO string
  weight?: number | null;
  bodyFat?: number | null;
  chest?: number | null;
  waist?: number | null;
  hip?: number | null;
  armLeft?: number | null;
  armRight?: number | null;
  thighLeft?: number | null;
  thighRight?: number | null;
  neck?: number | null;
  notes?: string | null;
};

export function findRecordByLocalDay(records: BodyDataRecord[], day: Date) {
  const target = startOfLocalDay(day).getTime();
  return (
    records.find((r) => startOfLocalDay(new Date(r.date)).getTime() === target) ?? null
  );
}

export type MetricKey =
  | "weight"
  | "bodyFat"
  | "chest"
  | "waist"
  | "hip"
  | "armLeft"
  | "armRight"
  | "thighLeft"
  | "thighRight"
  | "neck";

export type MetricConfig = {
  key: MetricKey;
  label: string;
  unit: string;
  // UI 快捷按钮步进（用于 -0.1/+0.1 等）
  steps: number[];
  // 合理范围（用于基础校验）
  min?: number;
  max?: number;
};

export const METRICS: MetricConfig[] = [
  { key: "weight", label: "体重", unit: "kg", steps: [0.1, 0.5, 1], min: 20, max: 300 },
  { key: "bodyFat", label: "体脂", unit: "%", steps: [0.1, 0.5, 1], min: 1, max: 70 },
  { key: "chest", label: "胸围", unit: "cm", steps: [0.1, 0.5, 1], min: 30, max: 200 },
  { key: "waist", label: "腰围", unit: "cm", steps: [0.1, 0.5, 1], min: 30, max: 200 },
  { key: "hip", label: "臀围", unit: "cm", steps: [0.1, 0.5, 1], min: 30, max: 200 },
  { key: "armLeft", label: "左臂", unit: "cm", steps: [0.1, 0.5, 1], min: 10, max: 100 },
  { key: "armRight", label: "右臂", unit: "cm", steps: [0.1, 0.5, 1], min: 10, max: 100 },
  { key: "thighLeft", label: "左腿", unit: "cm", steps: [0.1, 0.5, 1], min: 20, max: 120 },
  { key: "thighRight", label: "右腿", unit: "cm", steps: [0.1, 0.5, 1], min: 20, max: 120 },
  { key: "neck", label: "颈围", unit: "cm", steps: [0.1, 0.5, 1], min: 10, max: 80 },
];

export function parseDecimalInput(raw: string) {
  const s = raw.trim().replace(/,/g, ".");
  if (!s) return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return n;
}

export function validateMetricValue(cfg: MetricConfig, value: number) {
  if (!Number.isFinite(value)) return "请输入有效数字";
  if (cfg.min != null && value < cfg.min) return `不能小于 ${cfg.min}${cfg.unit}`;
  if (cfg.max != null && value > cfg.max) return `不能大于 ${cfg.max}${cfg.unit}`;
  return null;
}

export function formatMetricValue(value: number, unit: string) {
  const fixed = value.toFixed(1);
  // 去掉尾随 .0（保持干净）
  return fixed.replace(/\.0$/, "") + unit;
}
