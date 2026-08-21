# Đưa **Học Toán Cùng Hana** lên GitHub Pages

Tài liệu này hướng dẫn xuất bản **bản tĩnh** của game bằng GitHub Pages. Phương án phù hợp vì phần trò chơi, câu hỏi, âm thanh, huy hiệu và ảnh kỷ niệm đang chạy trực tiếp trên trình duyệt. GitHub Pages sẽ chỉ phục vụ các tệp HTML, CSS và JavaScript đã dựng; thư mục Express/MySQL của dự án không được chạy trên GitHub Pages.

> Nếu sau này cần đăng nhập, lưu tiến độ chung cho nhiều thiết bị, bảng xếp hạng hoặc dữ liệu phụ huynh, hãy giữ GitHub Pages cho giao diện và dùng một dịch vụ backend riêng. Không đưa khóa API, mật khẩu hay biến môi trường bí mật vào repository công khai.

## A. Xuất game từ Manus sang GitHub trước

GitHub đã được kết nối với tài khoản **`long261vn`**. Cách đơn giản nhất để xuất chính dự án này là dùng giao diện quản lý của Manus, không cần gõ lệnh Git trên máy tính.

1. Mở **Management UI** của dự án bằng nút điều khiển ở góc phải giao diện Manus.
2. Mở **Settings** ở thanh bên trái, sau đó chọn mục **GitHub**.
3. Chọn **Export code to a new repository**.
4. Ở **Owner**, chọn `long261vn`.
5. Ở **Repository name**, nhập `hoc-toan-cung-hana`. Chỉ dùng chữ thường, số và dấu gạch ngang; không để khoảng trắng hoặc dấu tiếng Việt trong tên kỹ thuật này.
6. Chọn **Private** nếu bạn mới sao lưu hoặc chưa muốn công khai mã nguồn. Chọn **Public** nếu muốn người khác có thể xem mã; đây cũng là lựa chọn đơn giản nhất khi dùng GitHub Pages miễn phí.
7. Xác nhận Export. Manus sẽ tạo repository và đẩy snapshot dự án đã chọn lên nhánh chính.
8. Khi export hoàn tất, mở đường dẫn repository GitHub. Kiểm tra có các thư mục `client`, `server`, `scripts` và các file `package.json`, `pnpm-lock.yaml`, `vite.config.ts`.

> Hãy export từ checkpoint đã kiểm thử mới nhất **`ae6d5c73`**, vì checkpoint này đã sửa luồng Điểm hiện tại để mỗi lượt mới bắt đầu với 0 điểm và 0/4 huy hiệu. Nếu giao diện hiển thị nhiều phiên bản, chọn đúng checkpoint này trước khi xuất.

Sau khi repository xuất thành công, tiếp tục theo phần **Cấu hình đường dẫn tài nguyên của Vite** để chuẩn bị GitHub Pages. Không cần chạy các lệnh `git init`, `git remote add` hay `git push` ở phần tạo repository bên dưới nếu bạn đã export bằng giao diện Manus.

| Thành phần | Cấu hình cho dự án này |
|---|---|
| Trình xây dựng giao diện | Vite + React |
| Trình quản lý gói | pnpm 10 |
| Lệnh kiểm tra | `pnpm check` và `pnpm test` |
| Lệnh dựng | `pnpm build` |
| Thư mục cần đưa lên Pages | `dist/public` **không phải** `dist` |
| Nhánh phát hành đề xuất | `main` |

## 1. Tạo repository trên GitHub

1. Đăng nhập GitHub và chọn **New repository**.
2. Đặt tên, ví dụ `hoc-toan-cung-hana`. Chọn **Public** nếu muốn mọi người mở game không cần đăng nhập; chọn **Private** nếu chỉ dùng nội bộ và gói GitHub của bạn hỗ trợ Pages cho repository riêng.
3. Không chọn tạo README, `.gitignore` hay license ngay ở bước này để tránh lịch sử khởi tạo khác với thư mục dự án.
4. Sao chép URL repository, có dạng `https://github.com/TEN-TAI-KHOAN/hoc-toan-cung-hana.git`.

