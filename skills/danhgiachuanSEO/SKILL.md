---
name: seo-website-scorer
description: Đánh giá khắt khe một website có đạt chuẩn SEO hay chưa và chấm điểm trên thang 10 dựa trên rubric 100 điểm, có điều kiện chặn (hard cap), bằng chứng bắt buộc và báo cáo lỗi theo mức độ ưu tiên. Hãy dùng skill này bất cứ khi nào người dùng yêu cầu audit SEO, kiểm tra/chấm điểm/đánh giá SEO của một website hoặc URL, hỏi "web tôi chuẩn SEO chưa", "SEO web này được mấy điểm", "vì sao web không lên top", "kiểm tra SEO technical/on-page", hoặc muốn so sánh chất lượng SEO giữa các website, kể cả khi họ không nói rõ chữ "audit" hay "thang điểm". Trigger cả với yêu cầu tiếng Anh như "SEO audit", "score my site", "is my website SEO friendly".
---

# SEO Website Scorer — Chấm điểm SEO trên thang 10

Skill này hướng dẫn AI agent đánh giá **một website** theo chuẩn SEO hiện đại (Google Search Essentials, Core Web Vitals, E-E-A-T, Helpful Content) và trả về **điểm /10 kèm bằng chứng, lỗi ưu tiên và lộ trình sửa**.

## Triết lý chấm điểm (BẮT BUỘC tuân thủ)

1. **Khắt khe mặc định.** Điểm xuất phát của mọi tiêu chí là 0. Chỉ cộng điểm khi có **bằng chứng kiểm chứng được**. Không "châm chước" vì website trông đẹp hay thương hiệu lớn.
2. **Không bằng chứng = không điểm.** Mỗi điểm cộng/trừ phải gắn với một quan sát cụ thể (URL, đoạn HTML, header, số đo). Cấm chấm theo cảm tính.
3. **Không bịa số liệu.** Nếu không đo được (ví dụ không có dữ liệu Core Web Vitals thực tế, không có Search Console), ghi rõ `Không xác minh được`, **không đoán**. Xem mục "Xử lý tiêu chí không xác minh được".
4. **Lỗi nghiêm trọng kéo trần điểm** (xem "Hard Cap"). Một website chặn Google index thì không thể được 8/10 dù mọi thứ khác hoàn hảo.
5. **10/10 gần như không tồn tại.** Chỉ cho ≥ 9.5 khi tổng ≥ 97/100, không có lỗi Critical/High nào và đã xác minh hầu hết tiêu chí.
6. **Đánh giá theo mẫu đại diện, không chỉ trang chủ.** Xem mục "Lấy mẫu".
7. **Làm tròn xuống** (về 0.5 gần nhất, thiên về thấp) khi nằm giữa hai mức.

---

## Quy trình thực hiện

### Bước 0 — Xác định phạm vi
Xác định: URL gốc (canonical domain), loại site (thương mại điện tử / blog–tin tức / doanh nghiệp dịch vụ / SaaS / local business / web đa ngôn ngữ), thị trường & ngôn ngữ mục tiêu (ví dụ Việt Nam, `vi-VN`), từ khóa/chủ đề chính nếu người dùng có cung cấp. Nếu thiếu URL, hỏi lại **một câu duy nhất**; các thông tin còn lại tự suy luận và nêu giả định.

### Bước 1 — Thu thập dữ liệu
Dùng các công cụ sẵn có (`web_fetch`, `curl -sIL`, `bash`, trình duyệt nếu có). Cần lấy:

| Dữ liệu | Cách lấy |
|---|---|
| HTTP status, redirect chain, header | `curl -sIL <url>` (kiểm tra `http→https`, `www↔non-www`, trailing slash) |
| `robots.txt` | `<domain>/robots.txt` |
| Sitemap | `<domain>/sitemap.xml`, hoặc dòng `Sitemap:` trong robots.txt |
| HTML đã render của trang mẫu | `web_fetch` / `curl` |
| Meta robots, X-Robots-Tag | HTML `<head>` và response header |
| Dữ liệu cấu trúc | Tìm `application/ld+json`, microdata |
| Hiệu năng | PageSpeed Insights / Lighthouse nếu truy cập được; nếu không, ước lượng từ kích thước HTML, số request, ảnh, JS (ghi rõ là ước lượng, **không** tính là bằng chứng đầy đủ) |
| Tìm kiếm | `site:domain.com` để ước lượng số trang được index, tìm tên thương hiệu |

