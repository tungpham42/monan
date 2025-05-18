"use client";
import React, { useState, useEffect } from "react";
import { Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import RecipeList from "@/components/RecipeList";
import { Spinner } from "react-bootstrap";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  // Fetch recipes server-side
  useEffect(() => {
    const fetchRecipes = async () => {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const recipeData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipeData);
    };
    fetchRecipes();
  }, []);

  return (
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
  );
}
