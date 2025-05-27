export const metadata = {
  title: "Chia sẻ món ăn - Gợi ý",
  description: "Gợi ý món ăn theo tuần.",
  openGraph: {
    title: "Chia sẻ món ăn - Gợi ý",
    description: "Gợi ý món ăn theo tuần.",
    type: "website",
    url: "https://monan.io.vn/huong-dan",
    images: [
      {
        url: "https://monan.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function SuggestionsLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
