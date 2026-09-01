# TASK: Interactive 3D Product Preview on Hover

Tôi muốn phát triển **một chức năng UI/UX mới cho website ecommerce hiện tại**.

## ⚠️ QUY TẮC QUAN TRỌNG – KHÔNG ĐƯỢC PHÁ VỠ PROJECT HIỆN TẠI

Dự án hiện tại đang hoạt động ổn định. **KHÔNG được tự ý thay đổi hoặc tái cấu trúc kiến trúc hiện tại của project.**

Phạm vi công việc CHỈ bao gồm:

* UI/UX
* Product interaction
* 3D product preview
* Animation
* Mouse interaction
* Three.js
* GSAP

**KHÔNG được:**

* Refactor toàn bộ project.
* Thay đổi cấu trúc thư mục hiện tại nếu không thực sự cần thiết.
* Thay đổi framework hiện tại.
* Thay đổi routing.
* Thay đổi database.
* Thay đổi schema.
* Thay đổi API/backend.
* Thay đổi authentication.
* Thay đổi logic ecommerce hiện tại.
* Thay đổi product data model hiện tại.
* Thay đổi chức năng cart, checkout, payment hoặc order.
* Thay đổi các component không liên quan.
* Xóa hoặc thay thế code hiện tại chỉ vì muốn viết theo cách khác.
* Cài đặt thêm package nếu Three.js/GSAP hoặc dependency tương đương đã tồn tại mà không kiểm tra trước.
* Push code lên GitHub.
* Tạo commit Git.
* Deploy lên Vercel hoặc bất kỳ platform nào.

**Chỉ làm việc và test trên local.**

---

# 1. MỤC TIÊU

Khi người dùng di chuyển chuột vào một product card trên website ecommerce:

1. Product card vẫn giữ nguyên giao diện hiện tại.
2. Hệ thống nhận biết product đang được hover.
3. Một khu vực preview 3D xuất hiện một cách mượt mà.
4. Hiển thị **mô hình 3D tương ứng với sản phẩm**.
5. Người dùng có thể tương tác với mô hình 3D bằng chuột:

   * Xoay sản phẩm.
   * Drag để thay đổi góc nhìn.
   * Có thể zoom nếu phù hợp với UX.
6. Khi người dùng đưa chuột ra khỏi product:

   * Animation chuyển về trạng thái ban đầu.
   * 3D preview biến mất một cách mượt mà.
7. Animation phải có cảm giác premium, hiện đại và phù hợp với ecommerce website.

Mục tiêu là tạo cảm giác:

> "Hover vào sản phẩm → sản phẩm thực sự xuất hiện dưới dạng 3D → người dùng có thể khám phá sản phẩm trước khi click vào trang detail."

---

# 2. TECHNOLOGY

Sử dụng:

### Three.js

Dùng Three.js để:

* Render 3D model.
* Scene.
* Camera.
* Renderer.
* Lighting.
* Model loading.
* Orbit/drag interaction.
* Animation/render loop.

### GSAP

Dùng GSAP cho:

* Hover transition.
* Fade in/out.
* Scale.
* Position.
* Opacity.
* Smooth transition giữa các trạng thái.
* Transition khi chuyển từ product này sang product khác.
* Các micro-interactions cần thiết.

Không dùng animation thủ công nếu GSAP có thể xử lý tốt hơn.

---

# 3. PRODUCT CARD HOVER

Tích hợp chức năng vào **product card hiện tại**.

Không được thiết kế lại product card nếu không cần thiết.

Khi:

```text
Mouse enter product card
        ↓
Identify product
        ↓
Load corresponding 3D model
        ↓
GSAP transition
        ↓
Display 3D model
        ↓
User can rotate model
```

Khi:

```text
Mouse leave
        ↓
GSAP exit animation
        ↓
Hide / remove 3D preview
```

---

# 4. 3D MODEL MAPPING

Mỗi product cần có khả năng xác định model 3D tương ứng.

Thiết kế cơ chế mapping đơn giản, dễ mở rộng.

