"use client";

import React, { useEffect, useState, useRef } from "react";

const N8N_WEBHOOK_URL = "https://trongtrobui.app.n8n.cloud/webhook/dat-lich-may-lanh";
const N8N_CHAT_WEBHOOK_URL = "https://trongtrobui.app.n8n.cloud/webhook/chat-ai";

const HANDOFF_KEYWORDS = [
  "khiếu nại", "khieu nai", "phàn nàn", "không hài lòng", "thất vọng",
  "hoàn tiền", "hoàn lại tiền", "bồi thường", "boi thuong",
  "tức quá", "bực quá", "tệ quá", "tệ lắm", "kém quá",
  "gặp người thật", "gặp nhân viên", "nói chuyện trực tiếp",
  "muốn gặp", "cho tôi gặp", "tìm quản lý", "tìm sếp",
  "làm hỏng", "làm vỡ", "thiệt hại", "hư hỏng do thợ",
  "kiện", "tố cáo", "báo cơ quan"
];

const chatFallbackReplies: Record<string, string> = {
  "vệ sinh": "Dịch vụ vệ sinh máy lạnh bao gồm rửa dàn lạnh, dàn nóng và phin lọc. Giá từ 200.000đ/máy. Bạn muốn đặt lịch không? 📅",
  "lắp đặt": "Chúng tôi lắp đặt tất cả các hãng: Daikin, LG, Panasonic, Midea... Bao gồm đục tường, đi ống đồng, kiểm tra gas. Từ 400.000đ.",
  "sửa chữa": "Kỹ thuật viên khảo sát miễn phí và báo giá trước khi sửa. Phản hồi trong 30 phút. Bạn có thể mô tả triệu chứng máy không? 🔧",
  "tháo dời": "Dịch vụ tháo và di dời từ 450.000đ, bao gồm tháo lắp an toàn và bơm gas nếu cần. Địa chỉ mới của bạn ở đâu?",
  "giá": "Dùng **Bảng Tính Giá** trên web để ước tính nhanh! Hoặc nhắn Zalo 0968.831.027 để được tư vấn. 💰",
  "bảo hành": "Tất cả dịch vụ được bảo hành **6 – 12 tháng**. Có sự cố sau dịch vụ → chúng tôi quay lại sửa miễn phí! ✅",
  "thời gian": "Phục vụ 7:30 – 21:00, kể cả Thứ 7, Chủ nhật và Lễ. ⏰",
  "default": "Cảm ơn bạn! Nhân viên sẽ phản hồi trong vài phút. Hoặc nhắn Zalo **0968.831.027** để được hỗ trợ ngay. 💬"
};

function getFallbackReply(text: string): string {
  const lower = text.toLowerCase();
  for (const [kw, reply] of Object.entries(chatFallbackReplies)) {
    if (kw !== "default" && lower.includes(kw)) return reply;
  }
  return chatFallbackReplies["default"];
}

function checkLocalHandoffKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return HANDOFF_KEYWORDS.some((kw) => lower.includes(kw));
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    openBookingModal?: (preselectedService?: string) => void;
    closeBookingModal?: () => void;
    toggleChatWidget?: () => void;
  }
}

interface ChatMessage {
  id: string;
  role: "user" | "agent" | "handoff";
  text: string;
  timestamp: string;
}

