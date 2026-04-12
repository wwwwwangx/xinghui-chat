"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const chatId = String(params.id || "default");
  const router = useRouter();

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
  const [isSending, setIsSending] = useState(false);
  const [showDetailMenu, setShowDetailMenu] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTab, setSearchTab] = useState("text");
  const [displayCount, setDisplayCount] = useState(5);
  const [showContactProfile, setShowContactProfile] = useState(false);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [contactRemark, setContactRemark] = useState("");
  const [contactBio, setContactBio] = useState("");
  const [editingRemark, setEditingRemark] = useState(false);
  const [remarkInput, setRemarkInput] = useState("");
  const [contactAvatarUrl, setContactAvatarUrl] = useState(null);
  const contactAvatarInputRef = useRef(null);

  const chatEndRef = useRef(null);
  const photoInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const musicInputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const contactNameMap = {
    "1": "沈星回",
    "2": "黎深",
    "3": "祁煜",
  };
  const contactName = contactNameMap[chatId] || "联系人";

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

  function splitAssistantReply(reply) {
    if (!reply) return [];
    return reply.split(/(?<=[。！？\n])/g).filter(s => s.trim());
  }

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setIsSending(true);

    const userMessage = {
      id: `m-${Date.now()}`,
      type: "message",
      role: "me",
      avatar: "我",
      text,
      time: getCurrentTime(),
      read: true,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    // 修改点2：历史消息限制最近20条（slice(-20)）
    const historyForAPI = updatedMessages
      .filter(
        (m) =>
          m.type === "message" &&
          (m.role === "me" || m.role === "other") &&
          typeof m.text === "string" &&
          m.text.trim()
      )
      .slice(-20)  // ✅ 只取最近20条
      .map((m) => ({
        role: m.role === "me" ? "user" : "assistant",
        content: m.text.trim(),
      }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 修改点1：添加 session_id
        body: JSON.stringify({
          session_id: chatId,
          messages: historyForAPI,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      
      // 修改点：解析 XML 标签，提取纯净回复和思考内容
      const rawReply = data?.reply || "";
      const replyMatch = rawReply.match(/<reply>([\s\S]*?)<\/reply>/);
      const thoughtSummaryMatch = rawReply.match(/<thoughtSummary>([\s\S]*?)<\/thoughtSummary>/);
      const thoughtFullMatch = rawReply.match(/<thoughtFull>([\s\S]*?)<\/thoughtFull>/);

      // 保底清理：即使 XML 格式不整齐也强制清除所有标签
      const cleanReply = (replyMatch ? replyMatch[1].trim() : rawReply)
        .replace(/<\/?reply>|<\/?thoughtSummary>|<\/?thoughtFull>|<thoughtSummary>[\s\S]*?<\/thoughtSummary>|<thoughtFull>[\s\S]*?<\/thoughtFull>/g, '')
        .trim();

      const parsedThoughtSummary = thoughtSummaryMatch ? thoughtSummaryMatch[1].trim() : (data?.thoughtSummary || "他刚刚在想点什么");
      const parsedThoughtFull = thoughtFullMatch ? thoughtFullMatch[1].trim() : (data?.thoughtFull || "");

      const replies = Array.isArray(data?.replies)
        ? data.replies
        : splitAssistantReply(cleanReply);

      if (!replies.length) throw new Error("AI returned empty replies");

      for (let i = 0; i < replies.length; i++) {
        const replyText = replies[i];

        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}-${i}`,
            type: "message",
            role: "other",
            avatar: "星",
            text: replyText,
            thoughtSummary: parsedThoughtSummary,
            thoughtFull: parsedThoughtFull,
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
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-err`,
          type: "message",
          role: "other",
          avatar: "系统",
          text: "出错了，稍后再试",
          time: getCurrentTime(),
          read: true,
        },
      ]);
    } finally {
      setIsSending(false);
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

  const prevMsgLenRef = useRef(0);
  useEffect(() => {
    const el = document.getElementById("chat-container");
    if (el && messages.length > prevMsgLenRef.current) {
      el.scrollTop = el.scrollHeight;
    }
    prevMsgLenRef.current = messages.length;
  }, [messages]);

  // iOS Safari 键盘高度动态适配
  useEffect(() => {
    const updateHeight = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const wrapper = document.getElementById("chat-page-wrapper");
      if (wrapper) wrapper.style.height = `${vh}px`;
    };
    updateHeight();
    window.visualViewport?.addEventListener("resize", updateHeight);
    window.visualViewport?.addEventListener("scroll", updateHeight);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
      window.visualViewport?.removeEventListener("scroll", updateHeight);
    };
  }, []);

  // 加载历史消息（从数据库）
  useEffect(() => {
    setMessagesLoaded(false);
    fetch(`/api/messages?session_id=${chatId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.messages)) {
          setMessages(data.messages.slice(-100));
        }
      })
      .catch((err) => console.error("加载历史消息失败:", err))
      .finally(() => setMessagesLoaded(true));
  }, [chatId]);

  // 保存消息到数据库
  useEffect(() => {
    if (!messagesLoaded) return;
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: chatId, messages }),
    }).catch((err) => console.error("保存消息失败:", err));
  }, [messages, messagesLoaded, chatId]);

  // 收藏仍用 localStorage（不涉及服务器，保持不变）
  useEffect(() => {
    const savedFavorites = localStorage.getItem("chat_favorites");
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); } catch {}
    }
    // 加载备注和头像
    const savedRemark = localStorage.getItem(`contact_remark_${chatId}`);
    if (savedRemark) setContactRemark(savedRemark);
    const savedAvatar = localStorage.getItem(`contact_avatar_${chatId}`);
    if (savedAvatar) setContactAvatarUrl(savedAvatar);
    const savedBio = localStorage.getItem(`contact_bio_${chatId}`);
    if (savedBio) setContactBio(savedBio);
  }, [chatId]);

  useEffect(() => {
    localStorage.setItem("chat_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(`contact_remark_${chatId}`, contactRemark);
  }, [contactRemark, chatId]);

  useEffect(() => {
    localStorage.setItem(`contact_bio_${chatId}`, contactBio);
  }, [contactBio, chatId]);

  useEffect(() => {
    if (contactAvatarUrl && !contactAvatarUrl.startsWith("blob:")) {
      localStorage.setItem(`contact_avatar_${chatId}`, contactAvatarUrl);
    }
  }, [contactAvatarUrl, chatId]);

  const visibleMessages = messages.slice(-displayCount);

  return (
    <div
      style={{
        height: "100dvh",
        background: "#F0F2F5",
        display: "flex",
        justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Apple Color Emoji", sans-serif',
        overflow: "hidden",
      }}
    >
      <div
        id="chat-page-wrapper"
        style={{
          width: "100%",
          maxWidth: "430px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F0F2F5",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
          <div
            onClick={() => router.push("/chat")}
            style={{ fontSize: "26px", color: "#222", lineHeight: 1, cursor: "pointer" }}
          >
            ‹
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#222",
              letterSpacing: "0.2px",
            }}
          >
            {contactName}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "22px", cursor: "pointer" }} onClick={() => setShowDetailMenu(true)}>☰</span>
          </div>
        </div>

        <div
          id="chat-container"
          style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "8px 0",
            boxSizing: "border-box",
          }}
        >
          {messages.length > displayCount && (
            <div
              onClick={() => {
                const el = document.getElementById("chat-container");
                const prevHeight = el ? el.scrollHeight : 0;
                setDisplayCount(prev => prev + 20);
                requestAnimationFrame(() => {
                  if (el) el.scrollTop = el.scrollHeight - prevHeight;
                });
              }}
              style={{
                textAlign: "center",
                padding: "10px",
                fontSize: "13px",
                color: "#888",
                cursor: "pointer",
              }}
            >
              ↑ 加载更多记录
            </div>
          )}
          {visibleMessages.map((message, idx) => {
            if (message.type === "date") {
              return (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "10px 0 14px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(0,0,0,0.1)",
                      color: "#555",
                      fontSize: "12px",
                      padding: "5px 12px",
                      borderRadius: "999px",
                      lineHeight: 1,
                    }}
                  >
                    {message.label}
                  </div>
                </div>
              );
            }

            const isUser = message.role === "me";
            const prev = visibleMessages[idx - 1];
            const next = visibleMessages[idx + 1];
            const isSamePrev = prev && prev.role === message.role;
            const isSameNext = next && next.role === message.role;

            if (message.type === "card" && isUser) {
              return (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    flexDirection: "row-reverse",
                    padding: "8px 12px",
                    width: "100%",
                    boxSizing: "border-box",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ width: 6, flexShrink: 0 }} />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "6px",
                      maxWidth: "70%",
                      flexDirection: "column",
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
                      <span>{message.read ? "已读" : ""}</span>
                      <span>{message.time}</span>
                    </div>

                    {message.cardType === "hongbao" && (
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
                              {message.title}
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.95 }}>
                              {message.subtitle}
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

                    {message.cardType === "gift" && (
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
                              {message.title}
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.95 }}>
                              {message.subtitle}
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

                    {message.cardType === "transfer" && (
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
                              {message.amount}
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                lineHeight: 1.3,
                                opacity: 0.96,
                              }}
                            >
                              {message.title}
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
                          {message.subtitle}
                        </div>
                      </div>
                    )}

                    {message.cardType === "photo" && (
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
                          {message.imageUrl ? (
                            <img
                              src={message.imageUrl}
                              onClick={() => setPreviewImage(message.imageUrl)}
                              alt={message.title}
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
                            {message.title}
                          </div>
                          <div style={{ fontSize: "12px", color: message.uploading ? "#f59e0b" : "#666" }}>
                            {message.subtitle}
                          </div>
                        </div>
                      </div>
                    )}

                    {message.cardType === "location" && (
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
                            {message.title}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {message.subtitle}
                          </div>
                        </div>
                      </div>
                    )}

                    {message.cardType === "file" && (
                      <div
                        onClick={() => message.url && window.open(message.url, "_blank")}
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
                              {message.title}
                            </div>
                            <div style={{ fontSize: "12px", color: message.uploading ? "#f59e0b" : "#666" }}>
                              {message.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.cardType === "music" && (
                      <div
                        onClick={() => message.url && window.open(message.url, "_blank")}
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
                              {message.title}
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.92 }}>
                              {message.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.cardType === "favorite" && (
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
                              {message.title}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                wordBreak: "break-word",
                              }}
                            >
                              {message.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  flexDirection: isUser ? "row-reverse" : "row",
                  padding: "4px 12px",
                  width: "100%",
                  boxSizing: "border-box",
                  alignItems: "flex-end",
                }}
              >
                {!isUser ? (
                  <div
                    onClick={() => setShowContactDetail(true)}
                    style={{
                      width: 42, height: 42, flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "#d8ecff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "20px",
                      marginRight: 10,
                      alignSelf: "flex-start",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    {contactAvatarUrl
                      ? <img src={contactAvatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      : (message.avatar === "星" ? "⭐" : message.avatar)
                    }
                  </div>
                ) : (
                  <div style={{ width: 6, flexShrink: 0 }} />
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    maxWidth: "65%",
                  }}
                >
                  {!isUser && (
                    <span
                      style={{
                        fontSize: "12px", color: "#888",
                        marginBottom: "3px", paddingLeft: "4px",
                      }}
                    >
                      {message.avatar === "星" ? contactName : message.avatar}
                    </span>
                  )}

                  {!isUser && message.thoughtSummary && (
                    <div
                      onClick={() => {
                        setActiveThought(message.thoughtFull || "他刚刚有点话没说出来。");
                        setShowThoughtDrawer(true);
                      }}
                      style={{
                        fontSize: "12px", color: "rgba(120,120,120,0.65)",
                        marginBottom: "3px", cursor: "pointer", paddingLeft: 4,
                      }}
                    >
                      🩶 {message.thoughtSummary}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 5,
                      flexDirection: isUser ? "row-reverse" : "row",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: isUser ? "#95EC69" : "#FFFFFF",
                        color: "#1a1a1a",
                        padding: "10px 14px",
                        borderRadius: "18px",
                        borderTopRightRadius: isUser ? "4px" : "18px",
                        borderTopLeftRadius: isUser ? "18px" : "4px",
                        fontSize: "15px",
                        lineHeight: 1.5,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setActiveMessage(message);
                        setMenuPosition({ x: e.clientX, y: e.clientY });
                        setShowMessageMenu(true);
                      }}
                    >
                      {message.text}
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(0,0,0,0.38)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                        flexShrink: 0,
                        marginBottom: "2px",
                        gap: "1px",
                      }}
                    >
                      {isUser && message.read && (
                        <span style={{ color: "rgba(0,0,0,0.38)", fontSize: "11px" }}>已读</span>
                      )}
                      <span>{message.time}</span>
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
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            borderTop: "1px solid #eee",
            background: "#fff",
            position: "relative",
            zIndex: 10,
          }}
        >
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "20px",
              border: "none",
              background: "transparent",
              fontSize: "22px",
              lineHeight: 1,
              color: "#333",
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
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
              borderRadius: 20,
              border: "1px solid #ddd",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              marginLeft: 8,
              marginRight: 8,
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
                fontSize: 15,
                lineHeight: 1.4,
                padding: "10px 0",
                maxHeight: "88px",
                fontFamily: "inherit",
                color: "#222",
              }}
            />

            <div
              onClick={() => {
                setShowEmojiPanel((prev) => !prev);
                setShowPlusPanel(false);
              }}
              style={{
                fontSize: 24,
                marginRight: 0,
                color: "#555",
                cursor: "pointer",
              }}
            >
              🙂
            </div>
          </div>

          <button
            type="button"
            onClick={sendMessage}
            style={{
              height: "36px",
              borderRadius: "18px",
              border: "none",
              background: "#95ec69",
              color: "#000",
              fontSize: "14px",
              padding: "0 14px",
              cursor: "pointer",
            }}
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
              position: "relative",
              zIndex: 2,
              marginLeft: 12,
              marginRight: 12,
              marginBottom: 10,
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
              marginLeft: 12,
              marginRight: 12,
              marginBottom: 10,
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
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach(file => handleImageSelect(file, "照片"));
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
              alt="预览"
            />
          </div>
        )}

        {openThought && (
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
        )}

        {showMessageMenu && (
          <div
            style={{
              position: "fixed",
              top: menuPosition.y,
              left: menuPosition.x,
              transform: "translate(-50%, -100%)",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              padding: "10px",
              zIndex: 9999,
            }}
          >
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

        {/* ===== 聊天详情页 ===== */}
        {showDetailMenu && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100%", height: "100%",
            background: "#F0F2F5",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
          }}>
            {/* 顶部导航 */}
            <div style={{
              height: "58px",
              background: "rgba(255,255,255,0.93)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              boxSizing: "border-box",
            }}>
              <div onClick={() => setShowDetailMenu(false)} style={{ fontSize: "26px", color: "#222", cursor: "pointer", lineHeight: 1 }}>‹</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#222" }}>聊天详情</div>
              <div style={{ width: "24px" }} />
            </div>

            {/* 联系人头像区 */}
            <div style={{ background: "#fff", padding: "20px 16px 16px", display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "10px" }}>
              <div
                onClick={() => setShowContactProfile(true)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{
                  width: "56px", height: "56px", borderRadius: "14px",
                  background: contactAvatarUrl ? "transparent" : "linear-gradient(135deg, #c8dff0, #a0c4e8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", color: "#fff", fontWeight: 700,
                  overflow: "hidden",
                }}>
                  {contactAvatarUrl
                    ? <img src={contactAvatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : contactName[0]
                  }
                </div>
                <div style={{ fontSize: "12px", color: "#555" }}>{contactRemark || contactName}</div>
              </div>
            </div>

            {/* 菜单列表 */}
            <div style={{ background: "#fff" }}>
              <div
                onClick={() => { setShowDetailMenu(false); setShowSearchPanel(true); setSearchQuery(""); setSearchTab("text"); }}
                style={{
                  padding: "16px 16px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "15px",
                  color: "#222",
                }}
              >
                <span>查找聊天内容</span>
                <span style={{ color: "#bbb", fontSize: "18px" }}>›</span>
              </div>

              <div
                style={{
                  padding: "16px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "15px",
                  color: "#222",
                }}
              >
                <span>设置当前聊天背景</span>
                <span style={{ color: "#bbb", fontSize: "18px" }}>›</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== 搜索面板 ===== */}
        {showSearchPanel && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100%", height: "100%",
            background: "#F0F2F5",
            zIndex: 201,
            display: "flex",
            flexDirection: "column",
          }}>
            {/* 顶部搜索栏 */}
            <div style={{
              background: "#fff",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}>
              <div style={{
                flex: 1,
                background: "#F0F2F5",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                gap: "6px",
              }}>
                <span style={{ fontSize: "15px", color: "#aaa" }}>🔍</span>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索"
                  style={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "15px",
                    color: "#222",
                    flex: 1,
                  }}
                />
              </div>
              <div onClick={() => setShowSearchPanel(false)} style={{ fontSize: "14px", color: "#07c160", cursor: "pointer", whiteSpace: "nowrap" }}>取消</div>
            </div>

            {/* 分类标签（只有搜索框为空时显示） */}
            {!searchQuery && (
              <div style={{ background: "#fff", padding: "12px 16px 0", marginTop: "10px" }}>
                <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "12px", textAlign: "center" }}>快速搜索聊天内容</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", paddingBottom: "16px" }}>
                  {[
                    { key: "media", label: "图片与视频" },
                    { key: "file", label: "文件" },
                  ].map(tab => (
                    <div
                      key={tab.key}
                      onClick={() => setSearchTab(tab.key)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "999px",
                        background: searchTab === tab.key ? "#07c160" : "#F0F2F5",
                        color: searchTab === tab.key ? "#fff" : "#555",
                        fontSize: "14px",
                        cursor: "pointer",
                        fontWeight: searchTab === tab.key ? 600 : 400,
                      }}
                    >
                      {tab.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 搜索结果 */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
              {(() => {
                let results = [];
                if (searchQuery) {
                  results = messages.filter(m =>
                    m.type === "message" && typeof m.text === "string" &&
                    m.text.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                } else if (searchTab === "media") {
                  results = messages.filter(m => m.type === "card" && m.cardType === "photo");
                } else if (searchTab === "file") {
                  results = messages.filter(m => m.type === "card" && (m.cardType === "file" || m.cardType === "music"));
                }

                if (!results.length) return (
                  <div style={{ textAlign: "center", color: "#aaa", fontSize: "14px", marginTop: "40px" }}>
                    {searchQuery ? "没有找到相关内容" : "暂无内容"}
                  </div>
                );

                return results.map(m => (
                  <div key={m.id} style={{
                    background: "#fff",
                    margin: "0 0 1px",
                    padding: "12px 16px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: m.role === "me" ? "#d4f0de" : "#c8dff0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 700, color: "#555", flexShrink: 0,
                    }}>
                      {m.role === "me" ? "我" : contactName[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "3px" }}>{m.time}</div>
                      {m.type === "card" && m.imageUrl ? (
                        <img src={m.imageUrl} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} alt="" />
                      ) : (
                        <div style={{ fontSize: "14px", color: "#333", lineHeight: 1.5, wordBreak: "break-all" }}>
                          {searchQuery ? (
                            (() => {
                              const idx = m.text.toLowerCase().indexOf(searchQuery.toLowerCase());
                              if (idx === -1) return m.text;
                              return <>
                                {m.text.slice(0, idx)}
                                <span style={{ background: "#ffe066", borderRadius: "2px" }}>{m.text.slice(idx, idx + searchQuery.length)}</span>
                                {m.text.slice(idx + searchQuery.length)}
                              </>;
                            })()
                          ) : m.title || m.text}
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* ===== 联系人详情页（点头像进入，微信风格） ===== */}
        {showContactDetail && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "#fff", zIndex: 203,
            display: "flex", flexDirection: "column", overflowY: "auto",
          }}>
            {/* 顶部导航 */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 16px", position: "sticky", top: 0,
              background: "#fff", zIndex: 1,
            }}>
              <div onClick={() => setShowContactDetail(false)} style={{ fontSize: "26px", color: "#222", cursor: "pointer", lineHeight: 1 }}>‹</div>
              <div style={{ fontSize: "20px", color: "#555", cursor: "pointer" }}>···</div>
            </div>

            {/* 头像 + 名字 + 备注 */}
            <div style={{ display: "flex", gap: "14px", padding: "10px 20px 20px", alignItems: "flex-start" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "16px", flexShrink: 0,
                background: contactAvatarUrl ? "transparent" : "linear-gradient(135deg, #c8dff0, #a0c4e8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "30px", color: "#fff", fontWeight: 700, overflow: "hidden",
              }}>
                {contactAvatarUrl
                  ? <img src={contactAvatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : contactName[0]
                }
              </div>
              <div style={{ flex: 1, paddingTop: "4px" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>
                  {contactRemark || contactName}
                </div>
                {contactRemark && (
                  <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>
                    昵称：{contactName}
                  </div>
                )}
                {contactBio ? (
                  <div style={{ fontSize: "13px", color: "#888" }}>{contactBio}</div>
                ) : (
                  <div style={{ fontSize: "13px", color: "#ccc", fontStyle: "italic" }}>暂无个性签名</div>
                )}
              </div>
            </div>

            <div style={{ height: "8px", background: "#F0F2F5" }} />

            {/* 动态占位 */}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: "15px", color: "#222", fontWeight: 600, marginBottom: "10px" }}>动态</div>
              <div style={{
                height: "80px", background: "#F0F2F5", borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#bbb", fontSize: "13px",
              }}>
                动态功能开发中
              </div>
            </div>

            <div style={{ height: "8px", background: "#F0F2F5" }} />

            {/* 底部按钮 */}
            <div style={{ padding: "16px" }}>
              <div
                onClick={() => setShowContactDetail(false)}
                style={{
                  width: "100%", padding: "14px", textAlign: "center",
                  background: "#fff", border: "1px solid #eee", borderRadius: "12px",
                  fontSize: "16px", color: "#222", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                💬 发消息
              </div>
            </div>
          </div>
        )}

        {/* ===== 联系人资料编辑页 ===== */}
        {showContactProfile && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100%", height: "100%",
            background: "#F0F2F5", zIndex: 202,
            display: "flex", flexDirection: "column",
          }}>
            {/* 顶部导航 */}
            <div style={{
              height: "58px", background: "rgba(255,255,255,0.93)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px", boxSizing: "border-box",
            }}>
              <div onClick={() => { setShowContactProfile(false); setEditingRemark(false); }} style={{ fontSize: "26px", color: "#222", cursor: "pointer", lineHeight: 1 }}>‹</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#222" }}>联系人资料</div>
              <div style={{ width: "24px" }} />
            </div>

            {/* 头像区 */}
            <div style={{ background: "#fff", padding: "28px 16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div
                onClick={() => contactAvatarInputRef.current?.click()}
                style={{
                  width: "80px", height: "80px", borderRadius: "20px",
                  background: contactAvatarUrl ? "transparent" : "linear-gradient(135deg, #c8dff0, #a0c4e8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "32px", color: "#fff", fontWeight: 700,
                  overflow: "hidden", cursor: "pointer", position: "relative",
                }}
              >
                {contactAvatarUrl
                  ? <img src={contactAvatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : contactName[0]
                }
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "rgba(0,0,0,0.35)", color: "#fff",
                  fontSize: "11px", textAlign: "center", padding: "3px 0",
                }}>更换</div>
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#222" }}>{contactRemark || contactName}</div>
              <input
                ref={contactAvatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setContactAvatarUrl(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                  e.target.value = "";
                }}
              />
            </div>

            {/* 选项列表 */}
            <div style={{ background: "#fff" }}>
              {editingRemark ? (
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>编辑备注</div>
                  <input
                    autoFocus
                    value={remarkInput}
                    onChange={e => setRemarkInput(e.target.value)}
                    placeholder={contactName}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: "1px solid #e0e0e0", borderRadius: "8px",
                      padding: "10px 12px", fontSize: "15px",
                      outline: "none", color: "#222",
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                    <div onClick={() => setEditingRemark(false)} style={{ flex: 1, textAlign: "center", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", color: "#555", cursor: "pointer" }}>取消</div>
                    <div onClick={() => { setContactRemark(remarkInput); setEditingRemark(false); }} style={{ flex: 1, textAlign: "center", padding: "10px", background: "#07c160", borderRadius: "8px", fontSize: "14px", color: "#fff", cursor: "pointer", fontWeight: 600 }}>保存</div>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    onClick={() => { setRemarkInput(contactRemark); setEditingRemark(true); }}
                    style={{ padding: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: "15px", color: "#222" }}
                  >
                    <span>编辑备注</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {contactRemark && <span style={{ fontSize: "14px", color: "#aaa" }}>{contactRemark}</span>}
                      <span style={{ color: "#bbb", fontSize: "18px" }}>›</span>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      const bio = prompt("编辑个性签名。", contactBio);
                      if (bio !== null) setContactBio(bio);
                    }}
                    style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: "15px", color: "#222" }}
                  >
                    <span>个性签名</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {contactBio && <span style={{ fontSize: "14px", color: "#aaa", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contactBio}</span>}
                      <span style={{ color: "#bbb", fontSize: "18px" }}>›</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}