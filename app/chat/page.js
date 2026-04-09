"use client";
import { useRouter } from "next/navigation";

const contacts = [
  {
    id: "1",
    name: "沈星回",
    avatar: "⭐",
    preview: "点击进入聊天",
    avatarBg: "#d8ecff",
  },
];

export default function ChatListPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F2F5",
        display: "flex",
        justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Apple Color Emoji", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#F0F2F5",
        }}
      >
        <div
          style={{
            height: "58px",
            background: "rgba(255,255,255,0.93)",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#222" }}>
            消息
          </div>
        </div>

        <div style={{ flex: 1, background: "#fff", marginTop: 8 }}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => router.push(`/chat/${contact.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                cursor: "pointer",
                background: "#fff",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: contact.avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                  marginRight: 12,
                }}
              >
                {contact.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: 3 }}>
                  {contact.name}
                </div>
                <div style={{ fontSize: "13px", color: "#999" }}>
                  {contact.preview}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