export default function FloatingAndModalShell() {
  // Booking Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("Vệ sinh máy lạnh");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientNote, setClientNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState("");

  // Chat Widget State
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadDot, setUnreadDot] = useState(true);
  const [isUserInfoCollected, setIsUserInfoCollected] = useState(false);
  const [chatUserName, setChatUserName] = useState("");
  const [chatUserPhone, setChatUserPhone] = useState("");
  const [chatSessionId, setChatSessionId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatIsWaiting, setChatIsWaiting] = useState(false);
  const [chatHandoffTriggered, setChatHandoffTriggered] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      text: "Xin chào! 👋 Tôi là nhân viên tư vấn của **AirCool Pro**. Bạn cần hỗ trợ dịch vụ máy lạnh nào?",
      timestamp: "Vừa xong",
    },
  ]);

  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatNameInputRef = useRef<HTMLInputElement>(null);

  const openBookingModal = (preselectedService?: string) => {
    setBookingSuccessCode(null);
    if (preselectedService) {
      const options = [
        "Vệ sinh máy lạnh",
        "Lắp đặt máy lạnh mới",
        "Tháo lắp di dời máy lạnh",
        "Sửa chữa máy lạnh",
        "Bơm nạp gas máy lạnh",
        "Bảo dưỡng định kỳ trọn gói",
      ];
      const match = options.find(
        (opt) =>
          opt.toLowerCase().includes(preselectedService.toLowerCase()) ||
          preselectedService.toLowerCase().includes(opt.toLowerCase())
      );
      if (match) {
        setSelectedService(match);
      } else if (preselectedService.includes("Vệ Sinh")) {
        setSelectedService("Vệ sinh máy lạnh");
      } else if (preselectedService.includes("Lắp Đặt")) {
        setSelectedService("Lắp đặt máy lạnh mới");
      } else if (preselectedService.includes("Tháo")) {
        setSelectedService("Tháo lắp di dời máy lạnh");
      } else if (preselectedService.includes("Sửa")) {
        setSelectedService("Sửa chữa máy lạnh");
      }
    }
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeBookingModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const toggleChatWidget = () => {
    setChatOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadDot(false);
        setTimeout(() => {
          if (!isUserInfoCollected) {
            chatNameInputRef.current?.focus();
          } else {
            chatInputRef.current?.focus();
          }
        }, 320);
      }
      return next;
    });
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayDate(today);
    setAppointmentDate(today);

    // Initialize Chat Session & LocalStorage User
    const sidKey = "aircool_chat_session";
    let sid = localStorage.getItem(sidKey);
    if (!sid) {
      sid = "sess-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
      localStorage.setItem(sidKey, sid);
    }
    setChatSessionId(sid);

    try {
      const savedUser = JSON.parse(localStorage.getItem("aircool_chat_user") || "null");
      if (savedUser && savedUser.name && savedUser.phone) {
        setChatUserName(savedUser.name);
        setChatUserPhone(savedUser.phone);
        setIsUserInfoCollected(true);
      }
    } catch {
      // ignore
    }

    window.openBookingModal = openBookingModal;
    window.closeBookingModal = closeBookingModal;
    window.toggleChatWidget = toggleChatWidget;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeBookingModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // GA4 delegated click listener for tel:, zalo.me, and blog links
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href") || "";

      if (href.startsWith("tel:")) {
        if (typeof window.gtag === "function") {
          window.gtag("event", "contact", {
            event_category: "Engagement",
            event_label: "Click Gọi Hotline: " + href,
            contact_method: "phone",
          });
        }
      } else if (href.includes("zalo.me")) {
        if (typeof window.gtag === "function") {
          window.gtag("event", "contact", {
            event_category: "Engagement",
            event_label: "Click Nhắn Zalo",
            contact_method: "zalo",
          });
        }
      } else if (
        target.closest(".blog-card") ||
        target.closest(".service-card") ||
        href.startsWith("/blog/")
      ) {
        if (typeof window.gtag === "function") {
          window.gtag("event", "select_content", {
            content_type: "blog_internal_link",
            item_id: href,
          });
        }
      }
    };
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isUserInfoCollected]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, chatIsWaiting]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const randomCode = "AC-" + Math.floor(1000 + Math.random() * 9000);
    const totalPriceEl = document.getElementById("totalPriceDisplay");

    const bookingPayload = {
      bookingCode: randomCode,
      customerName: clientName.trim(),
      customerPhone: clientPhone.trim(),
      service: selectedService,
      appointmentDate,
      address: clientAddress.trim(),
      note: clientNote.trim(),
      estimatedPrice: totalPriceEl ? totalPriceEl.innerText : "Chưa tính giá",
      createdAt: new Date().toISOString(),
      createdAtFormatted: new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),
      source: window.location.href,
    };

    try {
      if (N8N_WEBHOOK_URL && !N8N_WEBHOOK_URL.includes("your-n8n-instance")) {
        await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
        });
      }
    } catch (error) {
      console.error("Không thể kết nối tới n8n Webhook:", error);
    } finally {
      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", {
          event_category: "Booking",
          event_label: bookingPayload.service,
          value: 1,
        });
      }
      setIsSubmitting(false);
      setBookingSuccessCode(randomCode);
      setClientName("");
      setClientPhone("");
      setClientAddress("");
      setClientNote("");
    }
  };

  const handlePrechatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatUserName.trim() || !chatUserPhone.trim()) return;
    localStorage.setItem(
      "aircool_chat_user",
      JSON.stringify({ name: chatUserName.trim(), phone: chatUserPhone.trim() })
    );
    setIsUserInfoCollected(true);
    setTimeout(() => chatInputRef.current?.focus(), 100);
  };

  const getTimestamp = () =>
    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const callN8nChatAI = async (userMessage: string, historyList: ChatMessage[]) => {
    if (!N8N_CHAT_WEBHOOK_URL || N8N_CHAT_WEBHOOK_URL.trim() === "") {
      return { handoff: false, reason: "", reply: getFallbackReply(userMessage) };
    }

    const payload = {
      message: userMessage,
      sessionId: chatSessionId,
      history: historyList
        .filter((m) => m.role === "user" || m.role === "agent")
        .slice(-10)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        })),
      userInfo: {
        name: chatUserName,
        phone: chatUserPhone,
      },
      source: window.location.href,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const raw = Array.isArray(data) ? data[0] : data;
      const handoff = raw.handoff === true;
      const reason = raw.reason || "";
      const reply = raw.reply || raw.output || raw.text || null;
      if (!reply) {
        return { handoff: false, reason: "", reply: getFallbackReply(userMessage) };
      }
      return { handoff, reason, reply };
    } catch {
      return {
        handoff: false,
        reason: "",
        reply: "⚠️ Kết nối AI tạm thời gián đoạn. Vui lòng nhắn Zalo **0968.831.027** để được hỗ trợ!",
      };
    }
  };

  const sendChatMessageText = async (rawText: string) => {
    if (chatIsWaiting || chatHandoffTriggered) return;
    const text = rawText.trim();
    if (!text) return;

    setShowQuickReplies(false);
    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      text,
      timestamp: getTimestamp(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setChatInput("");

    if (checkLocalHandoffKeywords(text)) {
      setChatIsWaiting(true);
      callN8nChatAI(text, updatedMessages).catch(() => {});
      await new Promise((r) => setTimeout(r, 1200));
      setChatIsWaiting(false);
      setChatHandoffTriggered(true);
      setMessages((prev) => [
        ...prev,
        { id: "handoff-" + Date.now(), role: "handoff", text: "", timestamp: getTimestamp() },
      ]);
      return;
    }

    setChatIsWaiting(true);
    const result = await callN8nChatAI(text, updatedMessages);
    setChatIsWaiting(false);

    if (result.handoff === true) {
      setChatHandoffTriggered(true);
      setMessages((prev) => [
        ...prev,
        {
          id: "a-" + Date.now(),
          role: "agent",
          text: result.reply,
          timestamp: getTimestamp(),
        },
        { id: "handoff-" + Date.now(), role: "handoff", text: "", timestamp: getTimestamp() },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: "a-" + Date.now(),
        role: "agent",
        text: result.reply,
        timestamp: getTimestamp(),
      },
    ]);
    setTimeout(() => chatInputRef.current?.focus(), 50);
  };

  const formatBubbleHtml = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  };

  return (
    <>
      {/* INTERACTIVE BOOKING MODAL */}
      <div
        className={`modal-overlay${modalOpen ? " active" : ""}`}
        id="bookingModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
        onClick={(e) => {
          if ((e.target as HTMLElement).id === "bookingModal") {
            closeBookingModal();
          }
        }}
      >
        <div className="modal-dialog">
          <div className="modal-header">
            <h3 className="modal-title" id="modalTitle">
              Đặt Lịch Dịch Vụ Nhanh
            </h3>
            <button
              className="modal-close-btn"
              onClick={closeBookingModal}
              aria-label="Đóng cửa sổ đặt lịch"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="modal-body">
            {!bookingSuccessCode ? (
              <form id="bookingForm" onSubmit={handleBookingSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="clientName" className="form-label">
                      Họ và tên của bạn <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      className="form-input"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="clientPhone" className="form-label">
                      Số điện thoại liên hệ <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="clientPhone"
                      className="form-input"
                      placeholder="09xx xxx xxx"
                      pattern="[0-9]{10}"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="serviceSelect" className="form-label">
                      Dịch vụ quan tâm <span className="required">*</span>
                    </label>
                    <select
                      id="serviceSelect"
                      className="form-select"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                    >
                      <option value="Vệ sinh máy lạnh">Vệ sinh máy lạnh (Khử khuẩn)</option>
                      <option value="Lắp đặt máy lạnh mới">Lắp đặt máy lạnh mới</option>
                      <option value="Tháo lắp di dời máy lạnh">Tháo lắp &amp; Di dời máy lạnh</option>
                      <option value="Sửa chữa máy lạnh">Sửa chữa máy lạnh sự cố</option>
                      <option value="Bơm nạp gas máy lạnh">Bơm nạp bổ sung gas</option>
                      <option value="Bảo dưỡng định kỳ trọn gói">Hợp đồng bảo dưỡng trọn gói</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="appointmentDate" className="form-label">
                      Thời gian mong muốn <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      id="appointmentDate"
                      className="form-input"
                      min={todayDate}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="clientAddress" className="form-label">
                    Địa chỉ phục vụ (Số nhà, Phường, Quận) <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="clientAddress"
                    className="form-input"
                    placeholder="Ví dụ: 45/12 Lê Văn Sỹ, Phường 13, Quận 3"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="clientNote" className="form-label">
                    Ghi chú tình trạng máy (không bắt buộc)
                  </label>
                  <textarea
                    id="clientNote"
                    className="form-textarea"
                    rows={3}
                    placeholder="Ví dụ: Máy chảy nước ở máng trước, quạt kêu rít, cần thợ mang theo gas..."
                    value={clientNote}
                    onChange={(e) => setClientNote(e.target.value)}
                  ></textarea>
                </div>

                <div style={{ marginTop: "var(--space-lg)" }}>
                  <button
                    type="submit"
                    id="submitBtn"
                    className="btn btn-cta"
                    style={{ width: "100%", padding: "14px" }}
                    disabled={isSubmitting}
                  >
                    {!isSubmitting ? (
                      <span id="btnText">Xác Nhận Đặt Lịch - Có Mặt Sau 30P</span>
                    ) : (
                      <span id="btnLoader">Đang gửi thông tin...</span>
                    )}
                  </button>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                      marginTop: "8px",
                    }}
                  >
                    🔒 Cam kết bảo mật thông tin, kỹ thuật viên sẽ gọi xác nhận trong 5 phút.
                  </p>
                </div>
              </form>
            ) : (
              <div className="form-success-box" id="successBox" style={{ display: "block" }}>
                <div className="form-success-icon" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h4 style={{ fontSize: "1.4rem", color: "var(--color-text)", marginBottom: "8px" }}>
                  Đặt Lịch Thành Công!
                </h4>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "var(--space-lg)",
                  }}
                >
                  Mã lịch hẹn:{" "}
                  <strong id="bookingCode" style={{ color: "var(--color-primary)" }}>
                    {bookingSuccessCode}
                  </strong>
                  . Kỹ thuật viên phụ trách khu vực của bạn đang chuẩn bị đồ nghề và sẽ liên hệ trong 5 phút.
                </p>
                <button className="btn btn-primary" onClick={closeBookingModal}>
                  Đã Hiểu &amp; Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FLOATING QUICK ACTION BUTTONS */}
      <div className="floating-actions" role="complementary" aria-label="Tác vụ nhanh">
        <a
          href="https://zalo.me/0968831027"
          className="fab-btn fab-phone"
          aria-label="Nhắn Zalo trực tiếp tới hỗ trợ"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="fab-tooltip">Zalo 0968.831.027</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </a>

        <button
          className="fab-btn fab-booking"
          onClick={() => openBookingModal("Tư vấn nhanh")}
          aria-label="Mở form đặt thợ"
        >
          <span className="fab-tooltip">Đặt Lịch Hẹn Thợ</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>

        <button
          className="fab-btn fab-chat"
          id="chatFabBtn"
          onClick={toggleChatWidget}
          aria-label="Mở cửa sổ tư vấn trực tiếp"
          aria-expanded={chatOpen}
        >
          <span className="fab-tooltip">Tư Vấn Trực Tiếp</span>
          {unreadDot && <span className="chat-unread-dot" id="chatUnreadDot" aria-hidden="true"></span>}
          {!chatOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              id="chatIconOpen"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              id="chatIconClose"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* LIVE CHAT WIDGET */}
      <div
        className={`chat-widget${chatOpen ? " open" : ""}`}
        id="chatWidget"
        role="dialog"
        aria-label="Cửa sổ tư vấn trực tiếp"
        aria-hidden={!chatOpen}
      >
        <div className="chat-header">
          <div className="chat-agent-info">
            <div className="chat-agent-avatar" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <p className="chat-agent-name">Nhân viên tư vấn</p>
              <span className="chat-agent-status">
                <span className="status-dot" aria-hidden="true"></span>Đang trực tuyến
              </span>
            </div>
          </div>
          <button className="chat-close-btn" onClick={toggleChatWidget} aria-label="Đóng cửa sổ tư vấn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {!isUserInfoCollected ? (
          <div className="chat-preform" id="chatPreform" style={{ display: "flex" }}>
            <h4 style={{ marginTop: 0, marginBottom: "10px", fontSize: "1.05rem", color: "var(--color-text)" }}>
              👋 Chào mừng bạn!
            </h4>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
                marginBottom: "15px",
                lineHeight: 1.4,
              }}
            >
              Vui lòng cho chúng tôi biết thông tin để hỗ trợ bạn tốt nhất nhé.
            </p>
            <form id="chatPrechatForm" onSubmit={handlePrechatSubmit}>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <input
                  ref={chatNameInputRef}
                  type="text"
                  id="chatClientName"
                  className="form-input"
                  placeholder="Tên của bạn *"
                  value={chatUserName}
                  onChange={(e) => setChatUserName(e.target.value)}
                  required
                  style={{ padding: "10px 14px", fontSize: "0.9rem", borderRadius: "8px", width: "100%" }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <input
                  type="tel"
                  id="chatClientPhone"
                  className="form-input"
                  placeholder="Số điện thoại *"
                  pattern="[0-9]{10}"
                  value={chatUserPhone}
                  onChange={(e) => setChatUserPhone(e.target.value)}
                  required
                  style={{ padding: "10px 14px", fontSize: "0.9rem", borderRadius: "8px", width: "100%" }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-cta"
                style={{ width: "100%", padding: "12px", fontSize: "0.95rem", borderRadius: "8px" }}
              >
                Bắt đầu Chat
              </button>
            </form>
          </div>
        ) : (
          <div id="chatMainContent" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <div className="chat-messages" id="chatMessages" ref={chatMessagesRef} role="log" aria-live="polite">
              {messages.map((msg) => {
                if (msg.role === "handoff") {
                  return (
                    <div key={msg.id} className="chat-handoff-banner" role="status">
                      <div className="handoff-banner-inner">
                        <span className="handoff-live-dot" aria-hidden="true"></span>
                        <div>
                          <strong>Nhân viên AirCool Pro đang tham gia</strong>
                          <p>
                            Yêu cầu của bạn đã được chuyển đến nhân viên hỗ trợ. Vui lòng chờ trong giây lát hoặc nhắn{" "}
                            <a href="https://zalo.me/0968831027" target="_blank" rel="noopener noreferrer">
                              Zalo 0968.831.027
                            </a>{" "}
                            để được hỗ trợ ngay.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
                    <div
                      className="chat-bubble"
                      dangerouslySetInnerHTML={{ __html: formatBubbleHtml(msg.text) }}
                    />
                    <span className="chat-timestamp">{msg.timestamp}</span>
                  </div>
                );
              })}

              {showQuickReplies && (
                <div className="chat-quick-replies" id="chatQuickReplies">
                  <button className="quick-reply-btn" onClick={() => sendChatMessageText("Vệ sinh máy lạnh")}>
                    🧊 Vệ sinh máy lạnh
                  </button>
                  <button className="quick-reply-btn" onClick={() => sendChatMessageText("Lắp đặt máy mới")}>
                    🔧 Lắp đặt máy mới
                  </button>
                  <button className="quick-reply-btn" onClick={() => sendChatMessageText("Sửa chữa máy lạnh")}>
                    ⚡ Sửa chữa máy lạnh
                  </button>
                  <button className="quick-reply-btn" onClick={() => sendChatMessageText("Tháo dời máy lạnh")}>
                    📦 Tháo dời máy lạnh
                  </button>
                </div>
              )}

              {chatIsWaiting && (
                <div className="chat-typing" id="chatTypingIndicator" aria-label="Nhân viên AI đang soạn tin...">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>

            <div className="chat-input-area">
              <input
                ref={chatInputRef}
                type="text"
                id="chatInput"
                className="chat-input"
                placeholder={
                  chatHandoffTriggered
                    ? "Nhân viên đang tham gia..."
                    : chatIsWaiting
                    ? "Đang kết nối AI..."
                    : "Nhập tin nhắn của bạn..."
                }
                maxLength={300}
                autoComplete="off"
                disabled={chatIsWaiting || chatHandoffTriggered}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessageText(chatInput);
                  }
                  if (e.key === "Escape" && chatOpen) {
                    toggleChatWidget();
                  }
                }}
                aria-label="Ô nhập tin nhắn tư vấn"
              />
              <button
                className="chat-send-btn"
                id="chatSendBtn"
                disabled={chatIsWaiting || chatHandoffTriggered}
                onClick={() => sendChatMessageText(chatInput)}
                aria-label="Gửi tin nhắn"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>

            <div className="chat-footer-note">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              Phản hồi trong vòng 2 phút • Hoặc nhắn Zalo{" "}
              <a href="https://zalo.me/0968831027" target="_blank" rel="noopener noreferrer">
                0968.831.027
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

