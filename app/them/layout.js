export const metadata = {
  title: "Chia sẻ món ăn - Thêm công thức",
  description: "Thêm công thức món ăn của bạn!",
  openGraph: {
    title: "Chia sẻ món ăn - Thêm công thức",
    description: "Thêm công thức món ăn của bạn!",
    type: "website",
    url: "https://monan.io.vn/them",
    images: [
      {
        url: "https://monan.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function AddLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
