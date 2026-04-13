"use client";
import { useEffect, useState, useRef } from "react";

export default function BooksAdminPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // ok | err
  const fileRef = useRef();

  const fetchBooks = async () => {
    setLoading(true);
    const res = await fetch("/api/books");
    const data = await res.json();
    setBooks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target.result);
    reader.readAsText(file, "UTF-8");
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) {
      setMsg("书名和正文不能为空");
      setMsgType("err");
      return;
    }
    setUploading(true);
    setMsg("上传中，请稍候…");
    setMsgType("");
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), author: author.trim(), content: content.trim() }),
    });
    const data = await res.json();
    setUploading(false);
    if (res.ok) {
      setMsg(`上传成功！《${data.title}》共 ${data.total_paragraphs} 段，embedding 生成中`);
      setMsgType("ok");
      setTitle(""); setAuthor(""); setContent("");
      if (fileRef.current) fileRef.current.value = "";
      fetchBooks();
    } else {
      setMsg("上传失败：" + (data.error || res.status));
      setMsgType("err");
    }
  };

  const handleDelete = async (id, bookTitle) => {
    if (!confirm(`确定删除《${bookTitle}》吗？`)) return;
    await fetch("/api/books", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchBooks();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "24px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>📚 书库管理</h1>

        {/* 上传区 */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>上传新书</div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="书名（必填）"
              style={{ flex: 1, minWidth: 140, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
            />
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="作者（选填）"
              style={{ flex: 1, minWidth: 140, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <input
              type="file"
              accept=".txt"
              ref={fileRef}
              onChange={handleFileChange}
              style={{ fontSize: 13, color: "#666" }}
            />
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>支持直接上传 txt 文件，或在下方粘贴全文</div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="或直接粘贴书的全文到这里…"
            style={{ width: "100%", height: 120, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, resize: "vertical", fontFamily: "sans-serif" }}
          />

          {msg && (
            <div style={{
              marginTop: 8, padding: "8px 12px", borderRadius: 8, fontSize: 13,
              background: msgType === "ok" ? "#f0fdf4" : msgType === "err" ? "#fff5f5" : "#f5f5f5",
              color: msgType === "ok" ? "#16a34a" : msgType === "err" ? "#ef4444" : "#888"
            }}>{msg}</div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{ marginTop: 10, padding: "8px 20px", borderRadius: 8, border: "none", background: uploading ? "#ccc" : "#111", color: "#fff", cursor: uploading ? "not-allowed" : "pointer", fontSize: 14 }}
          >
            {uploading ? "上传中…" : "上传这本书"}
          </button>
        </div>

        {/* 书单 */}
        <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>共 {books.length} 本书</div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#999", padding: 40 }}>加载中…</div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999", padding: 40 }}>还没有上传任何书</div>
        ) : (
          books.map((b) => (
            <div key={b.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>《{b.title}》</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    {b.author && <span style={{ fontSize: 12, color: "#888" }}>{b.author}</span>}
                    <span style={{ fontSize: 12, color: "#aaa" }}>{b.total_paragraphs} 段</span>
                    <span style={{ fontSize: 12, color: "#aaa" }}>{new Date(b.created_at).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(b.id, b.title)}
                  style={{ padding: "4px 12px", fontSize: 12, borderRadius: 6, border: "1px solid #fca5a5", background: "#fff5f5", color: "#ef4444", cursor: "pointer" }}
                >
                  🗑 删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}