Ví dụ concept:

```text
Product A → product-a.glb
Product B → product-b.glb
Product C → product-c.glb
```

Có thể sử dụng:

* product ID
* slug
* hoặc một field/property phù hợp với data hiện tại.

**Ưu tiên tận dụng product data hiện tại thay vì thay đổi database/schema.**

Nếu product hiện tại chưa có thông tin về 3D model:

* Tạo một cơ chế mapping phía frontend/local để demo.
* Không yêu cầu thay đổi database.
* Không yêu cầu backend.

Ví dụ:

```js
const product3DModels = {
  "product-1": "/models/product-1.glb",
  "product-2": "/models/product-2.glb",
};
```

Chỉ sử dụng đây như một ví dụ. Hãy adapt theo cấu trúc project hiện tại.

---

# 5. MODEL FORMAT

Ưu tiên sử dụng:

```text
.glb
.glTF
```

Three.js nên sử dụng loader phù hợp để load model.

Model cần:

* Giữ đúng tỷ lệ.
* Center đúng vị trí.
* Có lighting phù hợp.
* Có camera phù hợp.
* Không bị clipping.
* Không bị quá nhỏ hoặc quá lớn.
* Có shadow nếu phù hợp.
* Có background/environment phù hợp với UI hiện tại.

---

# 6. 3D INTERACTION

Người dùng phải có thể tương tác với model.

### Rotation

Cho phép:

```text
Click + drag
```

để xoay sản phẩm.

Interaction phải mượt.

Không để model xoay quá nhanh.

Có thể giới hạn:

* Rotation speed.
* Vertical rotation.
* Horizontal rotation.

để tránh trải nghiệm khó chịu.

### Zoom

Nếu phù hợp:

```text
Mouse wheel
```

cho phép zoom nhẹ vào/ra.

Không cho zoom quá mức.

Camera phải có:

```text
minDistance
maxDistance
```

hoặc cơ chế tương đương.

---

# 7. CAMERA

Camera cần được tự động điều chỉnh dựa trên kích thước model.

Không hard-code một camera position duy nhất nếu các model có kích thước khác nhau.

Mục tiêu:

```text
Model nhỏ
→ tự động zoom vào

Model lớn
→ tự động zoom out
```

Sản phẩm phải luôn nằm trong vùng nhìn hợp lý.

Có thể sử dụng bounding box của model để:

* Calculate center.
* Calculate size.
* Calculate camera distance.
* Re-center model.

---

# 8. LIGHTING

Thiết lập lighting đẹp cho ecommerce product preview.

Ưu tiên:

* Soft lighting.
* Key light.
* Fill light.
* Rim light nếu cần.
* Ambient/environment lighting.

Mục tiêu:

> Sản phẩm phải nhìn rõ chất liệu, hình khối và silhouette.

Không sử dụng lighting quá mạnh khiến model bị cháy sáng.

Nếu model có metallic/roughness material thì lighting phải giúp thể hiện material tốt.

---

# 9. BACKGROUND

3D preview cần hòa hợp với website hiện tại.

Không tự ý đổi theme toàn website.

Có thể sử dụng:

* Transparent background.
* Background hiện tại của product card.
* Một gradient rất nhẹ nếu phù hợp.

Ưu tiên **transparent canvas** để 3D model hòa vào UI hiện tại.

---

# 10. GSAP ANIMATION

Animation cần có cảm giác premium.

Ví dụ khi hover:

```text
Product hover
      ↓
3D canvas fade in
      ↓
Model scale: 0.85 → 1
      ↓
Opacity: 0 → 1
      ↓
Small upward movement
      ↓
Interactive state
```

Khi mouse leave:

```text
Model scale: 1 → 0.9
Opacity: 1 → 0
      ↓
Remove / hide preview
```

Animation không được quá chậm.

Ưu tiên cảm giác:

* Smooth
* Premium
* Responsive
* Natural

Có thể sử dụng easing phù hợp của GSAP.

---

