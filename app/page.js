import { Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import RecipeList from "@/components/RecipeList";
import { Spinner, Container } from "react-bootstrap";

export default async function Home() {
  // Fetch recipes server-side
  const querySnapshot = await getDocs(collection(db, "recipes"));
  const recipes = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <Container>
      <Suspense
        fallback={
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </Spinner>
          </div>
        }
      >
        <RecipeList recipes={recipes} />
      </Suspense>
    </Container>
  );
}
