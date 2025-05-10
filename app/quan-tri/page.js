"use client";
import React, { useEffect, useState } from "react";
import { db, isAdminUser } from "@/firebase/config";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Card,
  Button,
  Row,
  Col,
  Alert,
  ListGroup,
  Form,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faTrash,
  faTools,
  faCommentSlash,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/Pagination";
import Link from "next/link";

const RecipeCard = ({ recipe, onDeleteRecipe, onDeleteComment, isAdmin }) => {
  // Sort comments by date (newest first)
  const sortedComments = recipe.comments
    ? [...recipe.comments].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      })
    : [];

  return (
    <Col lg={4} md={6} className="mb-4">
      <Card className="d-flex flex-column h-100">
        {recipe.imageUrl && (
          <div
            className="custom-card-img rounded-top"
            style={{ backgroundImage: `url(${recipe.imageUrl})` }}
          ></div>
        )}
        <Card.Body className="d-flex flex-column">
          <Card.Title>
            <Link href={`/cong-thuc/${recipe.slug}`}>{recipe.title}</Link>
          </Card.Title>
          <Card.Text>{recipe.description.slice(0, 100)}...</Card.Text>
          {isAdmin && (
            <div className="mt-auto d-flex justify-content-start gap-3">
              <Button
                as={Link}
                href={`/sua-cong-thuc/${recipe.slug}`}
                variant="warning"
              >
                <FontAwesomeIcon icon={faPencilAlt} className="me-1" /> Chỉnh
                sửa
              </Button>
              <Button
                variant="danger"
                onClick={() => onDeleteRecipe(recipe.id)}
              >
                <FontAwesomeIcon icon={faTrash} className="me-1" /> Xóa
              </Button>
            </div>
          )}
          {sortedComments.length > 0 && isAdmin && (
            <>
              <h6
                className="mt-3 mb-2"
                style={{
                  color: "#495057",
                  fontWeight: "600",
                  borderBottom: "2px solid #e9ecef",
                  paddingBottom: "5px",
                }}
              >
                <FontAwesomeIcon
                  icon={faComments}
                  className="me-2"
                  style={{ color: "#6c757d" }}
                />
                Bình luận
              </h6>
              <ListGroup variant="flush">
                {sortedComments.map((comment) => (
                  <ListGroup.Item
                    key={comment.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>{comment.text.slice(0, 50)}...</span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDeleteComment(recipe.id, comment.id)}
                    >
                      <FontAwesomeIcon icon={faCommentSlash} />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

const useAdminRecipes = (isAdmin) => {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipesAndComments = async () => {
      try {
        const recipeSnapshot = await getDocs(collection(db, "recipes"));
        const recipeDataPromises = recipeSnapshot.docs.map(
          async (recipeDoc) => {
            const recipeId = recipeDoc.id;
            const recipeData = recipeDoc.data();
            const commentsRef = collection(db, "recipes", recipeId, "comments");
            const commentSnapshot = await getDocs(commentsRef);
            const commentsData = commentSnapshot.docs.map((commentDoc) => ({
              id: commentDoc.id,
              ...commentDoc.data(),
            }));
            return { id: recipeId, ...recipeData, comments: commentsData };
          }
        );
        const recipeData = await Promise.all(recipeDataPromises);
        setRecipes(recipeData);
      } catch (err) {
        setError("Không thể tải công thức hoặc bình luận.");
        console.error(err);
      }
    };
    fetchRecipesAndComments();
  }, []);

  const deleteRecipe = async (recipeId) => {
    if (!isAdmin) {
      setError("Hành động không được phép Partial Update");
      return;
    }
    try {
      await deleteDoc(doc(db, "recipes", recipeId));
      setRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe.id !== recipeId)
      );
    } catch (err) {
      setError("Không thể xóa công thức.");
    }
  };

  const deleteComment = async (recipeId, commentId) => {
    if (!isAdmin) {
      setError("Hành động không được phép.");
      return;
    }
    try {
      await deleteDoc(doc(db, "recipes", recipeId, "comments", commentId));
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                comments: recipe.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : recipe
        )
      );
    } catch (err) {
      setError("Không thể xóa bình luận.");
    }
  };

  return { recipes, error, deleteRecipe, deleteComment };
};

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const auth = getAuth();
  const { recipes, error, deleteRecipe, deleteComment } =
    useAdminRecipes(isAdmin);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("alphabetAsc");
  const itemsPerPage = 12;

  // Load sortOption from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSortOption = localStorage.getItem("adminSortOption");
      if (savedSortOption) {
        setSortOption(savedSortOption);
      }
    }
  }, []);

  // Save sortOption to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminSortOption", sortOption);
    }
  }, [sortOption]);

  // Check authentication and admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        router.push("/dang-nhap"); // Redirect to login if not authenticated
      } else {
        const adminStatus = await isAdminUser(user);
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          router.push("/"); // Redirect to homepage if not admin
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  // Render loading state
  if (loading) {
    return <div>Đang tải...</div>;
  }

  // No need to check currentUser or isAdmin again, as redirects are handled in useEffect

  const sortRecipes = (recipesToSort) => {
    let sortedRecipes = [...recipesToSort];
    if (sortOption === "alphabetAsc") {
      sortedRecipes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "alphabetDesc") {
      sortedRecipes.sort((a, b) => b.title.localeCompare(b.title));
    } else if (sortOption === "dateAsc") {
      SortedRecipes.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (sortOption === "dateDesc") {
      sortedRecipes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return sortedRecipes;
  };

  const sortedRecipes = sortRecipes(recipes);
  const indexOfLastRecipe = currentPage * itemsPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - itemsPerPage;
  const currentRecipes = sortedRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FontAwesomeIcon icon={faTools} className="me-2" />
          Bảng quản trị - Quản lý công thức
        </h2>
        <Form.Group className="ms-3" style={{ minWidth: "200px" }}>
          <Form.Select value={sortOption} onChange={handleSortChange}>
            <option disabled value="">
              Sắp xếp theo...
            </option>
            <option value="alphabetAsc">Theo thứ tự chữ cái (A-Z)</option>
            <option value="alphabetDesc">Theo thứ tự chữ cái (Z-A)</option>
            <option value="dateAsc">Ngày (Cũ nhất trước)</option>
            <option value="dateDesc">Ngày (Mới nhất trước)</option>
          </Form.Select>
        </Form.Group>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {currentRecipes.length === 0 ? (
        <Alert variant="info">Không có công thức nào.</Alert>
      ) : (
        <>
          <Row>
            {currentRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDeleteRecipe={deleteRecipe}
                onDeleteComment={deleteComment}
                isAdmin={isAdmin}
              />
            ))}
          </Row>
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={sortedRecipes.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default AdminPanel;
