import { db } from "@/firebase/config"; // Adjust path to your Firebase config
import { collection, query, where, getDocs } from "firebase/firestore";

export async function generateMetadata({ params }) {
  const { slug } = params || {};
  if (!slug) {
    return {
      title: "Nền tảng chia sẻ công thức nấu ăn",
      description: "Khám phá và chia sẻ các công thức nấu ăn ngon!",
      openGraph: {
        title: "Nền tảng chia sẻ công thức nấu ăn",
        description: "Khám phá và chia sẻ các công thức nấu ăn ngon!",
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
  }

  try {
    const recipeQuery = query(
      collection(db, "recipes"),
      where("slug", "==", slug)
    );
    const recipeSnapshot = await getDocs(recipeQuery);
    if (recipeSnapshot.empty) {
      return {
        title: "Không tìm thấy công thức - Nền tảng chia sẻ công thức nấu ăn",
        description: "Công thức không tồn tại hoặc đã bị xóa.",
        openGraph: {
          title: "Không tìm thấy công thức - Nền tảng chia sẻ công thức nấu ăn",
          description: "Công thức không tồn tại hoặc đã bị xóa.",
          type: "website",
          url: `https://monan.io.vn/cong-thuc/${slug}`,
          images: [
            {
              url: "https://monan.io.vn/1200x630.jpg",
              width: 1200,
              height: 630,
            },
          ],
        },
      };
    }

    const recipeData = recipeSnapshot.docs[0].data();
    return {
      title: `${recipeData.title} - Nền tảng chia sẻ công thức nấu ăn`,
      description: "Khám phá công thức nấu ăn ngon tại monan.io.vn!",
      openGraph: {
        title: `${recipeData.title} - Nền tảng chia sẻ công thức nấu ăn`,
        description: "Khám phá công thức nấu ăn ngon tại monan.io.vn!",
        type: "website",
        url: `https://monan.io.vn/cong-thuc/${slug}`,
        images: recipeData.imageUrl
          ? [
              {
                url: recipeData.imageUrl,
                width: 1200,
                height: 630,
              },
            ]
          : [
              {
                url: "https://monan.io.vn/1200x630.jpg",
                width: 1200,
                height: 630,
              },
            ],
      },
    };
  } catch (err) {
    console.error("Error generating metadata:", err);
    return {
      title: "Lỗi - Nền tảng chia sẻ công thức nấu ăn",
      description: "Lỗi khi tải công thức.",
      openGraph: {
        title: "Lỗi - Nền tảng chia sẻ công thức nấu ăn",
        description: "Lỗi khi tải công thức.",
        type: "website",
        url: `https://monan.io.vn/cong-thuc/${slug}`,
        images: [
          {
            url: "https://monan.io.vn/1200x630.jpg",
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  }
}

export default function RecipeLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