Nếu môi trường **không có mạng**, dừng lại và báo người dùng; chỉ chấm được khi họ dán HTML/ảnh chụp/báo cáo, và phải ghi rõ giới hạn.

### Bước 2 — Lấy mẫu trang
Audit tối thiểu **6 trang** (hoặc toàn bộ nếu site nhỏ hơn):
- Trang chủ
- 1 trang danh mục/chuyên mục (hub)
- 2 trang nội dung chính (sản phẩm/dịch vụ/bài viết)
- 1 trang "Giới thiệu" hoặc "Liên hệ"
- 1 trang ngẫu nhiên nằm sâu (≥ 3 cấp) để kiểm tra kiến trúc

Tiêu chí cấp trang (title, meta, H1…) được chấm theo **tỷ lệ trang mẫu đạt**: ≥ 90% = đủ điểm, 70–89% = 60% điểm, 50–69% = 30% điểm, < 50% = 0 điểm.

### Bước 3 — Chấm điểm theo rubric 100 điểm
Chấm từng tiêu chí bên dưới. Mức: **Đạt (100% điểm)**, **Một phần (50%)**, **Không đạt (0%)**, trừ khi tiêu chí ghi thang riêng.

### Bước 4 — Áp dụng Hard Cap, quy đổi /10
`Điểm /10 = (Tổng điểm đã chuẩn hóa / 100) × 10`, sau đó áp dụng trần (Hard Cap) thấp nhất đang kích hoạt.

### Bước 5 — Viết báo cáo theo mẫu ở cuối tài liệu.

---

## RUBRIC 100 ĐIỂM

### A. Thu thập dữ liệu & Lập chỉ mục — Crawlability & Indexability (15 điểm)

| # | Tiêu chí | Điểm | Chuẩn "Đạt" |
|---|---|---|---|
| A1 | Cho phép index trang quan trọng | 4 | Không có `noindex` (meta hoặc X-Robots-Tag) trên trang cần xếp hạng; trang trả về 200 |
| A2 | `robots.txt` hợp lệ | 2 | Tồn tại, không chặn CSS/JS/ảnh cần render, không `Disallow: /` ngoài ý muốn, có khai báo Sitemap |
| A3 | XML Sitemap | 3 | Tồn tại, chỉ chứa URL 200 + canonical + indexable, cập nhật (`lastmod` hợp lý), < 50.000 URL/file; **Một phần** nếu có lỗi/URL chết < 5% |
| A4 | Canonical | 3 | Mỗi trang có `rel=canonical` self-referencing đúng, tuyệt đối (absolute), không trỏ nhầm sang trang khác/redirect/404 |
| A5 | Không lỗi 4xx/5xx trên liên kết nội bộ mẫu | 2 | 0 liên kết nội bộ chết trong mẫu; **Một phần** nếu ≤ 2% |
| A6 | Nội dung quan trọng có trong HTML ban đầu | 1 | Nội dung chính, link, title nằm trong HTML thô hoặc SSR; không phụ thuộc hoàn toàn vào JS client-side |

### B. Kiến trúc site & URL (10 điểm)

| # | Tiêu chí | Điểm | Chuẩn "Đạt" |
|---|---|---|---|
| B1 | URL thân thiện | 3 | Ngắn gọn (< 100 ký tự), chữ thường, dùng dấu gạch ngang, có từ khóa/mô tả, không tham số session/ID thừa. Với tiếng Việt: slug không dấu, dễ đọc |
| B2 | Hợp nhất phiên bản URL | 2 | Chỉ một phiên bản duy nhất trả 200: `http→https`, `www/non-www`, trailing slash, hoa/thường đều **301** về bản chuẩn |
| B3 | Độ sâu click | 2 | Trang quan trọng cách trang chủ ≤ 3 click |
| B4 | Breadcrumb & cấu trúc phân cấp logic | 2 | Có breadcrumb (kèm schema `BreadcrumbList` thì tốt hơn), cấu trúc silo/chủ đề rõ ràng |
| B5 | Điều hướng & phân trang | 1 | Menu dùng thẻ `<a href>` crawl được; phân trang không chặn bot, không dùng "load more" thuần JS làm mất liên kết |

### C. SEO On-page (20 điểm) — chấm theo tỷ lệ trang mẫu đạt

