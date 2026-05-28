"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MetricConfig, parseDecimalInput, validateMetricValue } from "@/lib/body-metrics";
import { useToast } from "@/components/Toast";
import { useReducedMotion, motion } from "framer-motion";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  metric: MetricConfig;
  latestValue: number | null;
  latestDateText: string | null;
  onSave: (value: number) => Promise<void>;
};

export function MetricEditorSheet(props: Props) {
  const { open, onOpenChange, metric, latestValue, latestDateText, onSave } = props;
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [raw, setRaw] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setRaw(latestValue == null ? "" : String(latestValue));
  }, [open, latestValue]);

  const commit = async () => {
    const n = parseDecimalInput(raw);
    if (n == null) {
      toast({ message: "请输入有效数字", type: "error" });
      return;
    }
    const err = validateMetricValue(metric, n);
    if (err) {
      toast({ message: err, type: "error" });
      return;
    }
    setSaving(true);
    try {
      await onSave(n);
      toast({ message: "已保存", type: "success" });
      onOpenChange(false);
    } catch {
      toast({ message: "保存失败，请检查网络", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const applyDelta = (delta: number) => {
    const n = parseDecimalInput(raw) ?? 0;
    const next = Math.round((n + delta) * 10) / 10;
    setRaw(String(next));
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,.55)" }} />
        <Drawer.Content
          className={cn("fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border")}
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            overscrollBehavior: "contain",
          }}
        >
          <div className="mx-auto max-w-5xl px-4 pb-6 pt-3">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full" style={{ background: "rgba(255,255,255,.18)" }} />

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
            >
              <div className="text-sm font-black" style={{ color: "var(--foreground)" }}>
                {metric.label}
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-low)" }}>
                {latestValue == null ? "上次：未记录" : `上次：${latestValue}${metric.unit}`} {latestDateText ? `\u00b7 ${latestDateText}` : ""}
              </div>

              <div className="mt-5 flex items-end gap-2">
                <Input
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  inputMode="decimal"
                  autoFocus
                  onFocus={(e) => e.currentTarget.select()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                  }}
                  placeholder="输入数值"
                  className="h-14 rounded-2xl text-2xl font-black"
                />
                <div className="pb-2 text-sm font-bold" style={{ color: "var(--text-low)" }}>
                  {metric.unit}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {metric.steps.flatMap((s) => [-s, s]).map((d) => (
                  <Button
                    key={d}
                    variant="secondary"
                    className="h-11 rounded-2xl"
                    onClick={() => applyDelta(d)}
                  >
                    {d > 0 ? `+${d}` : `${d}`}
                  </Button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button variant="secondary" className="h-12 rounded-2xl" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button className="h-12 rounded-2xl" onClick={commit} disabled={saving}>
                  {saving ? "保存中…" : "保存"}
                </Button>
              </div>
            </motion.div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
