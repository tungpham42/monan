export const metadata = {
  title: "Privacy Policy",
  description: "Recipe sharing privacy policy.",
  openGraph: {
    title: "Privacy Policy",
    description: "Recipe sharing privacy policy.",
    type: "website",
    url: "https://monan.io.vn/privacy-policy",
    images: [
      {
        url: "https://monan.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function PrivacyLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
