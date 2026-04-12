"use client";
import { useState, useEffect } from "react";

const MODEL_OPTIONS = [
  { label: "Claude Sonnet 4.6（聊天主力）", value: "claude-sonnet-4-6" },
  { label: "Claude Haiku 4.5（轻量快速）", value: "claude-haiku-4-5-20251001" },
];

const CONFIG_ITEMS = [
  {
    key: "default_model",
    title: "聊天模型",
    desc: "用于正常对话回复，建议使用 Sonnet 系列",
  },
  {
    key: "memory_model",
    title: "记忆提取模型",
    desc: "从对话中提取用户事实，用便宜模型即可",
  },
  {
    key: "summary_model",
    title: "总结模型",
    desc: "生成每日/每周/每月总结，用便宜模型即可",
  },
];

export default function SettingsPage() {
  const [config, setConfig] = useState({
    default_model: "claude-sonnet-4-6",
    memory_model: "claude-haiku-4-5-20251001",
    summary_model: "claude-haiku-4-5-20251001",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setConfig((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // 逐个保存，因为后端每次只接受一个 key/value
      for (const item of CONFIG_ITEMS) {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: item.key, value: config[item.key] }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f7",
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      display: "flex",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>
          模型配置
        </div>
        <div style={{ fontSize: 14, color: "#888", marginBottom: 28 }}>
          分别为不同用途选择合适的模型
        </div>

        {CONFIG_ITEMS.map((item) => (
          <div key={item.key} style={{
            background: "#fff",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 16,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
              {item.title}
            </div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 14 }}>
              {item.desc}
            </div>
            <select
              value={config[item.key] || ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, [item.key]: e.target.value }))}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e0e0e0",
                fontSize: 14,
                background: "#fafafa",
                color: "#1a1a1a",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            marginTop: 8,
            padding: "12px 32px",
            borderRadius: 10,
            border: "none",
            background: saved ? "#34c759" : "#1a1a1a",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {saving ? "保存中…" : saved ? "✓ 已保存" : "保存配置"}
        </button>
      </div>
    </div>
  );
}
