import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const blogDirectory = path.join(process.cwd(), "content", "blog");

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  date: string;
  dateFormatted: string;
  coverImage: string;
  coverAlt: string;
  excerpt: string;
  ctaHeading: string;
  ctaSubheading: string;
  ctaButtonText: string;
  contentHtml: string;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory).filter((file) => file.endsWith(".md"));

  const allPosts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(blogDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const contentHtml = marked.parse(content, { async: false }) as string;

    return {
      slug,
      title: data.title || "",
      seoTitle: data.seoTitle || data.title || "",
      description: data.description || "",
      category: data.category || "Cẩm Nang",
      date: data.date || "",
      dateFormatted: data.dateFormatted || data.date || "",
      coverImage: data.coverImage || "/assets/images/firstimage.jpg",
      coverAlt: data.coverAlt || data.title || "",
      excerpt: data.excerpt || "",
      ctaHeading: data.ctaHeading || "Máy lạnh nhà bạn đang gặp sự cố?",
      ctaSubheading:
        data.ctaSubheading ||
        "Liên hệ ngay đội ngũ kỹ thuật viên AirCool Pro Thủ Đức để được kiểm tra tận nhà sau 30 phút!",
      ctaButtonText: data.ctaButtonText || "Nhắn Zalo Gọi Thợ Ngay: 0968.831.027",
      contentHtml,
    };
  });

  return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const cleanSlug = slug.replace(/\.html$/, "");
  const posts = getAllPosts();
  return posts.find((post) => post.slug === cleanSlug);
}
