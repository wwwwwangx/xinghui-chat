"use client";
import { useEffect, useState } from "react";

const navItems = [
  { key: "model_service", label: "模型服务", icon: "🔧" },
  { key: "default_model", label: "默认模型", icon: "🎯" },
  { key: "memory", label: "记忆系统", icon: "🧠" },
  { key: "persona", label: "人设", icon: "🎭" },
  { key: "about", label: "关于", icon: "ℹ️" },
];

export default function SettingsPage() {
  const [active, setActive] = useState("model_service");
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

  const SaveButton = ({ k }) => (
    <button
      onClick={() => saveSetting(k, settings[k])}
      disabled={saving === k}
      style={{
        padding: "8px 24px", borderRadius: 8, border: "none",
        background: saved === k ? "#10b981" : "#1a1a1a",
        color: "#fff", fontSize: 13, cursor: "pointer", marginTop: 12,
      }}
    >
      {saving === k ? "保存中…" : saved === k ? "✓ 已保存" : "保存配置"}
    </button>
  );

  const Field = ({ label, desc, fieldKey, type = "input" }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {desc && <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>{desc}</div>}
      {type === "textarea" ? (
        <textarea
          value={settings[fieldKey] || ""}
          onChange={(e) => setSettings({ ...settings, [fieldKey]: e.target.value })}
          rows={12}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 13, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box", outline: "none" }}
        />
      ) : (
        <input
          value={settings[fieldKey] || ""}
          onChange={(e) => setSettings({ ...settings, [fieldKey]: e.target.value })}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 14, boxSizing: "border-box", outline: "none" }}
        />
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) return <div style={{ color: "#999", padding: 20 }}>加载中…</div>;

    if (active === "model_service") return (
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>模型服务</h2>
        <Field
          label="API Base URL"
          desc="AI 接口地址"
          fieldKey="api_base_url"
        />
        <Field
          label="API Key"
          desc="接口密钥（保存后会存入数据库，敏感信息请谨慎）"
          fieldKey="api_key"
        />
        <SaveButton k="api_base_url" />
      </div>
    );

    if (active === "default_model") return (
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>默认模型</h2>
        <Field
          label="聊天模型"
          desc="AI 回复使用的模型，例如 claude-haiku-4-5-20251001"
          fieldKey="default_model"
        />
        <SaveButton k="default_model" />
      </div>
    );

    if (active === "memory") return (
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>记忆系统</h2>
        <Field
          label="记忆注入条数"
          desc="每次对话最多注入几条记忆（建议 3-10）"
          fieldKey="memory_max_inject"
        />
        <Field
          label="语义相似度阈值"
          desc="召回记忆的最低相似度（0-1，越小召回越多）"
          fieldKey="memory_similarity_threshold"
        />
        <SaveButton k="memory_max_inject" />
      </div>
    );

    if (active === "persona") return (
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>人设</h2>
        <Field
          label="System Prompt"
          desc="AI 的角色设定，直接在这里编辑保存即可"
          fieldKey="system_prompt"
          type="textarea"
        />
        <SaveButton k="system_prompt" />
      </div>
    );

    if (active === "about") return (
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>关于</h2>
        <div style={{ fontSize: 14, color: "#555", lineHeight: 2.2 }}>
          <div>🌟 项目：AI 伴侣</div>
          <div>⚙️ 后端：FastAPI + PostgreSQL</div>
          <div>🖥️ 前端：Next.js</div>
          <div>☁️ 部署：Zeabur</div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0fdf4", borderRadius: 8, color: "#16a34a", fontSize: 13 }}>
            ✅ 系统运行正常
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>⚙️ 设置</h1>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* 左侧导航 */}
          <div style={{ width: 160, background: "#fff", borderRadius: 14, padding: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flexShrink: 0 }}>
            {navItems.map((item) => (
              <div
                key={item.key}
                onClick={() => setActive(item.key)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: active === item.key ? 600 : 400,
                  background: active === item.key ? "#f3f4f6" : "transparent",
                  color: active === item.key ? "#1a1a1a" : "#555",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 2,
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 8 }}>
              <a
                href=" "
                style={{ padding: "10px 14px", borderRadius: 10, fontSize: 14, color: "#6366f1", display: "block", textDecoration: "none" }}
              >
                📋 记忆管理
              </a >
            </div>
          </div>

          {/* 右侧内容 */}
          <div style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", minHeight: 400 }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