Bạn có thể dùng mục **Settings → GitHub** trong giao diện quản lý dự án để xuất mã nguồn sang GitHub. Hoặc tải ZIP mã nguồn, giải nén trên máy tính rồi dùng Terminal/Git Bash:

```bash
cd duong-dan/toan-lop-3-phi-hanh-tinh
git init
git add .
git commit -m "Publish Học Toán Cùng Hana"
git branch -M main
git remote add origin https://github.com/TEN-TAI-KHOAN/hoc-toan-cung-hana.git
git push -u origin main
```

Nếu GitHub yêu cầu xác thực, dùng GitHub Desktop hoặc đăng nhập qua token cá nhân; không dùng mật khẩu tài khoản GitHub cho lệnh `git push`.

## 2. Cấu hình đường dẫn tài nguyên của Vite

Với repository thông thường, URL game sẽ là:

```text
https://TEN-TAI-KHOAN.github.io/hoc-toan-cung-hana/
```

Do đó Vite phải biết game nằm dưới `/hoc-toan-cung-hana/`, nếu không CSS, JavaScript, phông chữ hoặc ảnh có thể bị lỗi 404 và trang chỉ hiện nền trống. Vite yêu cầu `base` bằng `/<TEN_REPOSITORY>/` cho dạng URL này.[1]

Trong `vite.config.ts`, ngay trước `export default defineConfig`, thêm:

```ts
const githubPagesBase = process.env.VITE_BASE_PATH ?? "/";
```

Sau đó thêm thuộc tính `base` vào trong `defineConfig`:

```ts
export default defineConfig({
  base: githubPagesBase,
  plugins,
  // Giữ nguyên toàn bộ phần cấu hình còn lại.
});
```

Không thay đổi `root`, `publicDir` hoặc `build.outDir` hiện có. Dự án này cố ý xuất giao diện vào `dist/public`, nên workflow bên dưới sẽ tải đúng thư mục này.

### Trường hợp URL đặc biệt

| Loại repository | `VITE_BASE_PATH` trong workflow |
|---|---|
| Repository thường, ví dụ `hoc-toan-cung-hana` | `/${{ github.event.repository.name }}/` |
| Repository cá nhân có tên `TEN-TAI-KHOAN.github.io` | `/` |
| GitHub Pages dùng custom domain | `/` |

## 3. Tạo GitHub Actions để dựng và triển khai tự động

Tạo thư mục `.github/workflows` ở gốc repository. Trong đó tạo file `.github/workflows/deploy-pages.yml` với nội dung sau:

