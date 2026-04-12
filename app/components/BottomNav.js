"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  // 聊天详情页隐藏导航栏
  const isChatDetail = /^\/chat\/.+/.test(pathname);
  if (isChatDetail) return null;

  return (
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
      fontSize: "14px",
    }}>
      <Link href="/chat" style={{ textDecoration: "none", color: "#333" }}> 消息</Link>
      <Link href="/moments" style={{ textDecoration: "none", color: "#333" }}>动态</Link>
      <Link href="/me" style={{ textDecoration: "none", color: "#333" }}> 我</Link>
    </div>
  );
}