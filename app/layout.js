import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import BackToTop from "@/components/BackToTop";

export const metadata = {
  title: "Chia sẻ món ăn - Trang chủ",
  description: "Nền tảng chia sẻ công thức nấu ăn.",
  openGraph: {
    title: "Chia sẻ món ăn - Trang chủ",
    description: "Nền tảng chia sẻ công thức nấu ăn.",
    type: "website",
    url: "https://monan.io.vn",
    images: [
      {
        url: "https://monan.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <Header />
          <div className="container my-4">{children}</div>
          <Footer />
        </AuthProvider>
        <BackToTop />
      </body>
      <GoogleAnalytics gaId="G-SNZEK15K5F" />
      <GoogleTagManager gtmId="GTM-WMX4SD65" />
    </html>
  );
}
