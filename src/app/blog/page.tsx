import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Cẩm Nang & Mẹo Dùng Máy Lạnh Bền Bỉ, Tiết Kiệm Điện | AirCool Pro",
  description:
    "Tổng hợp kiến thức vệ sinh, sửa chữa, bơm gas và mẹo sử dụng máy lạnh tiết kiệm điện từ đội ngũ kỹ thuật viên AirCool Pro Thủ Đức.",
  alternates: {
    canonical: "https://dienlanhnhatrong2.vercel.app/blog",
  },
};

export default function BlogArchivePage() {
  const posts = getAllPosts();

  return (
    <>
      <header className="header">
        <div className="container navbar">
          <Link href="/" className="brand-logo">
            <div className="brand-logo-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <path d="m17 7-5 5-5-5"></path>
                <path d="m17 17-5-5-5 5"></path>
                <line x1="2" y1="12" x2="22" y2="12"></line>
              </svg>
            </div>
            <span>
              AirCool<span>Pro</span>
            </span>
          </Link>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/" className="btn btn-outline btn-sm">
              ← Quay Lại Trang Chủ
            </Link>
            <a
              href="https://zalo.me/0968831027"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-cta btn-sm"
            >
              Zalo: 0968.831.027
            </a>
          </div>
        </div>
      </header>

      <section className="blog-detail-hero">
        <div className="container">
          <span className="section-tag">Thư Viện Kiến Thức Điện Lạnh</span>
          <h1
            className="section-title"
            style={{ maxWidth: "800px", margin: "10px auto", lineHeight: 1.3 }}
          >
            Cẩm Nang Sửa Chữa &amp; Bảo Dưỡng Máy Lạnh
          </h1>
          <p className="section-subtitle">
            Cập nhật liên tục các mẹo nhận biết bệnh máy lạnh, cách tiết kiệm điện và bảng giá dịch vụ minh bạch tại TP.
            Thủ Đức &amp; TP.HCM.
          </p>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <div className="blog-grid">
            {posts.map((post) => (
              <article key={post.slug} className="blog-card">
                <img src={post.coverImage} alt={post.coverAlt} className="blog-img" loading="lazy" />
                <div className="blog-content">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{post.category}</span>
                    <span>{post.dateFormatted}</span>
                  </div>
                  <h2 className="blog-title" style={{ fontSize: "1.15rem" }}>
                    {post.title}
                  </h2>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="blog-btn">
                    Đọc chi tiết ➜
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div
            style={{
              marginTop: "50px",
              padding: "32px",
              background: "#fff",
              borderRadius: "16px",
              border: "2px solid var(--color-primary)",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "var(--color-primary-dark)", marginBottom: "10px" }}>
              Cần Thợ Kiểm Tra &amp; Vệ Sinh Máy Lạnh Tận Nhà Sau 30 Phút?
            </h3>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "20px" }}>
              Xem bảng tính chi phí tự động hoặc đặt lịch ngay trên trang chủ AirCool Pro.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/?utm_source=blog_archive&utm_medium=cta#calculator"
                className="btn btn-cta"
              >
                Tính Chi Phí Tự Động ➜
              </Link>
              <Link
                href="/?utm_source=blog_archive&utm_medium=cta#services"
                className="btn btn-outline"
              >
                Xem Bảng Giá Dịch Vụ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-bottom" style={{ borderTop: "none", paddingTop: 0 }}>
            <div>© 2026 AirCool Pro Services. Bảo lưu mọi quyền.</div>
            <div>
              <Link href="/">Trang Chủ</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