| # | Tiêu chí | Điểm | Chuẩn "Đạt" |
|---|---|---|---|
| C1 | Thẻ Title | 5 | Có, **duy nhất** từng trang, 30–60 ký tự (~580px), chứa từ khóa chính ở gần đầu, đúng search intent, không nhồi nhét, không lặp thương hiệu thừa |
| C2 | Meta description | 3 | Có, duy nhất, 70–160 ký tự, mô tả đúng nội dung, có lời kêu gọi hành động |
| C3 | Thẻ H1 | 4 | Đúng **1 H1**/trang, chứa từ khóa chính/ngữ nghĩa liên quan, khác biệt với title một chút nhưng cùng chủ đề |
| C4 | Cấu trúc Hn | 3 | H2–H3 phân cấp tuần tự, không nhảy cấp, không dùng heading để trang trí/nhồi từ khóa |
| C5 | Tối ưu từ khóa & ngữ nghĩa | 3 | Từ khóa chính xuất hiện tự nhiên ở title, H1, 100 từ đầu; có từ khóa phụ/thực thể liên quan; mật độ không phi tự nhiên (> 3% là dấu hiệu nhồi nhét → trừ) |
| C6 | Tối ưu ảnh | 2 | Ảnh nội dung có `alt` mô tả (không rỗng, không nhồi từ khóa), tên file có nghĩa, định dạng hiện đại (WebP/AVIF), có `width/height`, lazy-load ảnh dưới màn hình đầu |

### D. Chất lượng nội dung & E-E-A-T (15 điểm)

| # | Tiêu chí | Điểm | Chuẩn "Đạt" |
|---|---|---|---|
| D1 | Nội dung hữu ích, đáp ứng search intent | 4 | Trả lời đầy đủ ý định tìm kiếm; sâu hơn mức "trung bình" của đối thủ top; có thông tin gốc/góc nhìn riêng; không chỉ tổng hợp lại |
| D2 | Độ dài & độ đầy đủ phù hợp | 2 | Không thin content (< 300 từ cho trang cần xếp hạng thông tin); độ dài tương xứng độ phức tạp chủ đề, không "độn chữ" |
| D3 | Không trùng lặp | 3 | Không nội dung trùng/gần trùng nội bộ (> 80% tương đồng) hay sao chép từ site khác; không trang doorway/AI spin hàng loạt |
| D4 | Dấu hiệu Kinh nghiệm – Chuyên môn – Thẩm quyền – Tin cậy | 4 | Có tác giả rõ ràng + tiểu sử/chuyên môn, ngày đăng và **ngày cập nhật**, trích dẫn nguồn uy tín, trang Giới thiệu/Liên hệ đầy đủ (địa chỉ, SĐT, email), chính sách bảo mật/điều khoản/đổi trả; với YMYL (sức khỏe, tài chính, pháp lý) yêu cầu cao hơn: chuyên gia thẩm định |
| D5 | Độ mới & bảo trì | 1 | Nội dung chính không lỗi thời; có lịch cập nhật; không thông tin sai lệch |
| D6 | Cấu trúc đọc dễ | 1 | Đoạn ngắn, danh sách, bảng, mục lục (bài dài), không "bức tường chữ" |

### E. Hiệu năng & Core Web Vitals (15 điểm)

Ưu tiên **dữ liệu thực tế (CrUX/field data)**; nếu không có, dùng lab data (Lighthouse) và ghi rõ. Chấm trên **mobile**.

| # | Tiêu chí | Điểm | Đạt (100%) | Một phần (50%) | Không đạt |
|---|---|---|---|---|---|
| E1 | LCP | 4 | ≤ 2,5 s | 2,5–4 s | > 4 s |
| E2 | INP | 4 | ≤ 200 ms | 200–500 ms | > 500 ms |
| E3 | CLS | 3 | ≤ 0,1 | 0,1–0,25 | > 0,25 |
| E4 | TTFB / tốc độ máy chủ | 2 | ≤ 800 ms | 800–1800 ms | > 1800 ms |
| E5 | Tối ưu tài nguyên | 2 | Nén Gzip/Brotli, cache header hợp lý, CSS/JS minify, không render-blocking nặng, tổng trang mobile hợp lý (< ~2 MB), dùng CDN |

### F. Mobile, UX & Bảo mật (8 điểm)

