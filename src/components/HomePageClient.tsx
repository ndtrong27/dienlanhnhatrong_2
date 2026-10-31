"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

const basePrices: Record<string, Record<string, number>> = {
  wall: { clean: 250000, install: 550000, reinstall: 700000, repair: 150000 },
  ceiling: { clean: 850000, install: 1500000, reinstall: 2250000, repair: 150000 },
  standing: { clean: 650000, install: 700000, reinstall: 850000, repair: 400000 },
};

const typeNames: Record<string, string> = {
  wall: "Treo Tường",
  ceiling: "Âm Trần / Cassette",
  standing: "Tủ Đứng",
};

const serviceNames: Record<string, string> = {
  clean: "Vệ Sinh Toàn Diện",
  install: "Lắp Đặt Máy Mới",
  reinstall: "Tháo & Di Dời",
  repair: "Khảo Sát Sửa Chữa",
};

interface HomePageClientProps {
  featuredPosts: BlogPost[];
}

export default function HomePageClient({ featuredPosts }: HomePageClientProps) {
  // Mobile Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Services Filter State
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Before/After Slider State
  const [sliderPos, setSliderPos] = useState<number>(50);
  const compareContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Cost Calculator State
  const [acType, setAcType] = useState<string>("wall");
  const [calcService, setCalcService] = useState<string>("clean");
  const [addGas, setAddGas] = useState<boolean>(false);
  const [qty, setQty] = useState<number>(1);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Before/After Slider Events
  const updateSliderPosition = (clientX: number) => {
    const container = compareContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let posX = clientX - rect.left;
    if (posX < 0) posX = 0;
    if (posX > rect.width) posX = rect.width;
    const percentage = (posX / rect.width) * 100;
    setSliderPos(percentage);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updateSliderPosition(e.clientX);
    };
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !e.touches[0]) return;
      updateSliderPosition(e.touches[0].clientX);
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Cost Calculation
  const unitPrice = basePrices[acType]?.[calcService] ?? 250000;
  const gasCost = addGas ? 110000 : 0;
  const subtotal = (unitPrice + gasCost) * qty;
  const discount = qty >= 3 ? subtotal * 0.1 : 0;
  const finalTotal = subtotal - discount;

  const changeQuantity = (delta: number) => {
    setQty((prev) => {
      let next = prev + delta;
      if (next < 1) next = 1;
      if (next > 20) next = 20;
      return next;
    });
  };

  const triggerBooking = (serviceName: string) => {
    if (typeof window !== "undefined" && typeof window.openBookingModal === "function") {
      window.openBookingModal(serviceName);
    }
  };

  const openBookingFromCalculator = () => {
    const serviceTitle = serviceNames[calcService] || "Vệ Sinh Toàn Diện";
    triggerBooking(serviceTitle);
  };

  const showCard = (category: string) => {
    return activeFilter === "all" || activeFilter === category;
  };

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="top-bar" role="region" aria-label="Thông báo khẩn cấp">
        <div className="container top-bar-inner">
          <ul className="top-bar-items">
            <li className="top-bar-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>
                Thời gian phục vụ: <strong>7:30 - 21:00</strong> (Cả Thứ 7, CN &amp; Lễ)
              </span>
            </li>
          </ul>
          <ul className="top-bar-items">
            <li className="top-bar-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>
                Bảo hành dịch vụ <strong>6 - 12 tháng</strong>
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* HEADER & NAVIGATION */}
      <header className="header" id="navbar">
        <div className="container navbar">
          <Link href="/" className="brand-logo" aria-label="Trang chủ AirCool Pro">
            <div className="brand-logo-icon">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <path d="m17 7-5 5-5-5"></path>
                <path d="m17 17-5-5-5 5"></path>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="m7 7 5 5-5 5"></path>
                <path d="m17 7-5 5 5 5"></path>
              </svg>
            </div>
            <span>
              AirCool<span>Pro</span>
            </span>
          </Link>

          <nav aria-label="Chính" className="desktop-nav">
            <ul className="nav-links">
              <li>
                <a href="#services" className="nav-link active">
                  Dịch Vụ
                </a>
              </li>
              <li>
                <a href="#compare" className="nav-link">
                  Trước &amp; Sau
                </a>
              </li>
              <li>
                <a href="#calculator" className="nav-link">
                  Tính Giá Ngay
                </a>
              </li>
              <li>
                <a href="#process" className="nav-link">
                  Quy Trình
                </a>
              </li>
              <li>
                <a href="#faq" className="nav-link">
                  Hỏi Đáp
                </a>
              </li>
              <li>
                <a href="#blog" className="nav-link">
                  Cẩm Nang
                </a>
              </li>
            </ul>
          </nav>

          <div className="nav-actions">
            <div className="hotline-badge">
              <span className="hotline-sub">Hỗ trợ 24/7</span>
              <a
                href="https://zalo.me/0968831027"
                className="hotline-num"
                aria-label="Nhắn Zalo 0968.831.027"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Zalo: 0968.831.027
              </a>
            </div>
            <button
              className="btn btn-cta btn-sm"
              onClick={() => triggerBooking("Tất cả dịch vụ")}
              aria-label="Mở bảng đặt lịch dịch vụ máy lạnh"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Đặt Lịch Nhanh
            </button>
            <button
              className="mobile-menu-btn"
              id="mobileMenuOpen"
              onClick={() => setDrawerOpen(true)}
              aria-label="Mở menu điều hướng trên điện thoại"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={`mobile-drawer-overlay${drawerOpen ? " active" : ""}`}
        id="mobileDrawerOverlay"
        onClick={() => setDrawerOpen(false)}
      ></div>
      <aside className={`mobile-drawer${drawerOpen ? " active" : ""}`} id="mobileDrawer" aria-label="Menu điện thoại">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="brand-logo" style={{ fontSize: "1.2rem" }}>
            AirCool<span>Pro</span>
          </span>
          <button
            className="modal-close-btn"
            id="mobileMenuClose"
            onClick={() => setDrawerOpen(false)}
            aria-label="Đóng menu"
          >
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li>
            <a href="#services" className="mobile-nav-item" onClick={() => setDrawerOpen(false)}>
              Dịch Vụ Máy Lạnh
            </a>
          </li>
          <li>
            <a href="#compare" className="mobile-nav-item" onClick={() => setDrawerOpen(false)}>
              Hiệu Quả Vệ Sinh
            </a>
          </li>
          <li>
            <a href="#calculator" className="mobile-nav-item" onClick={() => setDrawerOpen(false)}>
              Tính Giá Tức Thì
            </a>
          </li>
          <li>
            <a href="#process" className="mobile-nav-item" onClick={() => setDrawerOpen(false)}>
              Quy Trình Chuẩn
            </a>
          </li>
          <li>
            <a href="#faq" className="mobile-nav-item" onClick={() => setDrawerOpen(false)}>
              Hỏi &amp; Đáp
            </a>
          </li>
          <li>
            <a href="#blog" className="mobile-nav-item" onClick={() => setDrawerOpen(false)}>
              Cẩm Nang &amp; Mẹo Hay
            </a>
          </li>
        </ul>
        <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--color-border)" }}>
          <button
            className="btn btn-cta"
            style={{ width: "100%" }}
            onClick={() => {
              setDrawerOpen(false);
              triggerBooking("Tư vấn nhanh");
            }}
          >
            Đặt Lịch Ngay
          </button>
          <a
            href="https://zalo.me/0968831027"
            className="btn btn-outline"
            style={{ width: "100%", marginTop: "10px" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Zalo 0968.831.027
          </a>
        </div>
      </aside>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-decor" aria-hidden="true"></div>
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pill-dot" aria-hidden="true"></span>
              <span>Dịch Vụ Điện Lạnh Uy Tín #1 Khu Vực</span>
            </div>
            <h1 className="hero-title">
              Chuyên Sâu <span className="highlight">Vệ Sinh, Sửa Chữa Máy Lạnh</span> Tại Thủ Đức
            </h1>
            <p className="hero-description">
              Đem lại không gian mát lạnh trong lành cho ngôi nhà của bạn. Đội ngũ thợ giàu kinh nghiệm, đồ nghề chuyên
              dụng, quy trình chuẩn mực, báo giá minh bạch trước khi làm.
            </p>

            <div className="hero-actions">
              <button
                className="btn btn-cta btn-lg"
                onClick={() => triggerBooking("Vệ sinh máy lạnh")}
                aria-label="Đặt lịch dịch vụ máy lạnh ngay"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Đặt Lịch Có Mặt Sau 30P
              </button>
              <a href="#calculator" className="btn btn-outline btn-lg" aria-label="Xem tính toán chi phí dịch vụ">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                  <line x1="8" y1="6" x2="16" y2="6"></line>
                  <line x1="16" y1="14" x2="16" y2="18"></line>
                  <path d="M16 10h.01"></path>
                  <path d="M12 10h.01"></path>
                  <path d="M8 10h.01"></path>
                  <path d="M12 14h.01"></path>
                  <path d="M8 14h.01"></path>
                  <path d="M12 18h.01"></path>
                  <path d="M8 18h.01"></path>
                </svg>
                Ước Tính Chi Phí
              </a>
            </div>

            <div className="trust-badges-row">
              <div className="trust-item">
                <div className="trust-item-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 15l-2 5l9-11h-7l2-5l-9 11h7z"></path>
                  </svg>
                </div>
                <div className="trust-item-text">
                  <span className="trust-item-title">Thợ Có Chứng Chỉ</span>
                  <span className="trust-item-desc">Đào tạo chuẩn kỹ thuật</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-item-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <polyline points="9 12 11 14 15 10"></polyline>
                  </svg>
                </div>
                <div className="trust-item-text">
                  <span className="trust-item-title">Bảo Hành Dài Hạn</span>
                  <span className="trust-item-desc">6 - 12 tháng tận nhà</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-item-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                    <line x1="12" y1="6" x2="12" y2="18"></line>
                  </svg>
                </div>
                <div className="trust-item-text">
                  <span className="trust-item-title">Không Phát Sinh</span>
                  <span className="trust-item-desc">Báo giá rõ trước khi làm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-media-wrapper">
            <div className="hero-image-frame">
              <img
                src="/assets/images/firstimage.jpg"
                alt="Kỹ thuật viên chuyên nghiệp AirCool Pro đang sửa chữa, bảo dưỡng máy lạnh tại nhà ở Thủ Đức"
                width="600"
                height="430"
                loading="eager"
              />
            </div>

            <div className="hero-floating-stat">
              <div className="hero-stat-badge">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <div className="hero-stat-val">28,500+</div>
                <div className="hero-stat-lbl">Máy lạnh đã vệ sinh &amp; phục vụ hài lòng</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE SERVICES SECTION */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Dịch Vụ Toàn Diện</span>
            <h2 className="section-title">Các Dịch Vụ Máy Lạnh Chuyên Nghiệp Tại Thủ Đức</h2>
            <p className="section-subtitle">
              Từ bảo trì định kỳ, tháo lắp di dời tới sửa chữa mạch vi xử lý cao cấp. Mọi công đoạn đều tuân thủ quy
              chuẩn kỹ thuật của hãng.
            </p>
          </div>

          <div className="service-filters" role="tablist" aria-label="Bộ lọc dịch vụ">
            {[
              { key: "all", label: "Tất Cả Dịch Vụ" },
              { key: "cleaning", label: "Vệ Sinh & Diệt Khuẩn" },
              { key: "install", label: "Lắp Đặt Máy Mới" },
              { key: "reinstall", label: "Tháo Lắp & Di Dời" },
              { key: "repair", label: "Sửa Chữa Sự Cố" },
              { key: "gas", label: "Bơm Gas Chuẩn Hãng" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`filter-btn${activeFilter === tab.key ? " active" : ""}`}
                data-filter={tab.key}
                role="tab"
                aria-selected={activeFilter === tab.key}
                onClick={() => setActiveFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="services-grid" id="servicesGrid">
            {/* Service 1: Cleaning */}
            {showCard("cleaning") && (
              <article className="service-card" data-category="cleaning">
                <div className="service-card-banner">
                  <img
                    src="/assets/images/cleanning.jpg"
                    alt="Dịch vụ vệ sinh máy lạnh tại Thủ Đức bằng máy xịt nước áp lực cao chuyên dụng"
                    loading="lazy"
                  />
                  <div className="service-card-banner-icon" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                  </div>
                  <span className="service-badge-popular">Khuyên Dùng Định Kỳ</span>
                </div>
                <div className="service-card-body">
                  <span className="service-category-tag">Bảo Dưỡng Chuyên Sâu</span>
                  <h3 className="service-title">Vệ Sinh Máy Lạnh Chuyên Nghiệp</h3>
                  <p className="service-excerpt">
                    Làm sạch dàn lạnh và dàn nóng bằng máy xịt áp lực có máng che chắn không văng bẩn ra tường nhà. Khử
                    khuẩn nấm mốc triệt để.
                    <Link
                      href="/blog/meo-sua-may-lanh"
                      style={{
                        display: "inline-block",
                        marginTop: "8px",
                        color: "var(--color-primary)",
                        fontWeight: 600,
                        textDecoration: "none",
                        fontSize: "0.9rem",
                      }}
                    >
                      💡 5 Dấu hiệu nhận biết máy lạnh cần vệ sinh gấp ➜
                    </Link>
                  </p>
                  <ul className="service-checklist">
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Xịt rửa dàn lạnh, lồng sóc quạt &amp; lưới lọc
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Vệ sinh dàn nóng bên ngoài tản nhiệt tốt
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Thông tắc đường ống thoát nước thải
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Đo kiểm dòng điện &amp; áp suất gas miễn phí
                    </li>
                  </ul>
                  <div className="service-card-footer">
                    <div className="service-price-block">
                      <span className="service-price-label">Giá trọn gói từ</span>
                      <div>
                        <span className="service-price-amount">250.000₫</span>
                        <span className="service-price-unit">/máy</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => triggerBooking("Vệ sinh máy lạnh")}>
                      Đặt Dịch Vụ
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* Service 2: Installing */}
            {showCard("install") && (
              <article className="service-card" data-category="install">
                <div className="service-card-banner">
                  <img
                    src="/assets/images/installing.jpg"
                    alt="Thợ lắp đặt máy lạnh Thủ Đức thi công đúng chuẩn kỹ thuật"
                    loading="lazy"
                  />
                  <div className="service-card-banner-icon" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                  </div>
                </div>
                <div className="service-card-body">
                  <span className="service-category-tag">Lắp Đặt Mới</span>
                  <h3 className="service-title">Lắp Đặt Máy Lạnh</h3>
                  <p className="service-excerpt">
                    Khảo sát vị trí lắp đặt thẩm mỹ, tối ưu gió mát. Sử dụng ống đồng đúng độ dày tiêu chuẩn, hút chân
                    không sạch ẩm trước khi vận hành.
                  </p>
                  <ul className="service-checklist">
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Bắt giá treo dàn lạnh thăng bằng thủy chuẩn
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Loe ống đồng bọc gen cách nhiệt chống đọng sương
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Hút chân không đường ống chuyên dụng 15-20 phút
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Bảo hành mối nối ống đồng &amp; lắp đặt 12 tháng
                    </li>
                  </ul>
                  <div className="service-card-footer">
                    <div className="service-price-block">
                      <span className="service-price-label">Công lắp đặt từ</span>
                      <div>
                        <span className="service-price-amount">550.000₫</span>
                        <span className="service-price-unit">/bộ</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => triggerBooking("Lắp đặt máy lạnh mới")}
                    >
                      Đặt Dịch Vụ
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* Service 3: Reinstalling */}
            {showCard("reinstall") && (
              <article className="service-card" data-category="reinstall">
                <div className="service-card-banner">
                  <img
                    src="/assets/images/openning.jpg"
                    alt="Dịch vụ tháo lắp, di dời máy lạnh tại Thủ Đức an toàn không mất gas"
                    loading="lazy"
                  />
                  <div className="service-card-banner-icon" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 2v6h-6"></path>
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                      <path d="M3 22v-6h6"></path>
                      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                    </svg>
                  </div>
                </div>
                <div className="service-card-body">
                  <span className="service-category-tag">Tháo Dỡ &amp; Di Dời</span>
                  <h3 className="service-title">Tháo Lắp &amp; Di Dời Máy Lạnh</h3>
                  <p className="service-excerpt">
                    Khóa gas an toàn 100% về block, tránh hao hụt môi chất lạnh. Đóng gói cẩn thận, vận chuyển an toàn
                    và lắp ráp tại vị trí mới.
                  </p>
                  <ul className="service-checklist">
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Thu hồi và khóa gas 100% trước khi tháo
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Tháo dàn nóng, dàn lạnh, ống đồng gọn gàng
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Hỗ trợ vận chuyển sang địa chỉ mới trong ngày
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Lắp đặt hoàn thiện và test máy chạy êm
                    </li>
                  </ul>
                  <div className="service-card-footer">
                    <div className="service-price-block">
                      <span className="service-price-label">Trọn gói tháo &amp; lắp từ</span>
                      <div>
                        <span className="service-price-amount">700.000₫</span>
                        <span className="service-price-unit">/máy</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => triggerBooking("Tháo lắp di dời máy lạnh")}
                    >
                      Đặt Dịch Vụ
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* Service 4: Repairing */}
            {showCard("repair") && (
              <article className="service-card" data-category="repair">
                <div className="service-card-banner">
                  <img
                    src="/assets/images/checking.jpg"
                    alt="Thợ sửa máy lạnh tại Thủ Đức đang kiểm tra bo mạch máy lạnh"
                    loading="lazy"
                  />
                  <div className="service-card-banner-icon" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>
                  <span className="service-badge-popular">Cứu Hộ Nhanh 30P</span>
                </div>
                <div className="service-card-body">
                  <span className="service-category-tag">Khắc Phục Sự Cố</span>
                  <h3 className="service-title">Sửa Chữa Máy Lạnh Tận Nơi</h3>
                  <p className="service-excerpt">
                    Khắc phục mọi sự cố máy lạnh không mát, chảy nước, chớp đèn lỗi bo mạch, kêu to, xì dàn. Thay thế
                    linh kiện chính hãng 100%.
                  </p>
                  <ul className="service-checklist">
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Xử lý máy chảy nước vào tường trong 20 phút
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Sửa bo mạch Inverter Daikin, Panasonic, LG, v.v.
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Hàn khắc phục điểm xì dàn nóng &amp; dàn lạnh
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Linh kiện chính hãng có tem bảo hành 6 - 12T
                    </li>
                  </ul>
                  <div className="service-card-footer">
                    <div className="service-price-block">
                      <span className="service-price-label">Khảo sát &amp; sửa từ</span>
                      <div>
                        <span className="service-price-amount">150.000₫</span>
                        <span className="service-price-unit">/lần kiểm tra</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => triggerBooking("Sửa chữa máy lạnh")}>
                      Đặt Dịch Vụ
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* Service 5: Gas Refill */}
            {showCard("gas") && (
              <article className="service-card" data-category="gas">
                <div className="service-card-banner">
                  <img
                    src="/assets/images/measuringgas.jpg"
                    alt="Dịch vụ bơm gas máy lạnh Thủ Đức loại R32 R410A R22 chính hãng"
                    loading="lazy"
                  />
                  <div className="service-card-banner-icon" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                    </svg>
                  </div>
                </div>
                <div className="service-card-body">
                  <span className="service-category-tag">Kiểm Tra Nạp Gas</span>
                  <h3 className="service-title">Bơm Gas Máy Lạnh R32 / R410A / R22</h3>
                  <p className="service-excerpt">
                    Đo lường áp suất bằng đồng hồ kỹ thuật số. Nạp đúng định lượng theo bảng thông số kỹ thuật của nhà
                    sản xuất, giúp máy làm lạnh sâu.
                    <Link
                      href="/blog/khi-nao-can-bom-gas-may-lanh"
                      style={{
                        display: "inline-block",
                        marginTop: "8px",
                        color: "var(--color-primary)",
                        fontWeight: 600,
                        textDecoration: "none",
                        fontSize: "0.9rem",
                      }}
                    >
                      💡 Khi nào máy lạnh thực sự cần bơm gas? Tránh bị vẽ bệnh ➜
                    </Link>
                  </p>
                  <ul className="service-checklist">
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Khách hàng kiểm tra bình gas trước khi nạp
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Gas tinh khiết nhập khẩu Ấn Độ / Nhật Bản
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Đo áp suất PSI chuẩn từng dòng máy
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Bảo hành rò rỉ van sạc 6 tháng
                    </li>
                  </ul>
                  <div className="service-card-footer">
                    <div className="service-price-block">
                      <span className="service-price-label">Giá nạp bổ sung từ</span>
                      <div>
                        <span className="service-price-amount">110.000₫</span>
                        <span className="service-price-unit">/10 PSI</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => triggerBooking("Bơm nạp gas máy lạnh")}
                    >
                      Đặt Dịch Vụ
                    </button>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>

      {/* BEFORE & AFTER INTERACTIVE COMPARISON SLIDER */}
      <section className="section compare-section" id="compare">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Thấy Rõ Sự Khác Biệt</span>
            <h2 className="section-title">Trước &amp; Sau Khi Vệ Sinh Chuyên Sâu</h2>
            <p className="section-subtitle">
              Kéo thanh trượt để so sánh dàn lạnh bám bụi nấm mốc và sau khi được xử lý bằng hóa chất khử khuẩn chuyên
              dụng của AirCool Pro.
            </p>
          </div>

          <div className="compare-box">
            <div
              className="compare-container"
              id="compareContainer"
              ref={compareContainerRef}
              onClick={(e) => updateSliderPosition(e.clientX)}
            >
              <img
                src="/assets/images/dirtycoil3.jpg"
                alt="Dàn lạnh bám đầy nấm mốc trước khi gọi dịch vụ vệ sinh máy lạnh Thủ Đức"
                className="compare-img before"
                loading="lazy"
              />
              <span className="compare-badge before-badge">Trước: Bụi Bẩn &amp; Nấm Mốc</span>

              <img
                src="/assets/images/cleanning.jpg"
                alt="Dàn lạnh sạch bong sau khi thợ vệ sinh máy lạnh Thủ Đức xử lý"
                className="compare-img after"
                id="compareAfterImg"
                style={{ width: `${sliderPos}%` }}
                loading="lazy"
              />
              <span className="compare-badge after-badge">Sau: Sạch Khuẩn 99.9%</span>

              <div
                className="compare-slider-control"
                id="compareSlider"
                style={{ left: `${sliderPos}%` }}
                role="slider"
                aria-valuenow={Math.round(sliderPos)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Thanh trượt so sánh trước và sau"
                onMouseDown={() => {
                  isDraggingRef.current = true;
                }}
                onTouchStart={() => {
                  isDraggingRef.current = true;
                }}
              >
                <div className="compare-handle" aria-hidden="true">
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
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginLeft: "-8px" }}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            <div className="compare-footer-info">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text)" }}>
                  Tăng 40% hiệu suất làm mát, tiết kiệm điện ngay sau khi vệ sinh
                </span>
              </div>
              <button className="btn btn-cta btn-sm" onClick={() => triggerBooking("Vệ sinh chuyên sâu")}>
                Đặt Lịch Vệ Sinh Ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE INSTANT COST CALCULATOR */}
      <section className="section" id="calculator">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Dự Toán Chi Phí Minh Bạch</span>
            <h2 className="section-title">Ước Tính Chi Phí Dịch Vụ Điện Lạnh Thủ Đức</h2>
            <p className="section-subtitle">
              Chọn loại máy lạnh, dịch vụ cần làm và số lượng để hệ thống tính toán chi phí dự kiến chính xác, không lo
              bị kê giá.
            </p>
          </div>

          <div className="calculator-card">
            <div className="calc-grid">
              <div className="calc-controls">
                {/* AC Type Selector */}
                <div className="calc-form-group">
                  <label className="calc-label">1. Loại Máy Lạnh Của Bạn</label>
                  <div className="calc-options-grid">
                    <label className="calc-pill-label">
                      <input
                        type="radio"
                        name="acType"
                        value="wall"
                        checked={acType === "wall"}
                        onChange={() => setAcType("wall")}
                      />
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                        <line x1="6" y1="13" x2="18" y2="13"></line>
                      </svg>
                      Treo Tường (1 - 2.5 HP)
                    </label>
                    <label className="calc-pill-label">
                      <input
                        type="radio"
                        name="acType"
                        value="ceiling"
                        checked={acType === "ceiling"}
                        onChange={() => setAcType("ceiling")}
                      />
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        <circle cx="12" cy="12" r="4"></circle>
                      </svg>
                      Âm Trần / Cassette
                    </label>
                  </div>
                </div>

                {/* Service Type Selector */}
                <div className="calc-form-group">
                  <label className="calc-label">2. Dịch Vụ Cần Thực Hiện</label>
                  <div className="calc-options-grid">
                    {[
                      { val: "clean", label: "Vệ Sinh Toàn Diện" },
                      { val: "install", label: "Lắp Đặt Máy Mới" },
                      { val: "reinstall", label: "Tháo & Di Dời" },
                      { val: "repair", label: "Khảo Sát Sửa Chữa" },
                    ].map((srv) => (
                      <label key={srv.val} className="calc-pill-label">
                        <input
                          type="radio"
                          name="calcService"
                          value={srv.val}
                          checked={calcService === srv.val}
                          onChange={() => setCalcService(srv.val)}
                        />
                        {srv.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Optional Gas Add-on */}
                <div className="calc-form-group">
                  <label className="calc-label">3. Tùy Chọn Thêm (Nạp gas bổ sung)</label>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "0.92rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        id="addGasCheck"
                        checked={addGas}
                        onChange={(e) => setAddGas(e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)" }}
                      />
                      Bơm thêm gas tinh khiết (+110.000₫ / 10 PSI)
                    </label>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="calc-form-group">
                  <label className="calc-label">4. Số Lượng Máy</label>
                  <div className="calc-quantity-wrapper">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => changeQuantity(-1)}
                      aria-label="Giảm 1 máy"
                    >
                      -
                    </button>
                    <span className="qty-display" id="qtyDisplay">
                      {qty}
                    </span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => changeQuantity(1)}
                      aria-label="Tăng 1 máy"
                    >
                      +
                    </button>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                      (Giảm 10% từ 3 máy trở lên)
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="calc-summary-box">
                <h3 className="calc-summary-title">Bản Dự Tính Chi Phí</h3>
                <div className="calc-summary-row">
                  <span>Đơn vị tính:</span>
                  <strong id="summaryType">{typeNames[acType]}</strong>
                </div>
                <div className="calc-summary-row">
                  <span>Dịch vụ:</span>
                  <strong id="summaryService">
                    {serviceNames[calcService]}
                    {addGas ? " (+Gas)" : ""}
                  </strong>
                </div>
                <div className="calc-summary-row">
                  <span>Số lượng máy:</span>
                  <strong id="summaryQty">{qty} máy</strong>
                </div>
                {qty >= 3 && (
                  <div className="calc-summary-row" id="discountRow" style={{ display: "flex", color: "#86efac" }}>
                    <span>Ưu đãi số lượng (10%):</span>
                    <strong id="summaryDiscount">-{discount.toLocaleString("vi-VN")}₫</strong>
                  </div>
                )}

                <div className="calc-total-row">
                  <div>
                    <span className="calc-total-label">Tổng Chi Phí Ước Tính</span>
                    <div style={{ fontSize: "0.75rem", color: "#bae6fd" }}>(Đã gồm công thợ + đồ nghề)</div>
                  </div>
                  <div className="calc-total-price" id="totalPriceDisplay">
                    {finalTotal.toLocaleString("vi-VN")}₫
                  </div>
                </div>

                <p className="calc-note">
                  * Giá mang tính tham khảo minh bạch, kỹ thuật viên sẽ xác nhận chính xác sau khi kiểm tra hiện trường
                  trước khi làm.
                </p>

                <button className="btn btn-cta" style={{ width: "100%" }} onClick={openBookingFromCalculator}>
                  Đặt Lịch Dịch Vụ Theo Giá Này
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-STAR PROFESSIONAL PROCESS SECTION */}
      <section className="section" id="process" style={{ backgroundColor: "#ffffff" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Tiêu Chuẩn Kỹ Thuật</span>
            <h2 className="section-title">Quy Trình Phục Vụ Chuẩn 5 Sao</h2>
            <p className="section-subtitle">
              Chúng tôi mang đến sự an tâm tuyệt đối qua quy trình 5 bước minh bạch, sạch sẽ và chuyên nghiệp từ khâu
              đón nhận đến bàn giao.
            </p>
          </div>

          <div className="process-timeline">
            <div className="process-card">
              <div className="process-step-num">1</div>
              <div className="process-icon-wrap" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3 className="process-card-title">Tiếp Nhận &amp; Điều Phối</h3>
              <p className="process-card-desc">
                Nhận thông tin qua website hoặc hotline. Điều phối thợ gần khu vực bạn nhất ngay lập tức.
              </p>
            </div>

            <div className="process-card">
              <div className="process-step-num">2</div>
              <div className="process-icon-wrap" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <h3 className="process-card-title">Khảo Sát &amp; Báo Giá</h3>
              <p className="process-card-desc">
                Kiểm tra hiện trạng máy, đo áp suất gas, đưa ra phương án tối ưu và báo giá chuẩn trước khi làm.
              </p>
            </div>

            <div className="process-card">
              <div className="process-step-num">3</div>
              <div className="process-icon-wrap" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              </div>
              <h3 className="process-card-title">Thi Công Chuẩn Xác</h3>
              <p className="process-card-desc">
                Vệ sinh, tháo lắp hoặc sửa chữa tỉ mỉ. Che chắn sạch sẽ đồ đạc, không làm vấy bẩn không gian sống.
              </p>
            </div>

            <div className="process-card">
              <div className="process-step-num">4</div>
              <div className="process-icon-wrap" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="process-card-title">Bàn Giao &amp; Bảo Hành</h3>
              <p className="process-card-desc">
                Cho máy vận hành thử, khách hàng nghiệm thu hài lòng mới thanh toán và nhận phiếu bảo hành điện tử.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & COMMITMENTS (4 GOLDEN RULES) */}
      <section
        className="section"
        style={{
          backgroundColor: "#ffffff",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container">
          <div className="commitments-grid">
            <div className="commitment-card">
              <div className="commitment-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div className="commitment-content">
                <h4>Bảo Hành Tới 12 Tháng</h4>
                <p>Có tem và phiếu bảo hành điện tử chính xác, gọi là thợ tới ngay không đùn đẩy trách nhiệm.</p>
              </div>
            </div>

            <div className="commitment-card">
              <div className="commitment-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="commitment-content">
                <h4>100% Giá Niêm Yết</h4>
                <p>Tuyệt đối không vẽ vời phát sinh. Báo giá công khai rõ ràng trước khi chạm vào máy.</p>
              </div>
            </div>

            <div className="commitment-card">
              <div className="commitment-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div className="commitment-content">
                <h4>Tốc Độ Sau 30 Phút</h4>
                <p>Mạng lưới thợ phủ rộng khắp các quận huyện, có mặt nhanh chóng giải quyết cái nóng nực ngay.</p>
              </div>
            </div>

            <div className="commitment-card">
              <div className="commitment-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="commitment-content">
                <h4>Linh Kiện Chính Hãng</h4>
                <p>Sử dụng phụ tùng và gas tinh khiết nhập khẩu, tương thích 100% với từng dòng máy lạnh.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & REVIEWS */}
      <section className="section" id="reviews">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Đánh Giá Từ Khách Hàng</span>
            <h2 className="section-title">Hơn 28.000 Gia Đình Đã Tin Tưởng</h2>
            <p className="section-subtitle">
              Sự hài lòng của khách hàng là thước đo uy tín lớn nhất của đội ngũ kỹ thuật viên AirCool Pro.
            </p>
          </div>

          <div className="reviews-grid">
            {[
              {
                quote:
                  '"Thợ đến rất đúng hẹn, mang bọc máng xịt nước cực kỳ cẩn thận không bị bắn một giọt nào ra sàn gỗ của tôi. Máy vệ sinh xong thổi gió mát lạnh và thơm mát hẳn. Rất ưng ý!"',
                avatar: "TH",
                name: "Anh Trần Hoàng",
                loc: "Chung cư Vinhomes Central Park",
              },
              {
                quote:
                  '"Máy lạnh nhà mình bị chảy nước ướt cả góc phòng ngủ giữa trưa nắng. Gọi AirCool Pro đúng 25 phút là bạn thợ đã có mặt, thông ống và kiểm tra gas rất tận tình, giá đúng 150k niêm yết."',
                avatar: "ML",
                name: "Chị Mai Linh",
                loc: "Nhà phố Quận 7",
              },
              {
                quote:
                  '"Công ty mình di dời 6 bộ máy lạnh văn phòng. Bên này làm việc chuyên nghiệp, có hợp đồng xuất hóa đơn đỏ đầy đủ, khóa gas chuẩn không bị mất gas xíu nào. Sẽ tiếp tục ủng hộ lâu dài."',
                avatar: "QD",
                name: "Anh Quốc Dũng",
                loc: "Giám Đốc TechHub Solution",
              },
            ].map((rev, idx) => (
              <div key={idx} className="review-card">
                <div>
                  <div className="review-stars" aria-label="Đánh giá 5 sao">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <p className="review-quote">{rev.quote}</p>
                </div>
                <div className="review-author">
                  <div className="review-avatar">{rev.avatar}</div>
                  <div className="review-meta">
                    <h5>{rev.name}</h5>
                    <p>{rev.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="section" id="faq">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Giải Đáp Thắc Mắc</span>
            <h2 className="section-title">Câu Hỏi Thường Gặp</h2>
            <p className="section-subtitle">
              Những giải đáp thiết thực nhất về thời gian, chi phí và cách duy trì độ bền máy lạnh của bạn.
            </p>
          </div>

          <div className="faq-list">
            {/* Q1 */}
            <div className={`faq-item${openFaqIndex === 0 ? " open" : ""}`}>
              <button
                className="faq-question"
                aria-expanded={openFaqIndex === 0}
                onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
              >
                <span>Bao lâu gia đình nên vệ sinh bảo dưỡng máy lạnh một lần?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className="faq-answer">
                Đối với hộ gia đình sử dụng thường xuyên (khoảng 6-8 tiếng/ngày), chu kỳ lý tưởng là{" "}
                <strong>3 - 4 tháng/lần</strong>. Đối với văn phòng công ty là <strong>2 - 3 tháng/lần</strong>, và môi
                trường nhiều bụi bẩn như quán ăn, xưởng sản xuất là <strong>1 - 2 tháng/lần</strong> để giữ không khí
                trong lành và tiết kiệm điện năng.
                <div style={{ marginTop: "10px" }}>
                  <Link
                    href="/blog/meo-dung-may-lanh-tiet-kiem-dien"
                    style={{
                      color: "var(--color-primary)",
                      fontWeight: 600,
                      textDecoration: "underline",
                      fontSize: "0.92rem",
                    }}
                  >
                    💡 Xem thêm: 5 Mẹo dùng máy lạnh cả ngày không lo tốn tiền điện ➜
                  </Link>
                </div>
              </div>
            </div>

            {/* Q2 */}
            <div className={`faq-item${openFaqIndex === 1 ? " open" : ""}`}>
              <button
                className="faq-question"
                aria-expanded={openFaqIndex === 1}
                onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
              >
                <span>Khi tháo dỡ và di dời máy lạnh có bị mất gas không?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className="faq-answer">
                Hoàn toàn <strong>KHÔNG</strong>. Trước khi tháo máy, kỹ thuật viên AirCool Pro sẽ bật máy chạy và tiến
                hành khóa van gas hồi, thu hồi 100% lượng gas về block nén an toàn trước khi siết chặt van khóa. Sau
                khi lắp đặt lại tại vị trí mới sẽ hút chân không và xả gas hoạt động bình thường mà không hao hụt.
              </div>
            </div>

            {/* Q3 */}
            <div className={`faq-item${openFaqIndex === 2 ? " open" : ""}`}>
              <button
                className="faq-question"
                aria-expanded={openFaqIndex === 2}
                onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
              >
                <span>Tại sao máy lạnh vẫn chạy vù vù nhưng phòng không mát?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className="faq-answer">
                Các nguyên nhân phổ biến nhất gồm: dàn lạnh hoặc lưới lọc bị đóng bụi dày cản gió, dàn nóng không tản
                được nhiệt do bụi bẩn, máy bị thiếu gas/rò rỉ gas ở mối nối, hoặc hỏng tụ quạt/block nén. Bạn chỉ cần
                đặt lịch kiểm tra, thợ sẽ đo đồng hồ và báo chính xác nguyên nhân sau 10 phút.
                <div style={{ marginTop: "10px" }}>
                  <Link
                    href="/blog/khi-nao-can-bom-gas-may-lanh"
                    style={{
                      color: "var(--color-primary)",
                      fontWeight: 600,
                      textDecoration: "underline",
                      fontSize: "0.92rem",
                    }}
                  >
                    💡 Hướng dẫn: Cách nhận biết máy lạnh thiếu gas và chiêu trò vẽ bệnh ➜
                  </Link>
                </div>
              </div>
            </div>

            {/* Q4 */}
            <div className={`faq-item${openFaqIndex === 3 ? " open" : ""}`}>
              <button
                className="faq-question"
                aria-expanded={openFaqIndex === 3}
                onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
              >
                <span>Chính sách bảo hành sau khi sửa chữa hoặc vệ sinh ra sao?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className="faq-answer">
                Tất cả dịch vụ của AirCool Pro đều có phiếu bảo hành hoặc lưu số điện thoại điện tử trên hệ thống: Vệ
                sinh máy được bảo hành chảy nước 30-90 ngày; linh kiện thay thế và sửa chữa mạch được bảo hành từ{" "}
                <strong>6 đến 12 tháng</strong>. Nếu có bất kỳ trục trặc nào, chúng tôi sẽ cử kỹ thuật viên xử lý miễn
                phí trong vòng 2-4 tiếng.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG SECTION (Shows 3 Featured Posts + Link to /blog) */}
      <section className="section bg-light" id="blog">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Cẩm Nang &amp; Kinh Nghiệm</span>
            <h2 className="section-title">Kiến Thức Hữu Ích</h2>
            <p className="section-subtitle">
              Những mẹo hay giúp bạn sử dụng máy lạnh bền bỉ, tiết kiệm điện và phát hiện lỗi kịp thời.
            </p>
          </div>

          <div className="blog-grid">
            {featuredPosts.map((post) => (
              <article key={post.slug} className="blog-card">
                <img src={post.coverImage} alt={post.coverAlt} className="blog-img" loading="lazy" />
                <div className="blog-content">
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="blog-btn">
                    Đọc ngay ➜
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "36px" }}>
            <Link href="/blog" className="btn btn-outline">
              Xem Tất Cả Bài Viết Cẩm Nang ➜
            </Link>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="container" style={{ marginBottom: "var(--space-3xl)" }}>
        <div className="cta-banner">
          <h2>Máy Lạnh Có Vấn Đề? Đừng Để Nóng Bức Làm Bạn Mệt Mỏi!</h2>
          <p>
            Gọi ngay cho chúng tôi hoặc để lại số điện thoại. Đội ngũ kỹ thuật viên lành nghề luôn túc trực phục vụ bạn
            24/7 kể cả ngày lễ.
          </p>
          <div className="cta-banner-buttons">
            <button className="btn btn-cta btn-lg" onClick={() => triggerBooking("Tư vấn khẩn cấp")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Đặt Lịch Ngay Trong Ngày
            </button>
            <a
              href="https://zalo.me/0968831027"
              className="btn btn-light btn-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Nhắn Zalo: 0968.831.027
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                  <line x1="12" y1="2" x2="12" y2="22"></line>
                  <path d="m17 7-5 5-5-5"></path>
                  <path d="m17 17-5-5-5 5"></path>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="m7 7 5 5-5 5"></path>
                  <path d="m17 7-5 5 5 5"></path>
                </svg>
                AirCool Pro
              </h3>
              <p>
                Hệ thống điện lạnh gia đình và công nghiệp hàng đầu. Chuyên nghiệp, tận tâm, cam kết chất lượng chuẩn
                hãng với hơn 10 năm kinh nghiệm trong ngành.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    background: "rgba(255,255,255,0.1)",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    color: "#e0f2fe",
                  }}
                >
                  ISO 9001:2015
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    background: "rgba(255,255,255,0.1)",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    color: "#e0f2fe",
                  }}
                >
                  Chứng Nhận Hãng
                </span>
              </div>
            </div>

            <div>
              <h4 className="footer-title">Dịch Vụ Nổi Bật</h4>
              <ul className="footer-links">
                <li>
                  <a href="#services" onClick={() => setActiveFilter("cleaning")}>
                    Vệ Sinh Máy Lạnh Treo Tường
                  </a>
                </li>
                <li>
                  <a href="#services" onClick={() => setActiveFilter("cleaning")}>
                    Vệ Sinh Máy Lạnh Âm Trần
                  </a>
                </li>
                <li>
                  <a href="#services" onClick={() => setActiveFilter("install")}>
                    Lắp Đặt Máy Lạnh Mới
                  </a>
                </li>
                <li>
                  <a href="#services" onClick={() => setActiveFilter("reinstall")}>
                    Tháo Dỡ &amp; Di Dời Nhà Xưởng
                  </a>
                </li>
                <li>
                  <a href="#services" onClick={() => setActiveFilter("repair")}>
                    Sửa Máy Lạnh Không Lạnh
                  </a>
                </li>
                <li>
                  <a href="#services" onClick={() => setActiveFilter("gas")}>
                    Bơm Nạp Gas R32/R410A
                  </a>
                </li>
              </ul>
              <h4 className="footer-title" style={{ marginTop: "20px" }}>
                Cẩm Nang &amp; Kinh Nghiệm
              </h4>
              <ul className="footer-links">
                <li>
                  <Link href="/blog/meo-sua-may-lanh">5 Dấu hiệu máy lạnh cần vệ sinh gấp</Link>
                </li>
                <li>
                  <Link href="/blog/khi-nao-can-bom-gas-may-lanh">Khi nào máy lạnh thực sự cần bơm gas?</Link>
                </li>
                <li>
                  <Link href="/blog/meo-dung-may-lanh-tiet-kiem-dien">Mẹo dùng máy lạnh không lo tốn điện</Link>
                </li>
                <li>
                  <Link href="/blog">Tất cả bài viết cẩm nang ➜</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">Khu Vực Phục Vụ</h4>
              <ul className="footer-links">
                <li>
                  <a href="#services">Quận 1, Quận 3, Quận 5</a>
                </li>
                <li>
                  <a href="#services">Quận 7, Nhà Bè, Bình Chánh</a>
                </li>
                <li>
                  <a href="#services">Thủ Đức, Quận 2, Quận 9</a>
                </li>
                <li>
                  <a href="#services">Bình Thạnh, Phú Nhuận, Gò Vấp</a>
                </li>
                <li>
                  <a href="#services">Tân Bình, Tân Phú, Bình Tân</a>
                </li>
                <li>
                  <a href="#services">Các tỉnh lân cận (Hợp đồng)</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">Liên Hệ Trực Tiếp</h4>
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Trụ sở chính: 128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>
                  Hỗ trợ khẩn cấp:{" "}
                  <strong>
                    <a
                      href="https://zalo.me/0968831027"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      0968.831.027
                    </a>
                  </strong>{" "}
                  (Zalo)
                </span>
              </div>
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>Email hỗ trợ: hotro@aircoolpro.vn</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© 2026 AirCool Pro Services. Bảo lưu mọi quyền. Đã đăng ký bộ công thương.</div>
            <div style={{ display: "flex", gap: "16px" }}>
              <Link href="/">Chính Sách Bảo Mật</Link>
              <Link href="/">Điều Khoản Dịch Vụ</Link>
              <Link href="/">Quy Định Bảo Hành</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
