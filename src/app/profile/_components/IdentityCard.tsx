"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  fallbackInitial?: string;
};

export function IdentityCard({ name, email, avatar, fallbackInitial = "U" }: Props) {
  const { t } = useTheme();

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black overflow-hidden shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)",
            boxShadow: "0 0 24px var(--accent-glow)",
          }}
        >
          {avatar ? (
            <img src={avatar} alt="头像" className="w-full h-full object-cover" />
          ) : (
            <span style={{ color: "var(--accent)" }}>
              {(name?.charAt(0) || fallbackInitial).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black truncate">{name || "健身爱好者"}</h2>
          {email && (
            <p className="text-sm flex items-center gap-1 mt-1" style={{ color: t.textMuted }}>
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{email}</span>
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "1px solid var(--accent-glow)",
              }}
            >
              已验证
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-low)",
                border: "1px solid var(--border)",
              }}
            >
              初级训练者
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
