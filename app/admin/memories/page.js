"use client";

import { useEffect, useState } from "react";

export default function AdminMemoriesPage() {
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    fetch("https://wangxandxing.zeabur.app/manage/memories")
      .then((res) => res.json())
      .then((data) => {
        console.log("记忆数据：", data);
        setMemories(data);
      })
      .catch((err) => {
        console.error("获取记忆失败:", err);
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6f8",
        display: "flex",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#fff",
          padding: "16px",
        }}
      >
        <h2 style={{ marginBottom: "12px" }}>记忆列表</h2>

        {memories.length === 0 ? (
          <div style={{ color: "#999" }}>暂无记忆</div>
        ) : (
          memories.map((m) => (
            <div
              key={m.id}
              style={{
                border: "1px solid #eee",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "10px",
                background: "#fafafa",
              }}
            >
              <div style={{ fontSize: "14px", marginBottom: "6px" }}>
                {m.content}
              </div>

              <div style={{ fontSize: "12px", color: "#666" }}>
                type: {m.type} ｜ status: {m.status}
              </div>

              <div style={{ fontSize: "12px", color: "#999" }}>
                importance: {m.importance}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}