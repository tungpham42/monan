"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/firebase/config"; // Adjust path to your Firebase config
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { useParams } from "next/navigation";
import {
  Card,
  ListGroup,
  Form,
  Button,
  ListGroupItem,
  Alert,
  Row,
  Col,
  Spinner,
  Image,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faComment,
  faList,
  faRoute,
  faUtensils,
  faEye,
  faChevronLeft,
  faChevronRight,
  faTag,
  faUser,
  faShareAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faYoutube,
  faFacebook,
  faXTwitter,
  faPinterest,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

const RecipeDetail = () => {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [authorName, setAuthorName] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth(); // Initialize Firebase Auth
  const currentUser = auth.currentUser; // Get current user directly
  const itemsPerPage = 3;

  const fetchComments = async (recipeId) => {
    try {
      const commentsRef = collection(db, "recipes", recipeId, "comments");
      const commentsSnapshot = await getDocs(commentsRef);
      const commentsData = commentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return commentsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (err) {
      console.error("Error fetching comments:", err);
      return [];
    }
  };

  const fetchAuthorName = async (userId) => {
    if (!userId) return "Tác giả không xác định";

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return "Tác giả không xác định";
      }

      const userData = userSnap.data();
      return (
        userData.username || userData.displayName || "Tác giả không xác định"
      );
    } catch (err) {
      console.error("Error fetching author name:", err.message);
      return "Tác giả không xác định";
    }
  };

  useEffect(() => {
    const fetchRecipeBySlug = async (slug) => {
      const recipeQuery = query(
        collection(db, "recipes"),
        where("slug", "==", slug)
      );
      const recipeSnapshot = await getDocs(recipeQuery);
      return recipeSnapshot.empty
        ? null
        : { id: recipeSnapshot.docs[0].id, ...recipeSnapshot.docs[0].data() };
    };

    const fetchRelatedRecipes = async (recipe) => {
      if (!recipe?.category) return [];
      const relatedQuery = query(
        collection(db, "recipes"),
        where("category", "==", recipe.category),
        where("slug", "!=", slug)
      );
      const relatedSnapshot = await getDocs(relatedQuery);
      return relatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const recipeData = await fetchRecipeBySlug(slug);
        if (!recipeData) {
          setError("Không tìm thấy công thức.");
          setRecipe(null);
          setAuthorName("");
          setComments([]);
          setRelatedRecipes([]);
          return;
        }

        setRecipe(recipeData);
        const [commentData, relatedData, author] = await Promise.all([
          fetchComments(recipeData.id),
          fetchRelatedRecipes(recipeData),
          fetchAuthorName(recipeData.userId),
        ]);

        setComments(commentData);
        setRelatedRecipes(relatedData);
        setAuthorName(author);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Lỗi khi tải công thức. Vui lòng thử lại.");
        setRecipe(null);
        setAuthorName("");
        setComments([]);
        setRelatedRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !recipe || !newComment.trim()) return;

    try {
      const commentsRef = collection(db, "recipes", recipe.id, "comments");
      const newCommentData = {
        text: newComment,
        userId: currentUser.uid,
        username: currentUser.displayName || "Người dùng ẩn danh",
        createdAt: new Date().toISOString(),
      };

      await addDoc(commentsRef, newCommentData);
      setNewComment("");
      const updatedComments = await fetchComments(recipe.id);
      setComments(updatedComments);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoIdMatch =
      url.match(/(?:v=)([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    return videoIdMatch
      ? `https://www.youtube.com/embed/${videoIdMatch[1]}`
      : null;
  };

  const totalPages = Math.ceil(relatedRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRelatedRecipes = relatedRecipes.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Generate share URL
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = recipe?.title || "Check out this recipe!";

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <Alert variant="warning">{error}</Alert>
      </div>
    );
  }

  const isOwner = currentUser && recipe.userId === currentUser.uid;

  return (
    <div>
      <Card className="p-4 mb-4">
        {recipe.imageUrl && (
          <div
            className="custom-card-img rounded-top"
            style={{ backgroundImage: `url(${recipe.imageUrl})` }}
          ></div>
        )}
        <Card.Body>
          <Card.Title className="mb-3 display-6">{recipe.title}</Card.Title>
          <Card.Text className="mb-2">{recipe.description}</Card.Text>
          {/* Share Buttons */}
          <div className="mb-4">
            <h5>
              <FontAwesomeIcon icon={faShareAlt} className="me-2" />
              Chia sẻ công thức
            </h5>
            <div className="d-flex gap-2">
              <Button
                className="btn-facebook"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </Button>
              <Button
                className="btn-x"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
              >
                <FontAwesomeIcon icon={faXTwitter} />
              </Button>
              <Button
                className="btn-linkedin"
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  shareUrl
                )}&title=${encodeURIComponent(
                  shareTitle
                )}&summary=${encodeURIComponent(
                  recipe.description || shareTitle
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </Button>
              <Button
                className="btn-pinterest"
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
                  shareUrl
                )}&media=${encodeURIComponent(
                  recipe.imageUrl || ""
                )}&description=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
              >
                <FontAwesomeIcon icon={faPinterest} />
              </Button>
            </div>
          </div>
          <h5 className="mb-3 text-primary">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Tác giả: <strong>{authorName}</strong>
          </h5>
          {recipe.category && (
            <h6 className="mb W-4 recipe-category">
              <FontAwesomeIcon icon={faTag} className="me-2" />
              <span style={{ fontStyle: "italic", fontWeight: "500" }}>
                {recipe.category === "Breakfast"
                  ? "Bữa sáng"
                  : recipe.category === "Lunch"
                  ? "Bữa trưa"
                  : recipe.category === "Dinner"
                  ? "Bữa tối"
                  : recipe.category === "Dessert"
                  ? "Tráng miệng"
                  : recipe.category}
              </span>
            </h6>
          )}
          {recipe.youtubeUrl && (
            <div className="mb-4">
              <h5>
                <FontAwesomeIcon icon={faYoutube} className="me-2" />
                Video hướng dẫn
              </h5>
              <div className="ratio ratio-16x9">
                <iframe
                  src={getYoutubeEmbedUrl(recipe.youtubeUrl)}
                  title={recipe.title}
                  allowFullScreen
                  className="rounded"
                ></iframe>
              </div>
            </div>
          )}
          <h5>
            <FontAwesomeIcon icon={faList} className="me-2" />
            Nguyên liệu
          </h5>
          <ListGroup variant="flush" className="mb-4">
            {recipe.ingredients.map((item, index) => (
              <ListGroupItem key={index}>
                <span className="item-number">{index + 1}</span>
                {item}
              </ListGroupItem>
            ))}
          </ListGroup>
          <h5>
            <FontAwesomeIcon icon={faRoute} className="me-2" />
            Các bước
          </h5>
          <ListGroup variant="flush" className="mb-4">
            {recipe.steps.map((step, index) => (
              <ListGroupItem key={index}>
                <span className="item-number">{index + 1}</span>
                {step}
              </ListGroupItem>
            ))}
          </ListGroup>
          {isOwner && (
            <Button
              as={Link}
              href={`/sua/${recipe.slug}`}
              variant="warning"
              className="mb-4"
            >
              <FontAwesomeIcon icon={faPencilAlt} className="me-1" />
              Chỉnh sửa công thức
            </Button>
          )}

          {/* Comments section visible to all visitors */}
          <h5>
            <FontAwesomeIcon icon={faComment} className="me-2" />
            Bình luận
          </h5>
          {comments.length === 0 ? (
            <Alert variant="info" className="mb-4">
              Chưa có bình luận nào.
            </Alert>
          ) : (
            <ListGroup variant="flush" className="mb-4">
              {comments.map((comment) => (
                <ListGroupItem key={comment.id} className="py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{comment.username}</strong>
                      <span className="ms-2 text-muted">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1">{comment.text}</div>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}

          {/* Comment submission form only for logged-in users */}
          {currentUser ? (
            <Form onSubmit={handleCommentSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Thêm bình luận..."
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                disabled={!newComment || newComment.trim() === ""}
              >
                <FontAwesomeIcon icon={faComment} className="me-1" />
                Đăng bình luận
              </Button>
            </Form>
          ) : (
            <Alert variant="warning" className="mb-0">
              Vui lòng đăng nhập để thêm bình luận.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {relatedRecipes.length > 0 && (
        <div className="mb-4">
          <h5>
            <FontAwesomeIcon icon={faUtensils} className="me-2" />
            Công thức liên quan
          </h5>
          <Row>
            {currentRelatedRecipes.map((related) => (
              <Col lg={4} md={4} key={related.id} className="mb-4">
                <Card className="d-flex flex-column h-100">
                  {related.imageUrl && (
                    <div
                      className="custom-card-img rounded-top"
                      style={{ backgroundImage: `url(${related.imageUrl})` }}
                    ></div>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>
                      <Link href={`/cong-thuc/${related.slug}`}>
                        {related.title}
                      </Link>
                    </Card.Title>
                    <Card.Text>
                      {related.description.slice(0, 100)}...
                    </Card.Text>
                    <div className="mt-auto d-flex justify-content-start gap-3">
                      <Button
                        as={Link}
                        href={`/cong-thuc/${related.slug}`}
                        variant="primary"
                      >
                        <FontAwesomeIcon icon={faEye} className="me-1" />
                        Xem công thức
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center my-0 related-pagination">
              <Button
                variant="outline-primary"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="me-1" />
                Trước
              </Button>
              <Button
                variant="outline-primary"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Sau
                <FontAwesomeIcon icon={faChevronRight} className="ms-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
