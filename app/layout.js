import Link from "next/link"
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, background: "#f5f5f5" }}>

        {/* 页面主体 */}
        <div style={{ paddingBottom: "60px" }}>
          {children}
        </div>

        {/* 底部导航栏 */}
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "#fff",
          borderTop: "1px solid #eee",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          fontSize: "14px"
        }}>
          <Link href="/chat" style={{ textDecoration: "none", color: "#333" }}>
            💬 消息
          </Link>
          <Link href="/moments" style={{ textDecoration: "none", color: "#333" }}>
            🌿 动态
          </Link>
          <Link href="/me" style={{ textDecoration: "none", color: "#333" }}>
            👤 我
          </Link>
        </div>

      </body>
    </html>
  )
}