import BottomNav from "./components/BottomNav";
import PageWrapper from "./components/PageWrapper";
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, interactive-widget=resizes-content"
        />
      </head>
      <body style={{ margin: 0, background: "#f5f5f5" }}>
        <PageWrapper>{children}</PageWrapper>
        <BottomNav />
      </body>
    </html>
  )
}