| # | Tiêu chí | Điểm | Chuẩn "Đạt" |
|---|---|---|---|
| F1 | Mobile-friendly | 3 | Có `<meta name="viewport">`, responsive, chữ ≥ 16px, vùng chạm ≥ 48px, không cuộn ngang; nội dung mobile = desktop |
| F2 | HTTPS toàn site | 3 | Chứng chỉ hợp lệ, không mixed content, HSTS (tốt), mọi URL http chuyển 301 sang https |
| F3 | Trải nghiệm người dùng | 1 | Không popup/interstitial che nội dung chính, quảng cáo không gây cản trở, có trang 404 tùy chỉnh trả đúng mã 404 |
| F4 | Khả năng truy cập cơ bản | 1 | Tương phản màu đủ, thuộc tính `lang` đúng trên `<html>`, nhãn form/nút rõ ràng |

### G. Dữ liệu có cấu trúc — Structured Data (7 điểm)

| # | Tiêu chí | Điểm | Chuẩn "Đạt" |
|---|---|---|---|
| G1 | Schema phù hợp loại site | 3 | JSON-LD đúng loại: `Organization`/`LocalBusiness`, `WebSite`, `Article`/`BlogPosting`, `Product`+`Offer`+`AggregateRating`, `FAQPage` (chỉ khi có FAQ hiển thị thật), `BreadcrumbList`... |
| G2 | Hợp lệ & khớp nội dung | 3 | Không lỗi cú pháp (kiểm tra Rich Results Test/Schema validator); dữ liệu khớp nội dung hiển thị; không đánh dấu nội dung ẩn/gian lận |
| G3 | Open Graph / Twitter Card | 1 | Có `og:title`, `og:description`, `og:image`, `og:url` đúng |

### H. Liên kết nội bộ & Điều hướng ngữ cảnh (5 điểm)

| # | Tiêu chí | Điểm | Chuẩn "Đạt" |
|---|---|---|---|
| H1 | Liên kết nội bộ chiến lược | 3 | Mỗi trang trọng tâm có ≥ 3 liên kết nội bộ ngữ cảnh đến/đi, không có trang mồ côi (orphan), trang chủ/hub liên kết tới trang quan trọng |
| H2 | Anchor text | 1 | Anchor mô tả, đa dạng; không dùng "xem thêm", "tại đây" tràn lan; không nhồi anchor khớp chính xác |
| H3 | Liên kết ngoài | 1 | Dẫn tới nguồn uy tín khi cần; link tài trợ/UGC gắn `rel="sponsored"`/`ugc`; không link đến site spam |

### I. Uy tín & Tín hiệu ngoài site — Off-page (5 điểm)

> Chỉ chấm khi có công cụ/bằng chứng (Ahrefs, Semrush, Search Console, tìm kiếm thương hiệu...). Nếu không, đánh dấu `Không xác minh được` và chuẩn hóa điểm (xem mục dưới).

| # | Tiêu chí | Điểm | Chuẩn "Đạt" |
|---|---|---|---|
| I1 | Hồ sơ backlink | 2 | Nhiều tên miền tham chiếu chất lượng, liên quan, đa dạng anchor; không dấu hiệu PBN/mua link spam |
| I2 | Tín hiệu thương hiệu | 2 | Tìm tên thương hiệu ra chính site ở top 1; có hồ sơ Google Business Profile/mạng xã hội/đề cập uy tín |
| I3 | Đánh giá & uy tín công khai | 1 | Đánh giá/nhận xét thật, nhất quán thông tin NAP (Tên – Địa chỉ – SĐT) trên các nền tảng |

**Tổng: 15 + 10 + 20 + 15 + 15 + 8 + 7 + 5 + 5 = 100 điểm.**

---

## HARD CAP — Giới hạn điểm tối đa theo lỗi nghiêm trọng

Nếu nhiều trần cùng kích hoạt, **áp dụng trần thấp nhất**. Phải nêu rõ trần nào đang áp dụng trong báo cáo.

| Mã | Điều kiện | Điểm tối đa |
|---|---|---|
| CAP-1 | Trang chủ/toàn site bị `noindex` hoặc `robots.txt` chặn toàn bộ (`Disallow: /`) ngoài chủ ý | **2.0** |
| CAP-2 | Website không truy cập được/liên tục 5xx, hoặc chuyển hướng lặp vô hạn | **1.0** |
| CAP-3 | Không có HTTPS hoặc chứng chỉ hết hạn/lỗi | **4.0** |
| CAP-4 | Nội dung chính chỉ hiển thị qua JS và bot không thấy được nội dung/liên kết trong HTML ban đầu *và* không có SSR/prerender | **4.5** |
| CAP-5 | Không responsive/không có viewport trên mobile | **5.0** |
| CAP-6 | Dấu hiệu spam nghiêm trọng: nội dung sao chép hàng loạt, cloaking, redirect lừa đảo, ẩn text/link, nội dung AI spin hàng loạt không giá trị | **3.0** |
| CAP-7 | > 30% trang mẫu trùng title hoặc trùng nội dung, hoặc canonical sai hàng loạt | **5.5** |
| CAP-8 | Cả 3 chỉ số LCP, INP, CLS (mobile) đều ở mức "Không đạt" | **6.0** |
| CAP-9 | Có > 10% liên kết nội bộ mẫu bị 404/5xx | **6.0** |
| CAP-10 | Website YMYL nhưng hoàn toàn thiếu tác giả/nguồn/thông tin doanh nghiệp | **6.0** |
| CAP-11 | Không có sitemap **và** nhiều trang quan trọng mồ côi | **7.0** |

