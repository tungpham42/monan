export const metadata = {
  title: "Chia sẻ món ăn - Hồ sơ",
  description: "Hồ sơ của bạn!",
  openGraph: {
    title: "Chia sẻ món ăn - Hồ sơ",
    description: "Hồ sơ của bạn!",
    type: "website",
    url: "https://monan.io.vn/ho-so",
    images: [
      {
        url: "https://monan.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function ProfileLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
