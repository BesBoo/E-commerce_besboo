# BesBoo E-Commerce Platform

![BesBoo Banner](./client/images/hero-collection.png)

> **BesBoo** là một nền tảng web thương mại điện tử hiện đại, mang phong cách thiết kế tối giản (minimalism) lấy cảm hứng từ ngôn ngữ thiết kế của Apple. Dự án được xây dựng với mục tiêu mang lại trải nghiệm mua sắm mượt mà, trực quan, tập trung tối đa vào nguyên lý UI/UX và hành trình người dùng.

🔗 **[Trải nghiệm Live Demo tại đây](https://besboo.github.io/E-commerce_besboo/)**

---

## 🎨 Triết lý Thiết kế UI/UX

- **Minimalist & Clean:** Sử dụng không gian trắng (white space) hợp lý, bảng màu trung tính tinh tế và typography hiện đại để hướng sự chú ý của người dùng hoàn toàn vào sản phẩm.
- **Micro-Interactions (Vi tương tác):** Hiệu ứng hover mượt mà, thông báo dạng Toast, và các chuyển động (transitions) tinh tế cung cấp phản hồi tức thì cho người dùng mà không gây rối mắt.
- **Responsive Architecture:** Giao diện tương thích hoàn hảo và tự động tối ưu hiển thị trên mọi thiết bị (Mobile, Tablet, Desktop).
- **Intuitive Navigation:** Trải nghiệm tìm kiếm được tối ưu với bộ lọc (Filter) động, sắp xếp (Sorting) trực quan và thanh điều hướng Breadcrumb giúp giảm tải nhận thức (cognitive load).

## 🚀 Tính năng Nổi bật

- **Khám phá Sản phẩm (Product Listing):** Lọc sản phẩm nâng cao theo danh mục, giá cả, màu sắc, kích thước và phân trang.
- **Chi tiết Sản phẩm (Product Detail):** Hiển thị đầy đủ thông số, bộ sưu tập ảnh (thumbnail gallery), và hệ thống đánh giá/review động.
- **Giỏ hàng & Yêu thích (Cart & Wishlist):** Quản lý giỏ hàng và danh sách yêu thích hoạt động hoàn chỉnh ngay trên client.
- **Kiến trúc Mock API:** Tích hợp hệ thống Mock API mô phỏng (`product-data.js` & `api.js`) giúp Prototype hoạt động mượt mà với dữ liệu thật mà không cần phụ thuộc vào Backend.

---

## 🛠️ Công nghệ Sử dụng

- **Frontend:** Vanilla HTML5, CSS3 (Xây dựng Design System & Tokens riêng biệt), JavaScript (ES6+)
- **Kiến trúc mã nguồn:** Thiết kế theo hướng Component (`components.js`) để dễ dàng tái sử dụng UI.
- **Quản lý dữ liệu:** Trạng thái Client-side & LocalStorage
- **Icons & Assets:** FontAwesome 6, Unsplash Images

---

## 📁 Cấu trúc Thư mục

```text
BesBoo/
├── client/                 # Mã nguồn Frontend
│   ├── css/                # CSS (Design Tokens, Base, Components)
│   ├── js/                 # Javascript (API, Components, Core Logic)
│   ├── images/             # Hình ảnh tĩnh
│   ├── index.html          # Trang chủ (Homepage)
│   ├── product.html        # Trang danh sách sản phẩm (PLP)
│   ├── product-detail.html # Trang chi tiết sản phẩm (PDP)
│   ├── cart.html           # Giỏ hàng
│   └── checkout.html       # Luồng Thanh toán
└── index.html              # File điều hướng (Redirect) cho GitHub Pages
```

---

## 💻 Hướng dẫn Cài đặt Local

Để chạy dự án này trên máy tính của bạn:

1. Clone repository về máy:
   ```bash
   git clone https://github.com/BesBoo/E-commerce_besboo.git
   ```
2. Mở thư mục dự án bằng Code Editor (ví dụ: VS Code).
3. Sử dụng extension **Live Server** để chạy dự án trực tiếp từ thư mục gốc.

---

## ✍️ Tác giả

Được thiết kế và phát triển bởi **[Tên của bạn]** 
*Dự án Portfolio ứng tuyển vị trí UI/UX Designer & Frontend Developer.*