Ngoài ra: **không được chấm ≥ 8.0** nếu chưa kiểm tra đủ nhóm A, C, E; **không được chấm ≥ 9.0** nếu có bất kỳ lỗi mức Critical/High còn tồn tại.

---

## Xử lý tiêu chí không xác minh được

1. Đánh dấu `Không xác minh được (KXM)` kèm lý do (ví dụ "không truy cập được PageSpeed").
2. Loại điểm tối đa của tiêu chí đó khỏi mẫu số:
   `Điểm chuẩn hóa = (Điểm đạt được / (100 − Tổng điểm KXM)) × 100`
3. Nếu **KXM > 25 điểm**, bắt buộc ghi: *"Điểm mang tính tham khảo, độ tin cậy thấp"* và khuyến nghị cung cấp quyền Search Console/dữ liệu thêm.
4. Gán **Độ tin cậy** cho điểm cuối: Cao (KXM ≤ 10), Trung bình (11–25), Thấp (> 25).

---

## Phân loại mức độ lỗi

| Mức | Định nghĩa | Ví dụ |
|---|---|---|
| **Critical** | Ngăn site được thu thập/index hoặc gây phạt | noindex nhầm, chặn robots, spam, không HTTPS |
| **High** | Ảnh hưởng lớn đến xếp hạng/quy mô lớn | Title trùng hàng loạt, canonical sai, CWV kém, thin content diện rộng |
| **Medium** | Giảm hiệu quả nhưng không chặn xếp hạng | Thiếu meta description, alt ảnh, schema chưa đủ, anchor kém |
| **Low** | Tối ưu tinh chỉnh | Tên file ảnh, OG tags, tối ưu breadcrumb |

---

## Thang xếp hạng kết quả

| Điểm /10 | Xếp loại | Ý nghĩa |
|---|---|---|
| 9.0 – 10 | Xuất sắc | Chuẩn SEO, chỉ cần tinh chỉnh; cạnh tranh được từ khóa khó |
| 8.0 – 8.9 | Tốt | Chuẩn SEO, còn vài điểm cải thiện |
| 6.5 – 7.9 | Khá / Đạt tối thiểu | Nền tảng ổn nhưng còn lỗi ảnh hưởng hiệu quả |
| 5.0 – 6.4 | Trung bình / **Chưa chuẩn** | Có lỗi quan trọng, cần sửa trước khi đầu tư nội dung/backlink |
| 3.0 – 4.9 | Yếu | Nhiều lỗi nền tảng, khó có tăng trưởng organic |
| < 3.0 | Nghiêm trọng | Site gần như không thể được Google đánh giá tốt |

**Kết luận "Đã chuẩn SEO" chỉ được đưa ra khi điểm ≥ 8.0, không có lỗi Critical và không có lỗi High ở nhóm A, C, E.** Nếu không, kết luận là **"Chưa chuẩn SEO"**.

---

## Mẫu báo cáo đầu ra (bắt buộc dùng cấu trúc này)

