export const metadata = {
  title: "Chia sẻ món ăn - Quản trị",
  description: "Quản trị!",
  openGraph: {
    title: "Chia sẻ món ăn - Quản trị",
    description: "Quản trị!",
    type: "website",
    url: "https://monan.io.vn/quan-tri",
    images: [
      {
        url: "https://monan.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function AdminLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