# 11. SWITCH GIỮA CÁC PRODUCT

Đặc biệt xử lý trường hợp người dùng di chuyển chuột nhanh:

```text
Product A
    ↓
Product B
    ↓
Product C
```

Không được để:

* Model A vẫn render.
* Model B chồng lên model A.
* Memory leak.
* Nhiều canvas cùng tồn tại.
* Animation bị giật.

Khi chuyển product:

```text
Current model
      ↓
Smooth transition
      ↓
Dispose / hide old model
      ↓
Load new model
      ↓
Display new model
```

Nếu model đã được load trước đó thì **ưu tiên sử dụng cache** thay vì load lại.

---

# 12. PERFORMANCE

Đây là phần rất quan trọng.

Website ecommerce có thể có rất nhiều product card.

Không được:

```text
20 products
→ 20 Three.js scenes
→ 20 WebGL render loops
```

Thay vào đó, ưu tiên:

```text
Multiple Product Cards
        ↓
Only hovered product
        ↓
One active 3D viewer
```

Chỉ render 3D khi cần.

Khi mouse leave:

* Stop unnecessary rendering nếu có thể.
* Dispose resources khi không còn sử dụng.
* Dispose geometry.
* Dispose material.
* Dispose textures.
* Dispose renderer nếu lifecycle yêu cầu.

Tránh:

* Memory leak.
* CPU usage cao.
* GPU usage không cần thiết.

---

# 13. LOADING STATE

Nếu model mất thời gian để load:

Hiển thị loading state đẹp.

Ví dụ:

```text
Loading 3D...
```

hoặc một loading indicator tối giản.

Không để product card bị đứng hoặc UI bị freeze.

Nếu model load lỗi:

```text
3D preview unavailable
```

hoặc fallback về product image hiện tại.

**3D preview không được làm hỏng product card.**

---

# 14. FALLBACK

Nếu product không có 3D model:

```text
Product hover
→ Không có 3D model
→ Giữ nguyên UI hiện tại
```

Không được throw error làm hỏng trang.

Có thể giữ lại:

* Product image.
* Existing hover animation.

---

# 15. RESPONSIVE

Desktop:

```text
Mouse hover
→ 3D preview
```

Mobile/tablet:

Không có hover thực sự.

Do đó không được ép mobile sử dụng hover interaction.

Có thể:

* Giữ UI hiện tại.
* Hoặc chỉ kích hoạt 3D khi người dùng tap nếu implementation phù hợp.

Nhưng **ưu tiên desktop-first cho chức năng này**.

Không làm ảnh hưởng responsive layout hiện tại.

---

# 16. UX REQUIREMENTS

3D preview phải:

* Không che mất product information quan trọng.
* Không che nút Add to Cart nếu không cần thiết.
* Không gây layout shift.
* Không làm product card thay đổi kích thước đột ngột.
* Không khiến người dùng mất vị trí hover.
* Không tạo cảm giác lag.
* Không làm ảnh hưởng click vào product detail.

Đặc biệt:

> Người dùng vẫn có thể click product card để mở trang product detail bình thường.

3D viewer không được intercept click nếu không cần thiết.

---

# 17. VISUAL DIRECTION

Phong cách:

**Modern / Premium Ecommerce / Minimal / Interactive**

Ưu tiên:

* Smooth animation.
* Subtle motion.
* Clean UI.
* High-end product presentation.
* Không quá nhiều hiệu ứng.
* Không làm giao diện trở nên "game-like".

3D model phải là **trung tâm của interaction**, nhưng không được phá vỡ design system hiện tại.

---

# 18. EXISTING PROJECT CONSTRAINT

Trước khi code:

1. Kiểm tra project hiện tại.
2. Xác định framework đang sử dụng.
3. Xác định product card component hiện tại.
4. Xác định product data structure hiện tại.
5. Xác định styling system hiện tại.
6. Kiểm tra Three.js đã được cài chưa.
7. Kiểm tra GSAP đã được cài chưa.
8. Kiểm tra cách project hiện tại quản lý assets.

