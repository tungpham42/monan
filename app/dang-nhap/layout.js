export const metadata = {
  title: "Chia sẻ món ăn - Đăng nhập",
  description: "Đăng nhập để xem công thức của bạn!",
  openGraph: {
    title: "Chia sẻ món ăn - Đăng nhập",
    description: "Đăng nhập để xem công thức của bạn!",
    type: "website",
    url: "https://monan.io.vn/dang-nhap",
    images: [
      {
        url: "https://monan.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function LoginLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
