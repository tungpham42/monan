import { db } from "@/firebase/config"; // Adjust the path to your Firebase config
import { collection, query, where, getDocs } from "firebase/firestore";

export async function generateMetadata({ params }) {
  const { slug } = params; // Get the slug from params

  let title = "Chia sẻ món ăn - Thêm công thức";
  let description = "Thêm công thức món ăn của bạn!";
  let imageUrl = "https://monan.io.vn/1200x630.jpg";

  if (slug) {
    try {
      // Query Firestore to find the recipe by slug
      const q = query(collection(db, "recipes"), where("slug", "==", slug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const recipe = querySnapshot.docs[0].data();
        title = `${recipe.title} - Công thức món ăn`;
        description =
          recipe.description || "Khám phá công thức món ăn tuyệt vời!";
        if (recipe.imageUrl) {
          imageUrl = recipe.imageUrl; // Use recipe image if available
        }
      }
    } catch (error) {
      console.error("Error fetching recipe for metadata:", error);
      // Fallback to default metadata if there's an error
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://monan.io.vn/cong-thuc/${slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default function EditLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
