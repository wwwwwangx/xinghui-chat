import BottomNav from "./components/BottomNav";
import PageWrapper from "./components/PageWrapper";
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="星回" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{ margin: 0, background: "#f5f5f5" }}>
        <PageWrapper>{children}</PageWrapper>
        <BottomNav />
      </body>
    </html>
  )
}