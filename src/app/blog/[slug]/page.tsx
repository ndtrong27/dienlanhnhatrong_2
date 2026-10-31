import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {
      title: "Không tìm thấy bài viết | AirCool Pro",
    };
  }

  return {
    title: post.seoTitle,
    description: post.description,
    alternates: {
      canonical: `https://dienlanhnhatrong2.vercel.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.seoTitle,
      description: post.description,
      images: [post.coverImage],
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getAllPosts().filter((p) => p.slug !== post.slug);

  return (
    <>
      <header className="header">
        <div className="container navbar">
          <Link
            href={`/?utm_source=blog&utm_medium=header_logo&utm_campaign=${post.slug}`}
            className="brand-logo"
          >
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
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link href="/blog" className="btn btn-outline btn-sm">
              ← Tất Cả Bài Viết
            </Link>
            <Link
              href={`/?utm_source=blog&utm_medium=header_back_btn&utm_campaign=${post.slug}`}
              className="btn btn-cta btn-sm"
            >
              Trang Chủ &amp; Bảng Giá
            </Link>
          </div>
        </div>
      </header>

      <section className="blog-detail-hero">
        <div className="container">
          <span className="section-tag">{post.category}</span>
          <h1
            className="section-title"
            style={{ maxWidth: "800px", margin: "10px auto", lineHeight: 1.3 }}
          >
            {post.title}
          </h1>
          <p className="section-subtitle">
            Đăng ngày: {post.dateFormatted} • Bởi Kỹ thuật viên trưởng AirCool Pro
          </p>
        </div>
      </section>

      <article className="blog-detail-content">
        <img src={post.coverImage} alt={post.coverAlt} loading="eager" />

        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

        <div className="cta-box">
          <h3 style={{ color: "var(--color-primary-dark)", marginTop: 0 }}>{post.ctaHeading}</h3>
          <p style={{ marginBottom: "20px" }}>{post.ctaSubheading}</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href={`/?utm_source=blog&utm_medium=cta_box&utm_campaign=${post.slug}#calculator`}
              className="btn btn-cta btn-lg"
            >
              Bấm Tính Giá Tự Động Trên Trang Chủ ➜
            </Link>
            <a
              href="https://zalo.me/0968831027"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-lg"
            >
              {post.ctaButtonText}
            </a>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="related-posts">
          <div className="container">
            <h2 className="section-title" style={{ textAlign: "center", marginBottom: "30px" }}>
              Bài Viết Cùng Chủ Đề
            </h2>
            <div className="blog-grid">
              {relatedPosts.slice(0, 3).map((rel) => (
                <article key={rel.slug} className="blog-card">
                  <img src={rel.coverImage} alt={rel.coverAlt} className="blog-img" loading="lazy" />
                  <div className="blog-content">
                    <h3 className="blog-title">{rel.title}</h3>
                    <p className="blog-excerpt">{rel.excerpt}</p>
                    <Link href={`/blog/${rel.slug}`} className="blog-btn">
                      Đọc ngay ➜
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="container">
          <div className="footer-bottom" style={{ borderTop: "none", paddingTop: 0 }}>
            <div>© 2026 AirCool Pro Services. Bảo lưu mọi quyền.</div>
            <div style={{ display: "flex", gap: "16px" }}>
              <Link href="/blog">Cẩm Nang</Link>
              <Link href="/">Trang Chủ</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
