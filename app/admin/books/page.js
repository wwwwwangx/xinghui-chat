"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function BooksAdminPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) {
      setBooks([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target.result);
    reader.onerror = () => {
      // GBK fallback
      const r2 = new FileReader();
      r2.onload = (ev2) => setContent(ev2.target.result);
      r2.readAsText(file, "GBK");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) {
      setMsg("书名和正文不能为空");
      setMsgType("err");
      return;
    }
    setUploading(true);
    setProgress(10);
    setProgressText("解析段落中…");
    setMsg("");

    // 模拟进度推进
    const timer1 = setTimeout(() => { setProgress(30); setProgressText("上传到服务器…"); }, 600);
    const timer2 = setTimeout(() => { setProgress(55); setProgressText("服务器处理中…"); }, 1500);
    const timer3 = setTimeout(() => { setProgress(75); setProgressText("生成语义向量…"); }, 3000);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), author: author.trim(), content: content.trim() }),
      });
      const data = await res.json();
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);

      if (res.ok) {
        setProgress(100);
        setProgressText(`完成！共 ${data.total_paragraphs} 段，embedding 后台生成中`);
        setMsgType("ok");
        setMsg(`《${data.title}》上传成功，共 ${data.total_paragraphs} 段`);
        setTitle(""); setAuthor(""); setContent(""); setFileName("");
        if (fileRef.current) fileRef.current.value = "";
        setTimeout(() => {
          setShowUpload(false);
          setProgress(0);
          setProgressText("");
          fetchBooks();
        }, 2000);
      } else {
        clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
        setProgress(0);
        setProgressText("");
        setMsg("上传失败：" + (data.error || res.status));
        setMsgType("err");
      }
    } catch (e) {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
      setProgress(0);
      setProgressText("");
      setMsg("连接失败：" + e.message);
      setMsgType("err");
    }
    setUploading(false);
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

  const bookColors = ["#c8dff0", "#f0c8d0", "#c8f0d8", "#f0e0c8", "#d8c8f0", "#c8f0f0"];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F5", fontFamily: "sans-serif", paddingBottom: "80px" }}>

      {/* 顶部导航 */}
      <div style={{
        height: "58px", background: "rgba(255,255,255,0.95)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", position: "sticky", top: 0, zIndex: 10,
        boxSizing: "border-box",
      }}>
        <div onClick={() => router.back()} style={{ fontSize: "26px", color: "#222", cursor: "pointer", lineHeight: 1, padding: "4px 8px 4px 0" }}>‹</div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#222" }}>📚 书库</div>
        <div
          onClick={() => { setShowUpload(true); setMsg(""); setProgress(0); }}
          style={{ fontSize: "14px", color: "#07c160", cursor: "pointer", fontWeight: 600, padding: "4px" }}
        >
          + 上传
        </div>
      </div>

      {/* 书架区 */}
      <div style={{ padding: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: "60px 0" }}>加载中…</div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📖</div>
            <div style={{ color: "#aaa", fontSize: "14px" }}>书架空空的</div>
            <div style={{ color: "#ccc", fontSize: "13px", marginTop: "6px" }}>点右上角 + 上传 添加第一本书</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "12px" }}>共 {books.length} 本</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {books.map((b, i) => (
                <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  {/* 书封面 */}
                  <div
                    onClick={() => router.push(`/reading/${b.id}`)}
                    style={{
                      width: "100%", aspectRatio: "2/3",
                      background: bookColors[i % bookColors.length],
                      borderRadius: "4px 10px 10px 4px",
                      boxShadow: "3px 3px 8px rgba(0,0,0,0.12), -1px 0 0 rgba(0,0,0,0.08)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      padding: "12px 8px", boxSizing: "border-box",
                      cursor: "pointer", position: "relative", overflow: "hidden",
                    }}
                  >
                    {/* 书脊效果 */}
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0, width: "8px",
                      background: "rgba(0,0,0,0.08)", borderRadius: "4px 0 0 4px",
                    }} />
                    <div style={{
                      fontSize: "13px", fontWeight: 700, color: "#333",
                      textAlign: "center", lineHeight: 1.4, wordBreak: "break-all",
                      maxHeight: "60%", overflow: "hidden",
                    }}>
                      {b.title}
                    </div>
                    {b.author && (
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "6px", textAlign: "center" }}>
                        {b.author}
                      </div>
                    )}
                    <div style={{
                      position: "absolute", bottom: "6px",
                      fontSize: "10px", color: "rgba(0,0,0,0.35)",
                    }}>
                      {b.total_paragraphs} 段
                    </div>
                  </div>

                  {/* 书名 + 删除 */}
                  <div style={{ width: "100%", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#333", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {b.title}
                    </div>
                    <div
                      onClick={() => handleDelete(b.id, b.title)}
                      style={{ fontSize: "11px", color: "#ef4444", cursor: "pointer", marginTop: "2px" }}
                    >
                      删除
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 上传抽屉 */}
      {showUpload && (
        <>
          <div
            onClick={() => !uploading && setShowUpload(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100 }}
          />
          <div style={{
            position: "fixed", left: 0, right: 0, bottom: 0,
            background: "#fff", borderRadius: "20px 20px 0 0",
            padding: "16px 16px 40px", zIndex: 101,
            boxShadow: "0 -8px 30px rgba(0,0,0,0.12)",
          }}>
            {/* 把手 */}
            <div style={{ width: "40px", height: "4px", background: "#e0e0e0", borderRadius: "999px", margin: "0 auto 16px" }} />
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#222", marginBottom: "16px" }}>上传新书</div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="书名（必填）"
                style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", outline: "none" }}
              />
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="作者（选填）"
                style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", outline: "none" }}
              />
            </div>

            {/* 文件选择大按钮 */}
            <input type="file" accept=".txt" ref={fileRef} onChange={handleFileChange} style={{ display: "none" }} />
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed #c0d8f0", borderRadius: "12px",
                padding: "20px", textAlign: "center", cursor: "pointer",
                background: fileName ? "#f0f8ff" : "#fafafa", marginBottom: "12px",
              }}
            >
              {fileName ? (
                <>
                  <div style={{ fontSize: "28px", marginBottom: "6px" }}>📄</div>
                  <div style={{ fontSize: "14px", color: "#333", fontWeight: 500 }}>{fileName}</div>
                  <div style={{ fontSize: "12px", color: "#07c160", marginTop: "4px" }}>点击重新选择</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "28px", marginBottom: "6px" }}>📂</div>
                  <div style={{ fontSize: "14px", color: "#555", fontWeight: 500 }}>点击选择 txt 文件</div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>支持中文小说 txt 格式</div>
                </>
              )}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="或直接粘贴全文到这里…"
              style={{
                width: "100%", height: "80px", padding: "10px 12px",
                borderRadius: "10px", border: "1px solid #e0e0e0",
                fontSize: "13px", resize: "none", fontFamily: "sans-serif",
                boxSizing: "border-box", outline: "none", color: "#333",
              }}
            />

            {/* 进度条 */}
            {uploading && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>{progressText}</span>
                  <span style={{ fontSize: "12px", color: "#07c160", fontWeight: 600 }}>{progress}%</span>
                </div>
                <div style={{ height: "6px", background: "#f0f0f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${progress}%`,
                    background: "linear-gradient(90deg, #07c160, #39d353)",
                    borderRadius: "999px",
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            )}

            {msg && (
              <div style={{
                marginTop: "10px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
                background: msgType === "ok" ? "#f0fdf4" : "#fff5f5",
                color: msgType === "ok" ? "#16a34a" : "#ef4444",
              }}>{msg}</div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                marginTop: "12px", width: "100%", padding: "14px",
                borderRadius: "12px", border: "none",
                background: uploading ? "#ccc" : "#111",
                color: "#fff", fontSize: "15px", fontWeight: 600,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "上传中…" : "上传这本书"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}