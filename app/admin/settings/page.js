"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { setSettings(d.settings || {}); setLoading(false); });
  }, []);

  const saveSetting = async (key, value) => {
    setSaving(key);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaving("");
    setSaved(key);
    setTimeout(() => setSaved(""), 2000);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#999" }}>加载中…</div>;

  const sections = [
    {
      title: "🤖 默认模型",
      key: "default_model",
      type: "input",
      desc: "AI 回复使用的模型，例如 claude-haiku-4-5-20251001",
    },
    {
      title: "🧠 记忆注入条数",
      key: "memory_max_inject",
      type: "input",
      desc: "每次对话最多注入几条记忆（建议 3-10）",
    },
    {
      title: "🔍 记忆相似度阈值",
      key: "memory_similarity_threshold",
      type: "input",
      desc: "召回记忆的最低相似度（0-1，越小召回越多）",
    },
    {
      title: "🎭 人设（System Prompt）",
      key: "system_prompt",
      type: "textarea",
      desc: "AI 的角色设定，直接在这里编辑保存即可",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "24px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>⚙️ 系统设置</h1>
        <p style={{ fontSize: 13, color: "#999", marginBottom: 28 }}>在这里直接修改配置，保存后立即生效</p >

        {sections.map((s) => (
          <div key={s.key} style={{ background: "#fff", borderRadius: 12, padding: "20px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 12 }}>{s.desc}</div>

            {s.type === "textarea" ? (
              <textarea
                value={settings[s.key] || ""}
                onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                rows={10}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box" }}
              />
            ) : (
              <input
                value={settings[s.key] || ""}
                onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
              />
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button
                onClick={() => saveSetting(s.key, settings[s.key])}
                disabled={saving === s.key}
                style={{
                  padding: "8px 20px", borderRadius: 8, border: "none",
                  background: saved === s.key ? "#10b981" : "#222",
                  color: "#fff", fontSize: 13, cursor: "pointer"
                }}
              >
                {saving === s.key ? "保存中…" : saved === s.key ? "✓ 已保存" : "保存"}
              </button>
            </div>
          </div>
        ))}

        <div style={{ background: "#fff", borderRadius: 12, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>ℹ️ 关于</div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 2 }}>
            <div>项目：星辉 AI 伴侣</div>
            <div>后端：FastAPI + PostgreSQL</div>
            <div>前端：Next.js</div>
            <div>部署：Zeabur</div>
          </div>
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href=" " style={{ fontSize: 13, color: "#6366f1" }}>← 返回记忆管理</a >
        </div>
      </div>
    </div>
  );
}
