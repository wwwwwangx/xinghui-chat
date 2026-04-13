"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const contacts = [
  { id: "1", name: "沈星回", avatar: "⭐", avatarBg: "#d8ecff" },
];

export default function ChatListPage() {
  const router = useRouter();
  const [avatars, setAvatars] = useState({});
  const [currentBooks, setCurrentBooks] = useState({});

  useEffect(() => {
    const loadedAvatars = {};
    const loadedBooks = {};
    contacts.forEach(c => {
      const avatar = localStorage.getItem(`contact_avatar_${c.id}`);
      if (avatar) loadedAvatars[c.id] = avatar;
      const book = localStorage.getItem(`current_book_${c.id}`);
      if (book) {
        try { loadedBooks[c.id] = JSON.parse(book); } catch(e) {}
      }
    });
    setAvatars(loadedAvatars);
    setCurrentBooks(loadedBooks);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#F0F2F5", display: "flex",
      justifyContent: "center",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Apple Color Emoji", sans-serif',
    }}>
      <div style={{
        width: "100%", maxWidth: "430px", minHeight: "100vh",
        display: "flex", flexDirection: "column", background: "#F0F2F5",
      }}>
        <div style={{
          height: "58px", background: "rgba(255,255,255,0.93)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#222" }}>消息</div>
        </div>

        <div style={{ flex: 1, background: "#fff", marginTop: 8 }}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => router.push(`/chat/${contact.id}`)}
              style={{
                display: "flex", alignItems: "center",
                padding: "12px 16px", cursor: "pointer", background: "#fff",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "12px",
                backgroundColor: contact.avatarBg, flexShrink: 0, marginRight: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", overflow: "hidden",
              }}>
                {avatars[contact.id]
                  ? <img src={avatars[contact.id]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : contact.avatar
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: 3 }}>
                  {contact.name}
                </div>
                <div style={{ fontSize: "13px", color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentBooks[contact.id]
                    ? `📖 正在读《${currentBooks[contact.id].title}》`
                    : "点击进入聊天"
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}