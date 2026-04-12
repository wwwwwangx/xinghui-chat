"use client";
import { useEffect, useState } from "react";

export default function MemoriesAdminPage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  
  const [multiMode, setMultiMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortBy, setSortBy] = useState("time"); // time | importance

  const fetchMemories = async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: filterStatus });
    if (filterType) params.append("type", filterType);
    if (search) params.append("search", search);
    const res = await fetch(`/api/memories?${params}`);
    const data = await res.json();
    setMemories(data.memories || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMemories();
  }, [filterType, filterStatus]);

  const handleArchive = async (id) => {
    await fetch("/api/memories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "archived" }),
    });
    fetchMemories();
  };

  const handleLowerImportance = async (id) => {
    await fetch("/api/memories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, importance: 3 }),
    });
    fetchMemories();
  };

  const typeColor = { core: "#6366f1", atomic: "#10b981", plan: "#f59e0b", general: "#9ca3af" };

  const sortedMemories = [...memories].sort((a, b) => {
    if (sortBy === "importance") {
      return b.importance - a.importance;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "24px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>🧠 记忆管理后台</h1>

        {/* 顶部工具栏（含多选、新建、排序） */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchMemories()}
            placeholder="搜索记忆内容…"
            style={{ flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
          />

          <button
            onClick={() => {
              if (multiMode) {
                setSelectedIds([]);
              }
              setMultiMode(!multiMode);
            }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: multiMode ? "#eee" : "#fff", cursor: "pointer" }}
          >
            多选
          </button>

          <button
            onClick={() => alert("这里可以做新建记忆")}
            style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer" }}
          >
            + 新建
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="time">按时间</option>
            <option value="importance">按重要度</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="">全部类型</option>
            <option value="core">core</option>
            <option value="atomic">atomic</option>
            <option value="plan">plan</option>
            <option value="general">general</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="active">active</option>
            <option value="archived">archived</option>
            <option value="superseded">superseded</option>
          </select>

          <button
            onClick={fetchMemories}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#222", color: "#fff", cursor: "pointer" }}
          >
            搜索
          </button>
        </div>

        {/* 计数 + 批量操作 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 13, color: "#888" }}>
            共 {sortedMemories.length} 条记忆
            {multiMode && selectedIds.length > 0 && (
              <span style={{ marginLeft: 8, color: "#333" }}>已选 {selectedIds.length} 条</span>
            )}
          </div>

          {multiMode && selectedIds.length > 0 && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={async () => {
                  for (const id of selectedIds) {
                    await fetch("/api/memories", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id, status: "archived" }),
                    });
                  }
                  setSelectedIds([]);
                  fetchMemories();
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #fca5a5",
                  background: "#fff5f5",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                批量归档
              </button>

              <button
                onClick={async () => {
                  const ok = confirm(`确定删除选中的 ${selectedIds.length} 条记忆吗？`);
                  if (!ok) return;

                  await fetch("/api/memories", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids: selectedIds }),
                  });

                  setSelectedIds([]);
                  fetchMemories();
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                批量删除
              </button>
            </div>
          )}
        </div>

        {/* 列表 */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#999", padding: 40 }}>加载中…</div>
        ) : sortedMemories.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999", padding: 40 }}>没有记忆</div>
        ) : (
          sortedMemories.map((m) => (
            <div
              key={m.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {multiMode && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(m.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, m.id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== m.id));
                      }
                    }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.6, marginBottom: 8 }}>
                    {m.content}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                      background: typeColor[m.type] || "#eee", color: "#fff"
                    }}>
                      {m.type}
                    </span>
                    <span style={{ fontSize: 11, color: "#888" }}>重要度 {m.importance}</span>
                    <span style={{ fontSize: 11, color: "#bbb" }}>
                      {new Date(m.created_at).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleLowerImportance(m.id)}
                    title="降低重要性"
                    style={{ padding: "4px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
                  >
                    📉 不重要
                  </button>
                  <button
                    onClick={() => handleArchive(m.id)}
                    title="归档"
                    style={{ padding: "4px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #fca5a5", background: "#fff5f5", color: "#ef4444", cursor: "pointer" }}
                  >
                    🗑 归档
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}