"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [openThought, setOpenThought] = useState(null);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showPlusPanel, setShowPlusPanel] = useState(false);
  const [selectedEmojiTab, setSelectedEmojiTab] = useState("default");
  const [previewImage, setPreviewImage] = useState(null);
  const [activeMessage, setActiveMessage] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showThoughtDrawer, setShowThoughtDrawer] = useState(false);
  const [activeThought, setActiveThought] = useState("");

  const chatEndRef = useRef(null);
  const photoInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const musicInputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const externalEmojiLibrary = {
    reserve1: ["🐰", "🫧", "💫", "🌷", "🎀", "🍓", "🧸", "🌙", "☁️", "🪄", "💌", "🍰"],
  };

  const emojiTabs = useMemo(
    () => ({
      default: {
        label: "默认",
        items: [
          "😀","😁","😂","🥺","😭","😴",
          "😍","😘","🤍","💚","✨","❄️",
          "🌙","🥹","😚","😳","🙃","😮",
          "😤","🤔","🫠","😇","😉","😡",
        ],
      },
      cute: {
        label: "可爱",
        items: [
          "૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა",
          "(˶˃ ᵕ ˂˶)",
          "(｡•̀ᴗ-)✧",
          "ฅ^•ﻌ•^ฅ",
          "ʕ•̀ω•́ʔ",
          "(づ｡◕‿‿◕｡)づ",
        ],
      },
      reserve1: {
        label: "系列1",
        items:
          externalEmojiLibrary.reserve1?.length
            ? externalEmojiLibrary.reserve1
            : ["[预留1]", "[预留2]", "[预留3]", "[预留4]"],
      },
    }),
    []
  );

  const recentEmojis = ["🥺", "🤍", "💚", "✨", "😭", "😚"];

  const plusActions = [
    { key: "photo", label: "照片", icon: "🖼" },
    { key: "camera", label: "拍摄", icon: "📷" },
    { key: "call", label: "语音通话", icon: "📞" },
    { key: "location", label: "位置", icon: "📍" },
    { key: "hongbao", label: "红包", icon: "🧧" },
    { key: "gift", label: "礼物", icon: "🎁" },
    { key: "transfer", label: "转账", icon: "⇄" },
    { key: "voiceInput", label: "语音输入", icon: "🎤" },
    { key: "favorite", label: "收藏", icon: "⭐" },
    { key: "file", label: "文件", icon: "📄" },
    { key: "music", label: "音乐", icon: "🎵" },
  ];

  const getCurrentTime = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatFileSize = (size) => {
    if (!size && size !== 0) return "";
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  const addEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
  };

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("上传失败");
    }

    return res.json();
  };

 const sendMessage = async () => {
  const text = input.trim();
  if (!text) return;

  const userMessage = {
    id: `m-${Date.now()}`,
    type: "message",
    role: "me",
    avatar: "我",
    text,
    time: getCurrentTime(),
    read: true,
  };

  setMessages((prev) => [...prev, userMessage]);
  setInput("");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

      const data = await res.json();
      const aiText = data?.reply || "";
      const replies = aiText
  .split(/\n|(?<=[。！？.!?])/)
  .map((s) => s.trim())
  .filter(Boolean);



for (let i = 0; i < replies.length; i++) {
  const text = replies[i];

  setMessages((prev) => [
    ...prev,
    {
      id: `m-${Date.now()}-${i}`,
      type: "message",
      role: "other",
      avatar: "星",
      text,
     thoughtSummary: data?.thoughtSummary || "他刚刚在想点什么",
     thoughtFull: data?.thoughtFull || "",
      time: getCurrentTime(),
      read: true,
    },
  ]);

  if (i < replies.length - 1) {
    await new Promise((r) => setTimeout(r, 400));
  }
}

     
  } catch (err) {
    console.error(err);

    const errorMessage = {
      id: `m-${Date.now()}-err`,
      type: "message",
      role: "other",
      avatar: "系统",
      text: "出错了，稍后再试",
      time: getCurrentTime(),
      read: true,
    };

    setMessages((prev) => [...prev, errorMessage]);
   }
   };

  const handleImageSelect = async (file, source = "照片") => {
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    const tempId = `m-${Date.now()}`;

    appendMessage({
      id: tempId,
      type: "card",
      cardType: "photo",
      role: "me",
      avatar: "我",
      time: getCurrentTime(),
      read: true,
      title: source === "拍摄" ? "新拍照片" : file.name || "图片",
      subtitle: `上传中... ${formatFileSize(file.size)}`,
      imageUrl: localUrl,
      uploading: true,
    });

    setShowPlusPanel(false);

    try {
      const result = await uploadFile(file);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                imageUrl: result.url,
                subtitle:
                  source === "拍摄"
                    ? `刚刚拍摄 · ${formatFileSize(file.size)}`
                    : `图片 · ${formatFileSize(file.size)}`,
                uploading: false,
              }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                subtitle: "上传失败",
                uploading: false,
              }
            : msg
        )
      );
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const tempId = `m-${Date.now()}`;

    appendMessage({
      id: tempId,
      type: "card",
      cardType: type,
      role: "me",
      avatar: "我",
      time: getCurrentTime(),
      read: true,
      title: file.name,
      subtitle: "上传中...",
      url: "",
      uploading: true,
    });

    setShowPlusPanel(false);

    try {
      const result = await uploadFile(file);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                subtitle:
                  type === "music"
                    ? `音频文件 · ${formatFileSize(file.size)}`
                    : `${file.type || "文件"} · ${formatFileSize(file.size)}`,
                url: result.url,
                uploading: false,
              }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                subtitle: "上传失败",
                uploading: false,
              }
            : msg
        )
      );
    }
  };

  const handleLocationSelect = () => {
    if (!navigator.geolocation) {
      appendMessage({
        id: `m-${Date.now()}`,
        type: "message",
        role: "me",
        avatar: "我",
        text: "[位置] 当前浏览器不支持定位",
        time: getCurrentTime(),
        read: true,
      });
      setShowPlusPanel(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);

        appendMessage({
          id: `m-${Date.now()}`,
          type: "card",
          cardType: "location",
          role: "me",
          avatar: "我",
          time: getCurrentTime(),
          read: true,
          title: `纬度 ${lat} · 经度 ${lng}`,
          subtitle: "当前定位",
        });

        setShowPlusPanel(false);
      },
      () => {
        appendMessage({
          id: `m-${Date.now()}`,
          type: "message",
          role: "me",
          avatar: "我",
          text: "[位置] 未获得定位权限",
          time: getCurrentTime(),
          read: true,
        });
        setShowPlusPanel(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFavoriteAction = () => {
    const latest = [...messages]
      .reverse()
      .find((msg) => msg.type !== "date");

    if (!latest) {
      appendMessage({
        id: `m-${Date.now()}`,
        type: "message",
        role: "me",
        avatar: "我",
        text: "[收藏] 当前没有可收藏内容",
        time: getCurrentTime(),
        read: true,
      });
      setShowPlusPanel(false);
      return;
    }
    setFavorites(prev => [...prev, latest]);

    let previewText = "";
    if (latest.type === "message") {
      previewText = latest.text;
    } else if (latest.cardType === "photo") {
      previewText = "[图片]";
    } else if (latest.cardType === "location") {
      previewText = "[位置]";
    } else if (latest.cardType === "file") {
      previewText = "[文件]";
    } else if (latest.cardType === "music") {
      previewText = "[音乐]";
    } else if (latest.cardType === "hongbao") {
      previewText = "[红包]";
    } else if (latest.cardType === "gift") {
      previewText = "[礼物]";
    } else if (latest.cardType === "transfer") {
      previewText = "[转账]";
    }

    appendMessage({
      id: `m-${Date.now()}`,
      type: "card",
      cardType: "favorite",
      role: "me",
      avatar: "我",
      time: getCurrentTime(),
      read: true,
      title: "已收藏一条消息",
      subtitle: previewText || "[内容]",
    });

    setShowPlusPanel(false);
  };

  const sendPlusActionMessage = (action) => {
    const time = getCurrentTime();
    let newMessage;

    if (action.key === "photo") {
      photoInputRef.current?.click();
      return;
    }

    if (action.key === "camera") {
      cameraInputRef.current?.click();
      return;
    }

    if (action.key === "file") {
      fileInputRef.current?.click();
      return;
    }

    if (action.key === "music") {
      musicInputRef.current?.click();
      return;
    }

    if (action.key === "location") {
      handleLocationSelect();
      return;
    }

    if (action.key === "favorite") {
      handleFavoriteAction();
      return;
    }

    if (action.key === "hongbao") {
      newMessage = {
        id: `m-${Date.now()}`,
        type: "card",
        cardType: "hongbao",
        role: "me",
        avatar: "我",
        time,
        read: true,
        title: "恭喜发财",
        subtitle: "给你的小红包",
      };
    } else if (action.key === "gift") {
      newMessage = {
        id: `m-${Date.now()}`,
        type: "card",
        cardType: "gift",
        role: "me",
        avatar: "我",
        time,
        read: true,
        title: "送你一份礼物",
        subtitle: "拆开看看",
      };
    } else if (action.key === "transfer") {
      newMessage = {
        id: `m-${Date.now()}`,
        type: "card",
        cardType: "transfer",
        role: "me",
        avatar: "我",
        time,
        read: true,
        amount: "52.00",
        title: "宝宝的小心意",
        subtitle: "转账",
      };
    } else {
      const actionTextMap = {
        call: "[语音通话] 发起了语音通话邀请",
        voiceInput: "[语音输入] 准备使用语音输入",
      };

      newMessage = {
        id: `m-${Date.now()}`,
        type: "message",
        role: "me",
        avatar: "我",
        text: actionTextMap[action.key] || `[${action.label}]`,
        time,
        read: true,
      };
    }

    setMessages((prev) => [...prev, newMessage]);
    setShowPlusPanel(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showEmojiPanel, showPlusPanel]);
  useEffect(() => {
  const saved = localStorage.getItem("chat_messages");
  if (saved) {
    setMessages(JSON.parse(saved));
  }
}, []);
  useEffect(() => {
  localStorage.setItem("chat_messages", JSON.stringify(messages));
}, [messages]);
 useEffect(() => {
  const savedFavorites = localStorage.getItem("chat_favorites");
  if (savedFavorites) {
    setFavorites(JSON.parse(savedFavorites));
  }
}, []);
 useEffect(() => {
  localStorage.setItem("chat_favorites", JSON.stringify(favorites));
}, [favorites]);
return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f4f4",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#9db8e2",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.14), transparent 18%), radial-gradient(circle at 72% 30%, rgba(255,255,255,0.10), transparent 16%), radial-gradient(circle at 30% 72%, rgba(255,255,255,0.08), transparent 15%), linear-gradient(to bottom, #9db8e2 0%, #97b3de 100%)",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "58px",
            background: "rgba(255,255,255,0.93)",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "26px", color: "#222", lineHeight: 1 }}>‹</div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#222",
              letterSpacing: "0.2px",
            }}
          >
            沈星回
          </div>

          <div
            style={{
              display: "flex",
              gap: "14px",
              color: "#222",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "18px" }}>⌕</span>
            <span style={{ fontSize: "18px" }}>⌕̸</span>
            <span style={{ fontSize: "22px", marginTop: "-2px" }}>☰</span>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            overflowY: "auto",
            padding: "14px 10px 10px",
            boxSizing: "border-box",
          }}
        >          {messages.map((item) => {
            if (item.type === "date") {
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "10px 0 14px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(104,123,151,0.55)",
                      color: "#fff",
                      fontSize: "12px",
                      padding: "5px 12px",
                      borderRadius: "999px",
                      lineHeight: 1,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            }

            const msg = item;
            const isMe = msg.role === "me";

            if (msg.type === "card" && isMe) {
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "6px",
                      maxWidth: "84%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                        fontSize: "11px",
                        color: "rgba(63,79,84,0.58)",
                        lineHeight: 1.15,
                        minWidth: "34px",
                        marginBottom: "4px",
                      }}
                    >
                      <span>{msg.read ? "已读" : ""}</span>
                      <span>{msg.time}</span>
                    </div>

                    {msg.cardType === "hongbao" && (
                      <div
                        style={{
                          width: "220px",
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "linear-gradient(180deg, #ef5b4b 0%, #d94738 100%)",
                          color: "#fff8e8",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                        }}
                      >
                        <div style={{ padding: "14px 16px 12px", display: "flex", gap: "12px", alignItems: "center" }}>
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.18)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "22px",
                            }}
                          >
                            🧧
                          </div>
                          <div>
                            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
                              {msg.title}
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.95 }}>
                              {msg.subtitle}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            background: "rgba(0,0,0,0.08)",
                            padding: "8px 14px",
                            fontSize: "12px",
                            color: "#ffe9cf",
                          }}
                        >
                          红包
                        </div>
                      </div>
                    )}

                    {msg.cardType === "gift" && (
                      <div
                        style={{
                          width: "220px",
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "linear-gradient(180deg, #f9b44e 0%, #f39a2d 100%)",
                          color: "#fffaf0",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                        }}
                      >
                        <div style={{ padding: "14px 16px 12px", display: "flex", gap: "12px", alignItems: "center" }}>
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.18)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "22px",
                            }}
                          >
                            🎁
                          </div>
                          <div>
                            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
                              {msg.title}
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.95 }}>
                              {msg.subtitle}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            background: "rgba(255,255,255,0.16)",
                            padding: "8px 14px",
                            fontSize: "12px",
                            color: "#fff5dd",
                          }}
                        >
                          礼物
                        </div>
                      </div>
                    )}

                    {msg.cardType === "transfer" && (
                      <div
                        style={{
                          width: "260px",
                          borderRadius: "20px",
                          overflow: "hidden",
                          background: "#f6a23d",
                          color: "#fff",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                        }}
                      >
                        <div
                          style={{
                            padding: "18px 18px 14px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "14px",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              border: "3px solid rgba(255,255,255,0.9)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "22px",
                              fontWeight: 700,
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            ⇄
                          </div>

                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "21px",
                                fontWeight: 800,
                                lineHeight: 1,
                                marginBottom: "8px",
                              }}
                            >
                              {msg.amount}
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                lineHeight: 1.3,
                                opacity: 0.96,
                              }}
                            >
                              {msg.title}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            height: "1px",
                            background: "rgba(255,255,255,0.45)",
                            margin: "0 18px",
                          }}
                        />

                        <div
                          style={{
                            padding: "10px 18px 12px",
                            fontSize: "14px",
                            color: "#ffeccf",
                          }}
                        >
                          {msg.subtitle}
                        </div>
                      </div>
                    )}

                    {msg.cardType === "photo" && (
                      <div
                        style={{
                          width: "220px",
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "#ffffff",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                        }}
                      >
                        <div
                          style={{
                            height: "132px",
                            background: "#dbeafe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {msg.imageUrl ? (
                            <img
                              src={msg.imageUrl}
                              onClick={() => setPreviewImage(msg.imageUrl)}
                              alt={msg.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: "42px" }}>🖼</div>
                          )}
                        </div>
                        <div style={{ padding: "10px 12px 12px" }}>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#222", marginBottom: "4px" }}>
                            {msg.title}
                          </div>
                          <div style={{ fontSize: "12px", color: msg.uploading ? "#f59e0b" : "#666" }}>
                            {msg.subtitle}
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.cardType === "location" && (
                      <div
                        style={{
                          width: "220px",
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "#fff",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                        }}
                      >
                        <div
                          style={{
                            height: "108px",
                            background:
                              "linear-gradient(135deg, #d9f1ff 0%, #b7e4ff 35%, #dff6d8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "36px",
                          }}
                        >
                          📍
                        </div>
                        <div style={{ padding: "10px 12px 12px" }}>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#222", marginBottom: "4px" }}>
                            {msg.title}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {msg.subtitle}
                          </div>
                        </div>
                      </div>
                    )}                    {msg.cardType === "file" && (
                      <div
                      onClick={() => msg.url && window.open(msg.url, "_blank")}
                        style={{
                          width: "220px",
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "#fff",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                          padding: "14px 14px 12px",
                          cursor: "pointer",
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div
                            style={{
                              width: "42px",
                              height: "50px",
                              borderRadius: "10px",
                              background: "#e74c3c",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            FILE
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#222",
                                marginBottom: "4px",
                                wordBreak: "break-word",
                              }}
                            >
                              {msg.title}
                            </div>
                            <div style={{ fontSize: "12px", color: msg.uploading ? "#f59e0b" : "#666" }}>
                              {msg.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.cardType === "music" && (
                      <div
                      onClick={() => msg.url && window.open(msg.url, "_blank")}
                        style={{
                          width: "220px",
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "linear-gradient(135deg, #5865f2 0%, #8b5cf6 100%)",
                          color: "#fff",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                          padding: "14px 14px 12px",
                          boxSizing: "border-box",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.18)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "20px",
                              flexShrink: 0,
                            }}
                          >
                            🎵
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "15px",
                                fontWeight: 700,
                                marginBottom: "4px",
                                wordBreak: "break-word",
                              }}
                            >
                              {msg.title}
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.92 }}>
                              {msg.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.cardType === "favorite" && (
                      <div
                        style={{
                          width: "220px",
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "#fffbe8",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                          border: "1px solid rgba(234,179,8,0.22)",
                          padding: "14px 14px 12px",
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "50%",
                              background: "rgba(234,179,8,0.16)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "20px",
                              flexShrink: 0,
                            }}
                          >
                            ⭐
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222", marginBottom: "4px" }}>
                              {msg.title}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                wordBreak: "break-word",
                              }}
                            >
                              {msg.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "999px",
                        background: "#e8f2ff",
                        border: "1px solid rgba(255,255,255,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        color: "#53657c",
                        flexShrink: 0,
                      }}
                    >
                      我
                    </div>
                  </div>
                </div>
              );
            }

            if (isMe) {
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "6px",
                      maxWidth: "84%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                        fontSize: "11px",
                        color: "rgba(62,70,84,0.58)",
                        lineHeight: 1.15,
                        minWidth: "34px",
                        marginBottom: "4px",
                      }}
                    >
                      <span>{msg.read ? "已读" : ""}</span>
                      <span>{msg.time}</span>
                    </div>

                    <div
                      onContextMenu={(e) => {
                     e.preventDefault();
                     setActiveMessage(msg);
                       setMenuPosition({ x: e.clientX, y: e.clientY }); 
                      setShowMessageMenu(true);
                     }}
                      style={{
                       background: "#95ec69",
                       color: "#000",
                       padding: "10px 14px",
                       borderRadius: "16px 16px 4px 16px",
                       fontSize: "15px",
                       lineHeight: 1.4,
                       boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}
                    </div>

                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "999px",
                        background: "#e8f2ff",
                        border: "1px solid rgba(255,255,255,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        color: "#53657c",
                        flexShrink: 0,
                      }}
                    >
                      我
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    maxWidth: "84%",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "999px",
                      background: "#d8ecff",
                      border: "1px solid rgba(255,255,255,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      color: "#53657c",
                      flexShrink: 0,
                    }}
                  >
                    {msg.avatar}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    {msg.thoughtSummary ? (
                      <button
                        onClick={() => setOpenThought(msg)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          margin: "0 0 6px 2px",
                          cursor: "pointer",
                          color: "rgba(70,70,70,0.62)",
                          fontSize: "12px",
                          lineHeight: 1.2,
                        }}
                        title="查看思考链"
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "rgba(120,120,120,0.68)",
                          }}
                        >
                          🩶
                        </span>
                        <span
                          style={{
                            maxWidth: "210px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textAlign: "left",
                          }}
                        >
                          {msg.thoughtSummary}
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            color: "rgba(90,90,90,0.6)",
                          }}
                        >
                          ›
                        </span>
                      </button>
                    ) : null}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "6px",
                      }}
                    >
                      <div
                        onContextMenu={(e) => {
                        e.preventDefault();
                       setActiveMessage(msg);
                         setMenuPosition({ x: e.clientX, y: e.clientY }); 
                        setShowMessageMenu(true);
                       }}
                        style={{
                         background: "#fff",
                         color: "#000",
                         padding: "10px 14px",
                         borderRadius: "16px 16px 16px 4px",
                         fontSize: "15px",
                         lineHeight: 1.4,
                         boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          whiteSpace: "pre-line",
                          wordBreak: "break-word",
                          minWidth: "80px",
                        }}
                      >
                      {msg.role === "other" && (
                      <div
                      onClick={() => {
                        setActiveThought(
                        msg.thought ||
                         "他刚刚在想，要怎么回你才既自然，又不显得敷衍。"
                          );
                    
                     setShowThoughtDrawer(true);
                    }}
                    style={{
                      fontSize: "12px",
                   color: "rgba(120,120,120,0.6)",
                    marginBottom: "4px",
                      paddingLeft: "6px",
                       cursor: "pointer",
                        }}
                        >
                                       🩶 他刚刚好像在想点什么
                        </div>
                       )}
                        {msg.text}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgba(62,70,84,0.58)",
                          marginBottom: "4px",
                        }}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={chatEndRef} />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            background: "rgba(255,255,255,0.97)",
            borderTop: "1px solid rgba(0,0,0,0.05)",
            padding: "8px 10px 10px",
          }}
        >          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <button
              style={leftArrowBtnStyle}
              onClick={() => {
                setShowPlusPanel((prev) => !prev);
                setShowEmojiPanel(false);
              }}
              title="更多功能"
            >
              +
            </button>

            <div
              style={{
                flex: 1,
                height: "40px",
                background: "#f7f7f7",
                border: "1px solid #ececec",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                boxSizing: "border-box",
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
               sendMessage();
               }
               }}
                placeholder="输入消息"
                rows={1}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  resize: "none",
                  background: "transparent",
                  fontSize: "14px",
                  lineHeight: 1.4,
                  paddingTop: "10px",
                  maxHeight: "88px",
                  fontFamily: "inherit",
                  color: "#222",
                }}
              />

              <button
                style={smallIconBtnStyle}
                title="表情"
                onClick={() => {
                  setShowEmojiPanel((prev) => !prev);
                  setShowPlusPanel(false);
                }}
              >
                ☺
              </button>
            </div>

            <button
              style={sendBtnStyle}
              onClick={sendMessage}
              title="发送"
            >
              发送
            </button>
          </div>

          {showEmojiPanel && (
            <div
              style={{
                marginTop: "10px",
                padding: "12px",
                background: "#fff",
                borderRadius: "14px",
                boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "10px",
                  overflowX: "auto",
                }}
              >
                {Object.entries(emojiTabs).map(([key, tab]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedEmojiTab(key)}
                    style={{
                      border: "none",
                      background:
                        selectedEmojiTab === key ? "#f0f0f0" : "transparent",
                      borderRadius: "10px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      color: "#555",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#777",
                  marginBottom: "8px",
                }}
              >
                最近使用
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                {recentEmojis.map((e, i) => (
                  <div
                    key={i}
                    onClick={() => addEmoji(e)}
                    style={{
                      fontSize: "22px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    {e}
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#777",
                  marginBottom: "8px",
                }}
              >
                {emojiTabs[selectedEmojiTab].label}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "10px",
                }}
              >
                {emojiTabs[selectedEmojiTab].items.map((e, i) => (
                  <div
                    key={i}
                    onClick={() => addEmoji(e)}
                    style={{
                      fontSize: "22px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    {e}
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "#888",
                }}
              >
                + 添加表情包（以后接入）
              </div>
            </div>
          )}

          {showPlusPanel && (
            <div
              style={{
                marginTop: "10px",
                background: "#fff",
                padding: "14px 10px 8px",
                borderRadius: "14px",
                boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "14px 8px",
                }}
              >
                {plusActions.map((action) => (
                  <div
                    key={action.key}
                    onClick={() => sendPlusActionMessage(action)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "16px",
                        background: "#f7f7f7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        marginBottom: "6px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      {action.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#555",
                        textAlign: "center",
                      }}
                    >
                      {action.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file, "照片");
              e.target.value = "";
            }}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file, "拍摄");
              e.target.value = "";
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "file");
              e.target.value = "";
            }}
          />

          <input
            ref={musicInputRef}
            type="file"
            accept="audio/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "music");
              e.target.value = "";
            }}
          />
        </div>

       
{previewImage && (
  <div
    onClick={() => setPreviewImage(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.9)",
      zIndex: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <img
      src={previewImage}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    />
  </div>
)}
        {openThought ? (
          <>
            <div
              onClick={() => setOpenThought(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.18)",
                zIndex: 20,
              }}
            />

            <div
              style={{
                position: "fixed",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 0,
                width: "100%",
                maxWidth: "430px",
                minHeight: "42vh",
                background: "#f8f6f3",
                borderTopLeftRadius: "28px",
                borderTopRightRadius: "28px",
                zIndex: 21,
                boxShadow: "0 -10px 40px rgba(0,0,0,0.12)",
                padding: "14px 18px 28px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "5px",
                  borderRadius: "999px",
                  background: "#d6d2cc",
                  margin: "0 auto 16px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <button
                  onClick={() => setOpenThought(null)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "18px",
                    color: "#444",
                    cursor: "pointer",
                    padding: 0,
                    width: "28px",
                    height: "28px",
                  }}
                >
                  ✕
                </button>

                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#222",
                  }}
                >
                  Thought process
                </div>

                <div style={{ width: "28px" }} />
              </div>

              <div
                style={{
                  fontSize: "16px",
                  lineHeight: 1.9,
                  color: "#222",
                  whiteSpace: "pre-wrap",
                }}
              >
                {openThought.thoughtFull}
              </div>
            </div>
          </>
        ) : null}
        {showMessageMenu && (
  <div style={{
       position: "fixed",
       top: menuPosition.y,
       left: menuPosition.x,
       transform: "translate(-50%, -100%)",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    padding: "10px",
    zIndex: 9999
     }}>
    <div
      onClick={() => {
        setFavorites(prev => [...prev, activeMessage]);
        setShowMessageMenu(false);
      }}
      style={{ padding: "8px 16px", cursor: "pointer" }}
    >
      ⭐ 收藏
    </div>

    <div
      onClick={() => {
        setMessages(prev => prev.filter(m => m.id !== activeMessage.id));
        setShowMessageMenu(false);
      }}
      style={{ padding: "8px 16px", cursor: "pointer", color: "red" }}
    >
      🗑 删除
    </div>
   </div>
   )}

        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.9)",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={previewImage}
              alt="preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>
      {showThoughtDrawer && (
  <>
    <div
      onClick={() => setShowThoughtDrawer(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.22)",
        zIndex: 999,
      }}
    />

    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 0,
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "430px",
        background: "#fff",
        borderTopLeftRadius: "18px",
        borderTopRightRadius: "18px",
        padding: "14px 16px 24px",
        boxShadow: "0 -8px 30px rgba(0,0,0,0.12)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "42px",
          height: "4px",
          borderRadius: "999px",
          background: "rgba(0,0,0,0.12)",
          margin: "0 auto 12px",
        }}
      />

      <div
        style={{
          fontSize: "13px",
          color: "rgba(120,120,120,0.9)",
          marginBottom: "10px",
        }}
      >
        🩶 他刚刚在想什么
      </div>

      <div
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#333",
          whiteSpace: "pre-wrap",
        }}
      >
        {activeThought}
      </div>
    </div>
  </>
)}


    </div>
  );
}
const leftArrowBtnStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: "none",
  background: "transparent",
  fontSize: "22px",
  lineHeight: 1,
  color: "#333",
  cursor: "pointer",
};

const smallIconBtnStyle = {
  width: "30px",
  height: "30px",
  borderRadius: "999px",
  border: "none",
  background: "transparent",
  fontSize: "18px",
  color: "#444",
  cursor: "pointer",
};

const sendBtnStyle = {
  height: "34px",
  borderRadius: "17px",
  border: "none",
  background: "#95ec69",
  color: "#1f1f1f",
  fontSize: "13px",
  padding: "0 12px",
  cursor: "pointer",
};