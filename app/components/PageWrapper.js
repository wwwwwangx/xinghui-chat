"use client";
import { usePathname } from "next/navigation";

export default function PageWrapper({ children }) {
  const pathname = usePathname();
  // 聊天详情页不加底部 padding（它自己管高度）
  const isChatDetail = /^\/chat\/.+/.test(pathname);
  return (
    <div style={{ paddingBottom: isChatDetail ? 0 : "60px" }}>
      {children}
    </div>
  );
}