"use client";
import React, { useEffect, useState } from "react";
import { db, auth, updateCommentsUsername } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { Card, Button, Row, Col, Alert, Form } from "react-bootstrap";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPencilAlt,
  faUser,
  faLock,
  faSave,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 12;

const Profile = () => {
  // State for current user
  const [currentUser, setCurrentUser] = useState(null);

  // State for recipes and sorting
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("alphabetAsc");

  // State for account settings
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load sort option from localStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSortOption = localStorage.getItem("profileSortOption");
      if (savedSortOption) {
        setSortOption(savedSortOption);
      }
    }
  }, []);

  // Persist sort option to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("profileSortOption", sortOption);
    }
  }, [sortOption]);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setUsername(user?.displayName || "");
    });
    return () => unsubscribe();
  }, []);

  // Fetch user recipes
  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, "recipes"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const recipeData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecipes(recipeData);
      } catch (err) {
        console.error("Lỗi khi lấy công thức:", err.message);
      }
    };
    fetchUserRecipes();
  }, [currentUser]);

  // Early return if no user is logged in
  if (!currentUser) {
    return <div>Vui lòng đăng nhập để xem hồ sơ của bạn.</div>;
  }

  // Check authentication providers
  const isEmailPasswordUser = currentUser.providerData.some(
    (provider) => provider.providerId === "password"
  );
  const isGoogleUser = currentUser.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  // Sort recipes based on selected option
  const sortRecipes = (recipesToSort) => {
    const sortedRecipes = [...recipesToSort];
    switch (sortOption) {
      case "alphabetAsc":
        return sortedRecipes.sort((a, b) => a.title.localeCompare(b.title));
      case "alphabetDesc":
        return sortedRecipes.sort((a, b) => b.title.localeCompare(a.title));
      case "dateAsc":
        return sortedRecipes.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "dateDesc":
        return sortedRecipes.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      default:
        return sortedRecipes;
    }
  };

  // Pagination logic
  const sortedRecipes = sortRecipes(recipes);
  const indexOfLastRecipe = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstRecipe = indexOfLastRecipe - ITEMS_PER_PAGE;
  const currentRecipes = sortedRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );

  // Handle sort option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  // Update username
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (username.length > 20) {
      setError("Tên người dùng phải có độ dài tối đa 20 ký tự.");
      return;
    }

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { displayName: username });

      // Update users collection
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        { username, updatedAt: new Date().toISOString() },
        { merge: true }
      );

      // Update all comments with the new username
      await updateCommentsUsername(currentUser.uid, username);

      // Refresh user token
      await auth.currentUser.getIdToken(true);

      setSuccess("Tên người dùng đã được cập nhật thành công.");
    } catch (err) {
      setError("Cập nhật tên người dùng thất bại. Thử lại.");
      console.error("Lỗi khi cập nhật tên người dùng:", err.message);
    }
  };

  // Update password using Firebase Authentication
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }

    if (!auth.currentUser) {
      setError("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password using Firebase Auth
      await updatePassword(auth.currentUser, newPassword);

      // Update user document with last password change timestamp
      const userRef = doc(db, "users", currentUser.uid);
      const currentTime = new Date().toISOString();
      await setDoc(
        userRef,
        {
          lastPasswordChange: currentTime,
          updatedAt: currentTime,
        },
        { merge: true }
      );

      setSuccess("Mật khẩu đã được cập nhật thành công.");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err) {
      console.error("Lỗi khi cập nhật mật khẩu:", err.code, err.message);
      switch (err.code) {
        case "auth/wrong-password":
          setError("Mật khẩu hiện tại không đúng.");
          break;
        case "auth/too-many-requests":
          setError("Quá nhiều lần thử. Vui lòng thử lại sau.");
          break;
        case "auth/weak-password":
          setError("Mật khẩu phải có ít nhất 6 ký tự.");
          break;
        default:
          setError(
            "Cập nhật mật khẩu thất bại. Kiểm tra mật khẩu hiện tại của bạn."
          );
      }
    }
  };

  return (
    <div>
      <h2 className="mb-4">
        <FontAwesomeIcon icon={faUser} className="me-2" />
        Hồ sơ của tôi
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4 p-4">
        <Card.Body>
          <h3>Thiết lập tài khoản</h3>

          {/* Username Form */}
          <Form onSubmit={handleUpdateUsername} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faUser} className="me-1" />
                Tên người dùng
                {isGoogleUser && (
                  <span className="badge d-inline-flex align-items-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 48 48"
                      className="me-1"
                      fill="currentColor"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                  </span>
                )}
              </Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên người dùng của bạn"
                maxLength="20"
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              <FontAwesomeIcon icon={faSave} className="me-1" />
              Cập nhật tên người dùng
            </Button>
          </Form>

          {/* Password Form */}
          {isEmailPasswordUser && (
            <Form onSubmit={handleUpdatePassword}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faLock} className="me-1" />
                  Mật khẩu hiện tại
                </Form.Label>
                <Form.Control
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại của bạn"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faLock} className="me-1" />
                  Mật khẩu mới
                </Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới của bạn"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faLock} className="me-1" />
                  Xác nhận mật khẩu mới
                </Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới của bạn"
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary">
                <FontAwesomeIcon icon={faSave} className="me-1" />
                Cập nhật mật khẩu
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* Recipes Section */}
      <Card className="p-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0 d-inline-flex justify-content-center align-items-center">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Công thức của tôi
              <Button
                size="sm"
                as={Link}
                href="/them"
                variant="success"
                className="ms-3"
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </h3>
            <Form.Group className="ms-3" style={{ minWidth: "200px" }}>
              <Form.Select value={sortOption} onChange={handleSortChange}>
                <option value="">Sắp xếp theo...</option>
                <option value="alphabetAsc">Theo thứ tự chữ cái (A-Z)</option>
                <option value="alphabetDesc">Theo thứ tự chữ cái (Z-A)</option>
                <option value="dateAsc">Ngày (Cũ nhất trước)</option>
                <option value="dateDesc">Ngày (Mới nhất trước)</option>
              </Form.Select>
            </Form.Group>
          </div>

          {currentRecipes.length === 0 ? (
            <Alert variant="info">Không có công thức nào.</Alert>
          ) : (
            <>
              <Row>
                {currentRecipes.map((recipe) => (
                  <Col lg={4} md={6} key={recipe.id} className="mb-4">
                    <Card className="d-flex flex-column h-100">
                      {recipe.imageUrl && (
                        <div
                          className="custom-card-img rounded-top"
                          style={{ backgroundImage: `url(${recipe.imageUrl})` }}
                        />
                      )}
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>
                          <Link href={`/cong-thuc/${recipe.slug}`}>
                            {recipe.title}
                          </Link>
                        </Card.Title>
                        <Card.Text>
                          {recipe.description.slice(0, 100)}...
                        </Card.Text>
                        <div className="mt-auto d-flex justify-content-start gap-3">
                          <Button
                            as={Link}
                            href={`/cong-thuc/${recipe.slug}`}
                            variant="primary"
                          >
                            <FontAwesomeIcon icon={faEye} className="me-1" />
                            Xem
                          </Button>
                          <Button
                            as={Link}
                            href={`/sua/${recipe.slug}`}
                            variant="warning"
                          >
                            <FontAwesomeIcon
                              icon={faPencilAlt}
                              className="me-1"
                            />
                            Chỉnh sửa
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Pagination
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={sortedRecipes.length}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;
