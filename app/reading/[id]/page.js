"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://wangxandxing.zeabur.app";

export default function ReadingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [paragraphs, setParagraphs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookTitle, setBookTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPara, setSelectedPara] = useState(null);
  const [annotations, setAnnotations] = useState({});
  const [annotationInput, setAnnotationInput] = useState("");
  const [sendingAnnotation, setSendingAnnotation] = useState(false);
  const PAGE_SIZE = 30;
  const bottomRef = useRef(null);

  // 加载书籍信息
  useEffect(() => {
    fetch(`${BACKEND}/books`)
      .then(r => r.json())
      .then(data => {
        const book = Array.isArray(data) ? data.find(b => String(b.id) === String(id)) : null;
        if (book) setBookTitle(book.title);
      })
      .catch(() => {});
  }, [id]);

  // 加载段落
  useEffect(() => {
    setLoading(true);
    fetch(`/api/books/paragraphs?bookId=${id}&page=${page}&pageSize=${PAGE_SIZE}`)
      .then(r => r.json())
      .then(data => {
        setParagraphs(data.paragraphs || []);
        if (data.paragraphs?.length > 0) {
          // 估算总页数（用total_paragraphs会更准，这里用是否有内容判断）
          setTotalPages(data.paragraphs.length < PAGE_SIZE ? page : page + 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, page]);

  // 点段落写批注
  const handleParaClick = (para) => {
    setSelectedPara(para);
    setAnnotationInput("");
  };

  // 发送批注给小克
  const sendAnnotation = async () => {
    if (!annotationInput.trim() || !selectedPara) return;
    setSendingAnnotation(true);

    const myAnnotation = annotationInput.trim();
    const paraId = selectedPara.id;

    // 先显示自己的批注
    setAnnotations(prev => ({
      ...prev,
      [paraId]: [...(prev[paraId] || []), { role: "me", text: myAnnotation }]
    }));
    setAnnotationInput("");

    // 发给小克
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: "1",
          messages: [
            {
              role: "user",
              content: `【共读批注】我正在读《${bookTitle}》，看到这段：\n\n"${selectedPara.content}"\n\n我的想法：${myAnnotation}`
            }
          ]
        })
      });
      const data = await res.json();
      const reply = data.reply || data?.choices?.[0]?.message?.content || "";
      if (reply) {
        setAnnotations(prev => ({
          ...prev,
          [paraId]: [...(prev[paraId] || []), { role: "star", text: reply }]
        }));
      }
    } catch (e) {
      console.error("批注发送失败", e);
    }
    setSendingAnnotation(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1a1a", color: "#e8e0d5",
      fontFamily: '"PingFang SC", "Hiragino Sans GB", sans-serif',
      paddingBottom: "120px",
    }}>

      {/* 顶部导航 */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(26,26,26,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", height: "52px",
      }}>
        <div onClick={() => router.back()} style={{ fontSize: "24px", color: "#aaa", cursor: "pointer" }}>‹</div>
        <div style={{ fontSize: "14px", color: "#aaa", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {bookTitle || "阅读中"}
        </div>
        <div style={{ fontSize: "13px", color: "#666" }}>第 {page} 页</div>
      </div>

      {/* 段落列表 */}
      <div style={{ padding: "20px 20px 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#555", padding: "60px 0" }}>加载中…</div>
        ) : paragraphs.length === 0 ? (
          <div style={{ textAlign: "center", color: "#555", padding: "60px 0" }}>没有内容</div>
        ) : (
          paragraphs.map((para) => (
            <div key={para.id}>
              {/* 段落本体 */}
              <div
                onClick={() => handleParaClick(para)}
                style={{
                  fontSize: "16px", lineHeight: "1.9",
                  color: selectedPara?.id === para.id ? "#f0e6d0" : "#d0c8bc",
                  padding: "8px 0 8px 16px",
                  borderLeft: annotations[para.id]?.length
                    ? "3px solid #c8a96e"
                    : selectedPara?.id === para.id
                      ? "3px solid #666"
                      : "3px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  marginBottom: "4px",
                }}
              >
                {para.content}
              </div>

              {/* 批注气泡 */}
              {annotations[para.id]?.map((ann, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: ann.role === "me" ? "flex-end" : "flex-start",
                  margin: "6px 0 6px 16px",
                }}>
                  <div style={{
                    maxWidth: "80%",
                    padding: "8px 12px",
                    borderRadius: ann.role === "me" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: ann.role === "me" ? "#4a7fa5" : "#3a3530",
                    color: ann.role === "me" ? "#fff" : "#d0c8bc",
                    fontSize: "14px", lineHeight: "1.6",
                  }}>
                    {ann.text}
                  </div>
                </div>
              ))}

              {/* 选中段落的输入框 */}
              {selectedPara?.id === para.id && (
                <div style={{
                  margin: "8px 0 16px 16px",
                  background: "#252525",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                  <div style={{ fontSize: "11px", color: "#666", marginBottom: "6px" }}>
                    💬 和小克聊聊这段
                  </div>
                  <textarea
                    value={annotationInput}
                    onChange={e => setAnnotationInput(e.target.value)}
                    placeholder="写下你的想法…"
                    autoFocus
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      outline: "none", color: "#e8e0d5", fontSize: "14px",
                      resize: "none", minHeight: "60px", lineHeight: "1.6",
                      fontFamily: "inherit",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                    <div
                      onClick={() => setSelectedPara(null)}
                      style={{ fontSize: "13px", color: "#666", cursor: "pointer" }}
                    >
                      取消
                    </div>
                    <div
                      onClick={sendAnnotation}
                      style={{
                        padding: "6px 16px", borderRadius: "20px",
                        background: sendingAnnotation ? "#444" : "#c8a96e",
                        color: sendingAnnotation ? "#888" : "#1a1a1a",
                        fontSize: "13px", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {sendingAnnotation ? "发送中…" : "发给小克"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div ref={bottomRef} />

      {/* 翻页按钮 */}
      <div style={{
        position: "fixed", bottom: "20px", left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: "16px", zIndex: 10,
      }}>
        <div
          onClick={() => { if (page > 1) { setPage(p => p - 1); window.scrollTo(0, 0); } }}
          style={{
            padding: "10px 28px", borderRadius: "24px",
            background: page <= 1 ? "rgba(60,60,60,0.6)" : "rgba(200,169,110,0.9)",
            color: page <= 1 ? "#555" : "#1a1a1a",
            fontSize: "14px", fontWeight: 600, cursor: page <= 1 ? "default" : "pointer",
          }}
        >
          上一页
        </div>
        <div
          onClick={() => { if (paragraphs.length === PAGE_SIZE) { setPage(p => p + 1); window.scrollTo(0, 0); } }}
          style={{
            padding: "10px 28px", borderRadius: "24px",
            background: paragraphs.length < PAGE_SIZE ? "rgba(60,60,60,0.6)" : "rgba(200,169,110,0.9)",
            color: paragraphs.length < PAGE_SIZE ? "#555" : "#1a1a1a",
            fontSize: "14px", fontWeight: 600, cursor: paragraphs.length < PAGE_SIZE ? "default" : "pointer",
          }}
        >
          下一页
        </div>
      </div>
    </div>
  );
}