```markdown
# Báo cáo đánh giá SEO: <domain>
Ngày đánh giá: <dd/mm/yyyy> | Loại site: <...> | Thị trường/ngôn ngữ: <...>
Số trang mẫu đã kiểm tra: <n> (liệt kê URL)

## 1. Kết luận nhanh
- **Điểm SEO: X.X / 10** — Xếp loại: <...>
- **Kết luận: Đã chuẩn SEO / Chưa chuẩn SEO**
- Độ tin cậy: Cao/Trung bình/Thấp
- Hard Cap đang áp dụng: <mã + lý do> hoặc "Không"
- Tóm tắt 3 dòng: điểm mạnh nhất, điểm yếu nặng nhất, ưu tiên số 1.

## 2. Bảng điểm theo nhóm
| Nhóm | Điểm đạt | Điểm tối đa | % |
|---|---|---|---|
| A. Crawl & Index | | 15 | |
| B. Kiến trúc & URL | | 10 | |
| C. On-page | | 20 | |
| D. Nội dung & E-E-A-T | | 15 | |
| E. Hiệu năng & CWV | | 15 | |
| F. Mobile, UX, Bảo mật | | 8 | |
| G. Structured Data | | 7 | |
| H. Liên kết nội bộ | | 5 | |
| I. Off-page | | 5 | |
| **Tổng** | | **100** | |

## 3. Chi tiết từng tiêu chí
| Mã | Tiêu chí | Kết quả (Đạt/Một phần/Không đạt/KXM) | Điểm | Bằng chứng (URL, giá trị đo, trích HTML) |
|---|---|---|---|---|

## 4. Danh sách lỗi theo mức độ
### Critical
- [Mã] Mô tả lỗi — Trang bị ảnh hưởng — Cách sửa cụ thể
### High / Medium / Low
...

## 5. Lộ trình sửa (ưu tiên theo Tác động ÷ Công sức)
| Ưu tiên | Việc cần làm | Tác động | Công sức | Điểm dự kiến cộng thêm |
|---|---|---|---|---|
| 1 | | Cao | Thấp | +x.x |

## 6. Điểm dự kiến sau khi sửa
- Sau khi sửa nhóm Quick Win (≤ 1 tuần): X.X/10
- Sau khi sửa toàn bộ Critical + High: X.X/10

## 7. Giới hạn của đánh giá
Những gì chưa xác minh được và cách bổ sung (ví dụ: cần quyền Google Search Console).
```

---

## Quy tắc ứng xử của agent khi chấm

- **Trung thực hơn là dễ chịu.** Nếu site yếu, nói thẳng điểm thấp và lý do; không làm mềm kết luận để lấy lòng người dùng.
- **Không hứa hẹn thứ hạng.** Điểm SEO phản ánh mức độ tuân thủ chuẩn và nền tảng kỹ thuật/nội dung, **không đảm bảo** vị trí trên Google; hãy nhắc điều này ở phần Giới hạn.
- **Phân biệt tiêu chí cứng và tiêu chí mềm.** Độ dài title/meta là khuyến nghị, không phải luật; chỉ trừ điểm nặng khi lệch rõ rệt (bị cắt cụt, rỗng, trùng lặp).
- **Không chấm trùng lặp.** Cùng một lỗi gốc chỉ trừ điểm ở **một** tiêu chí phù hợp nhất; ghi chú ảnh hưởng chéo ở phần lỗi.
- **Điều chỉnh theo loại site nhưng không hạ chuẩn.** Ví dụ: site local business cần NAP/GBP/LocalBusiness schema; site thương mại điện tử cần schema Product, xử lý trang lọc/facet bằng canonical/noindex; site đa ngôn ngữ cần `hreflang` đúng cặp hai chiều (nếu thiếu, trừ ở B2/A4 và nêu rõ). Nếu một tiêu chí hoàn toàn không áp dụng, đánh dấu `N/A` và chuẩn hóa như KXM.
- **Với website tiếng Việt:** kiểm tra `lang="vi"`, mã hóa UTF-8, slug không dấu nhất quán, title/H1 có dấu đúng chính tả, và nội dung không dịch máy thô.
- **Tham chiếu nguồn chuẩn:** Google Search Essentials, tài liệu Google Search Central, web.dev (Core Web Vitals), schema.org. Khi chuẩn thay đổi (ví dụ ngưỡng CWV, hỗ trợ rich result), ưu tiên kiểm tra tài liệu mới nhất thay vì dựa trí nhớ.

---

## Checklist tự kiểm trước khi gửi báo cáo

- [ ] Mọi điểm đều có bằng chứng cụ thể?
- [ ] Đã áp dụng đúng Hard Cap thấp nhất?
- [ ] Đã chuẩn hóa điểm khi có tiêu chí KXM/N/A?
- [ ] Tổng điểm các nhóm cộng đúng và quy đổi /10 đúng?
- [ ] Kết luận "chuẩn/chưa chuẩn" khớp với điều kiện đã định nghĩa?
- [ ] Lộ trình sửa sắp theo ưu tiên và có ước lượng điểm cải thiện?
- [ ] Đã nêu rõ giới hạn và độ tin cậy?
