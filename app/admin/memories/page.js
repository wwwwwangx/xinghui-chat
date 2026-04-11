 "use client";

export default function AdminMemoriesPage() {
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
          minHeight: "100vh",
          background: "#ffffff",
          borderLeft: "1px solid #eee",
          borderRight: "1px solid #eee",
        }}
      >
        {/* 顶部栏 */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "rgba(255,255,255,0.96)",
            borderBottom: "1px solid #f0f0f0",
            padding: "16px 18px 12px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#111",
              marginBottom: 6,
            }}
          >
            记忆管理后台
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#666",
              lineHeight: 1.5,
            }}
          >
            第一步：页面已创建。下一步再接接口拉取记忆数据。
          </div>
        </div>

        {/* 占位内容 */}
        <div style={{ padding: "18px" }}>
          <div
            style={{
              border: "1px solid #ececec",
              borderRadius: "14px",
              padding: "16px",
              background: "#fafafa",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#222",
                marginBottom: "8px",
              }}
            >
              页面状态
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                lineHeight: 1.6,
              }}
            >
              当前只完成页面壳子，还没有开始读取数据库。
            </div>
          </div>

          <div
            style={{
              border: "1px dashed #d9d9d9",
              borderRadius: "14px",
              padding: "24px 16px",
              textAlign: "center",
              color: "#999",
              fontSize: "14px",
            }}
          >
            暂无记忆列表
          </div>
        </div>
      </div>
    </div>
  );
}