Sau đó mới triển khai.

**Không được tự ý tạo lại architecture.**

Nếu cần tạo component mới, hãy đặt nó ở vị trí phù hợp với architecture hiện tại.

Ví dụ concept:

```text
Existing ProductCard
        │
        └── 3D Product Preview
                │
                ├── Three.js Scene
                ├── Model Loader
                ├── Camera
                ├── Lighting
                └── Interaction
```

Nhưng **hãy adapt theo project hiện tại**, không bắt buộc phải tạo đúng cấu trúc trên.

---

# 19. LOCAL DEVELOPMENT ONLY

Sau khi implementation:

Chỉ chạy:

```text
npm run dev
```

hoặc command tương ứng với project hiện tại.

Test trực tiếp trên localhost.

**KHÔNG:**

* git add
* git commit
* git push
* deploy
* modify GitHub repository

Tôi sẽ tự kiểm tra và quyết định có push GitHub hay không.

---

# 20. TESTING CHECKLIST

Hãy tự kiểm tra các trường hợp sau:

### Basic

* [ ] Hover product → 3D xuất hiện.
* [ ] Mouse leave → 3D biến mất.
* [ ] Animation mượt.
* [ ] Model đúng product.

### Interaction

* [ ] Drag → xoay model.
* [ ] Wheel → zoom nếu được implement.
* [ ] Rotation mượt.
* [ ] Không xoay quá nhanh.

### Multiple products

* [ ] Hover A → model A.
* [ ] Move A → B → model B.
* [ ] Move nhanh qua nhiều product → không glitch.
* [ ] Không có nhiều canvas/render loop dư thừa.

### Error handling

* [ ] Product không có model → fallback.
* [ ] Model lỗi → fallback.
* [ ] Model loading lâu → loading state.

### UI

* [ ] Không layout shift.
* [ ] Không phá product card.
* [ ] Không phá Add to Cart.
* [ ] Không phá click product.
* [ ] Không phá responsive layout.

### Performance

* [ ] Không tạo hàng loạt WebGL instances.
* [ ] Không memory leak rõ ràng.
* [ ] Không CPU/GPU usage bất thường khi không hover.
* [ ] Không render 3D khi không cần thiết.

---

# 21. IMPLEMENTATION PRINCIPLE

Hãy coi đây là một **incremental UI/UX enhancement** cho project hiện tại.

Nguyên tắc:

```text
Existing Project
      ↓
Preserve Everything
      ↓
Add 3D Interaction
      ↓
Minimal Changes
      ↓
Test Locally
```

Không phải:

```text
Existing Project
      ↓
Rewrite Architecture
      ↓
Refactor Everything
      ↓
Add 3D
```

Nếu có nhiều cách triển khai, hãy chọn cách **ít ảnh hưởng nhất đến code hiện tại**.

---

# 22. EXPECTED RESULT

Sau khi hoàn thành, tôi muốn có trải nghiệm tương tự:

```text
┌───────────────────────────────┐
│                               │
│       PRODUCT IMAGE           │
│                               │
│          ↓ HOVER              │
│                               │
│       ┌─────────────┐         │
│       │             │         │
│       │   3D MODEL  │         │
│       │      ↻      │         │
│       │             │         │
│       └─────────────┘         │
│                               │
│  Product Name                 │
│  $99.00                       │
│                               │
└───────────────────────────────┘

Mouse drag
      ↓
Rotate 3D product

Mouse wheel
      ↓
Zoom

Mouse leave
      ↓
Smooth GSAP exit
```

Cuối cùng, hãy báo cáo ngắn gọn:

1. Những file nào đã được thêm/chỉnh sửa.
2. Cách 3D model được mapping với product.
3. Three.js được sử dụng như thế nào.
4. GSAP được sử dụng như thế nào.
5. Cách xử lý performance.
6. Cách chạy local.
7. Những file/model `.glb` nào tôi cần cung cấp để test.

**Không push GitHub và không deploy.**
