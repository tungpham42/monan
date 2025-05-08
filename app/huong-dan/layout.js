export const metadata = {
  title: "Chia sẻ món ăn - Huớng dẫn",
  description: "Huớng dẫn sử dụng.",
  openGraph: {
    title: "Chia sẻ món ăn - Huớng dẫn",
    description: "Huớng dẫn sử dụng.",
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

export default function InstructionsLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
