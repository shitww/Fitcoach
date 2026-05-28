import test from "node:test";
import assert from "node:assert/strict";

import {
  isSameLocalDay,
  findRecordByLocalDay,
  parseDecimalInput,
  validateMetricValue,
  formatMetricValue,
  METRICS,
  type MetricConfig,
} from "@/lib/body-metrics";

test("isSameLocalDay() should match the same day regardless of time", () => {
  const a = new Date("2026-05-28T06:00:00.000Z");
  const b = new Date("2026-05-28T07:00:00.000Z");
  assert.equal(isSameLocalDay(a, b), true);
});

test("isSameLocalDay() should reject different days", () => {
  const a = new Date("2026-05-28T01:00:00.000Z");
  const b = new Date("2026-05-29T01:00:00.000Z");
  assert.equal(isSameLocalDay(a, b), false);
});

test("findRecordByLocalDay() should find today's record without relying on index", () => {
  const records = [
    { id: "old", date: "2026-05-27T10:00:00.000Z", weight: 73 },
    { id: "today", date: "2026-05-28T00:10:00.000Z", weight: 72.4 },
  ];
  const hit = findRecordByLocalDay(records as any, new Date("2026-05-28T12:00:00.000Z"));
  assert.equal(hit?.id, "today");
});

test("findRecordByLocalDay() should return null when no match", () => {
  const records = [
    { id: "old", date: "2026-05-27T10:00:00.000Z", weight: 73 },
  ];
  const hit = findRecordByLocalDay(records as any, new Date("2026-05-28T12:00:00.000Z"));
  assert.equal(hit, null);
});

test("parseDecimalInput() should parse decimal strings", () => {
  assert.equal(parseDecimalInput("72.4"), 72.4);
  assert.equal(parseDecimalInput("72,4"), 72.4);
  assert.equal(parseDecimalInput("  72.4  "), 72.4);
  assert.equal(parseDecimalInput(""), null);
  assert.equal(parseDecimalInput("abc"), null);
});

test("validateMetricValue() should validate ranges", () => {
  const cfg = METRICS.find((m: MetricConfig) => m.key === "bodyFat")!;
  assert.equal(validateMetricValue(cfg, 15), null);
  assert.equal(validateMetricValue(cfg, 0.5), "不能小于 1%");
  assert.equal(validateMetricValue(cfg, 75), "不能大于 70%");
  assert.equal(validateMetricValue(cfg, NaN), "请输入有效数字");
});

test("formatMetricValue() should format with unit", () => {
  assert.equal(formatMetricValue(72.4, "kg"), "72.4kg");
  assert.equal(formatMetricValue(72.0, "kg"), "72kg");
  assert.equal(formatMetricValue(15.5, "%"), "15.5%");
});