```yaml
name: Deploy Học Toán Cùng Hana to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest

    steps:
      - name: Lấy mã nguồn
        uses: actions/checkout@v4

      - name: Cài pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Cài Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Cài phụ thuộc
        run: pnpm install --frozen-lockfile

      - name: Kiểm tra kiểu dữ liệu và unit test
        run: |
          pnpm check
          pnpm test

      - name: Dựng bản tĩnh cho GitHub Pages
        env:
          VITE_BASE_PATH: /${{ github.event.repository.name }}/
        run: pnpm build

      - name: Chuẩn bị GitHub Pages
        uses: actions/configure-pages@v5

      - name: Đưa giao diện đã dựng lên artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist/public

      - name: Triển khai GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Workflow dùng `pnpm build`, nhưng chỉ xuất `dist/public` lên Pages. Đây là điểm quan trọng: lệnh build hiện tại cũng tạo `dist/index.js` cho server Express, nhưng GitHub Pages không dùng và không cần tệp server đó.

## 4. Bật GitHub Pages trong repository

Sau khi đã push file workflow lên GitHub:

1. Mở repository trên GitHub.
2. Vào **Settings → Pages**.
3. Trong **Build and deployment → Source**, chọn **GitHub Actions**.
4. Vào tab **Actions** và mở workflow “Deploy Học Toán Cùng Hana to GitHub Pages”.
5. Đợi hai bước *Upload artifact* và *Deploy* hoàn tất. GitHub sẽ hiển thị URL chính xác ở phần deployment.

GitHub Pages cần GitHub Actions khi ứng dụng Vite phải trải qua bước build trước khi phát hành.[1] [2]

## 5. Kiểm tra sau khi triển khai

Mở URL Pages bằng cửa sổ ẩn danh và kiểm tra lần lượt:

| Hạng mục | Kết quả đúng |
|---|---|
| Màn chào mừng | Logo, nền không gian, nút Bắt đầu và Cài đặt đều hiển thị |
| Lượt mới | Điểm hiện tại là 0; huy hiệu là 0/4 và tất cả đang khóa |
| Làm bài | Câu hỏi, đáp án, +10/−2 điểm và gợi ý Hana hoạt động |
| Tổng kết | Tên cạnh avatar chỉ hiện một lần; huy hiệu đúng theo lượt vừa học |
| Ảnh kỷ niệm | Nút tải PNG tạo ảnh từ bố cục tổng kết đang hiển thị |
| Điện thoại | Kiểm tra bằng Chrome/Safari thật, không chỉ chế độ thu nhỏ của máy tính |

Nếu trang trắng hoặc file CSS/JS trả về 404, hãy kiểm tra lại giá trị `VITE_BASE_PATH` và chắc chắn tên repository trong workflow trùng tên repository GitHub. Nếu workflow lỗi ở bước cài gói, chạy `pnpm install` ở máy cục bộ để đồng bộ `pnpm-lock.yaml`, commit file lock rồi push lại.

## 6. Cập nhật về sau

Sau cấu hình đầu tiên, quy trình sử dụng rất ngắn:

```bash
git add .
git commit -m "Cập nhật câu hỏi và giao diện"
git push
```

Mỗi lần push vào `main`, GitHub Actions sẽ tự kiểm tra, dựng và phát hành bản mới. Có thể chạy thủ công bằng **Actions → Deploy Học Toán Cùng Hana to GitHub Pages → Run workflow**.

## 7. Giới hạn của GitHub Pages đối với game này

GitHub Pages phù hợp cho bản game độc lập này, nơi phiên học, avatar ảnh cá nhân và một số cài đặt nằm trong trình duyệt. Tuy nhiên, nó không chạy Express, MySQL hay tác vụ máy chủ. Vì vậy không nên dùng Pages đơn lẻ cho bảng xếp hạng chung, tài khoản phụ huynh, dữ liệu tiến độ đa thiết bị, thanh toán hay bí mật API.

> Website đang có bản phát hành được quản lý tại Manus, thuận tiện hơn nếu cần backend, tên miền tùy chỉnh và các dịch vụ máy chủ. GitHub Pages phù hợp nhất khi bạn cần bản game tĩnh, công khai và được cập nhật từ repository.

## 8. Giá trị chính xác cho repository đã export

Repository hiện tại là [`long261vn/hoc-toan-cung-hana`](https://github.com/long261vn/hoc-toan-cung-hana). Vì đây là repository thông thường (không phải `long261vn.github.io`), hãy dùng đúng các giá trị sau:

| Mục cần nhập | Giá trị |
|---|---|
| Repository | `https://github.com/long261vn/hoc-toan-cung-hana` |
| `VITE_BASE_PATH` trong workflow | `/hoc-toan-cung-hana/` |
| Artifact Pages | `./dist/public` |
| URL dự kiến sau khi deploy | `https://long261vn.github.io/hoc-toan-cung-hana/` |

Lưu ý: GitHub Actions trong workflow mẫu đã tự tạo `VITE_BASE_PATH` từ tên repository. Vì vậy bạn không cần tự sửa giá trị này nếu giữ nguyên file workflow mẫu.

## References

[1] [Vite — Deploying a Static Site: GitHub Pages](https://vite.dev/guide/static-deploy)

[2] [GitHub Docs — Configuring a publishing source for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
