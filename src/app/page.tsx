import React from "react";
import { getAllPosts } from "@/lib/blog";
import HomePageClient from "@/components/HomePageClient";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HVACBusiness",
  name: "AirCool Pro",
  image: "https://dienlanhnhatrong2.vercel.app/assets/images/firstimage.jpg",
  "@id": "https://dienlanhnhatrong2.vercel.app/",
  url: "https://dienlanhnhatrong2.vercel.app/",
  telephone: "0968831027",
  priceRange: "150000VND - 2250000VND",
  address: {
    "@type": "PostalAddress",
    streetAddress: "17 Mai Chí Thọ, Phường An Khánh",
    addressLocality: "Thành phố Thủ Đức",
    addressRegion: "Hồ Chí Minh",
    addressCountry: "VN",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "07:30",
    closes: "21:00",
  },
};

export default function HomePage() {
  const featuredPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <HomePageClient featuredPosts={featuredPosts} />
    </>
  );
}
