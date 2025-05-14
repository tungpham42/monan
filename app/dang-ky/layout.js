import PublicRoute from "@/context/PublicRoute";

export const metadata = {
  title: "Chia sẻ món ăn - Đăng ký",
  description: "Đăng ký để thêm công thức của bạn!",
  openGraph: {
    title: "Chia sẻ món ăn - Đăng ký",
    description: "Đăng ký để thêm công thức của bạn!",
    type: "website",
    url: "https://monan.io.vn/dang-ký",
    images: [
      {
        url: "https://monan.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RegisterLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <PublicRoute>{children}</PublicRoute>
      </body>
    </html>
  );
}
