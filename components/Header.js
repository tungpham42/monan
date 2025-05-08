"use client";
import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { auth, isAdminUser } from "@/firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHome,
  faPlus,
  faTools,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faBowlFood,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [user, setUser] = useState(null); // Store authenticated user
  const [isAdmin, setIsAdmin] = useState(false); // Store admin status
  const [loading, setLoading] = useState(true); // Track loading state

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser ? isAdminUser(currentUser) : false); // Check admin status
      setLoading(false); // Authentication state resolved
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/dang-nhap");
    } catch (error) {
      console.error("Logout failed:", error.message);
      // Optionally show an error message to the user
    }
  };

  // Render nothing or a loading spinner while authentication state is resolving
  if (loading) {
    return null; // Or a loading spinner: <div>Loading...</div>
  }

  const isLoggedIn = !!user;
  const isUser = user && !isAdmin;
  const isGuest = !user;

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} href="/">
          <FontAwesomeIcon icon={faBowlFood} className="me-2" /> Chia sẻ món ăn
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/">
              <FontAwesomeIcon icon={faHome} className="me-1" />
              Trang chủ
            </Nav.Link>
            <Nav.Link as={Link} href="/huong-dan">
              <FontAwesomeIcon icon={faBook} className="me-1" />
              Hướng dẫn
            </Nav.Link>
          </Nav>
          <Nav className="align-items-left justify-content-between gap-2">
            {isLoggedIn ? (
              <NavDropdown
                title={
                  <>
                    <FontAwesomeIcon icon={faUser} className="me-1" />{" "}
                    {user.displayName || "Người dùng"}{" "}
                    {/* Fallback if no displayName */}
                  </>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} href="/ho-so">
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  Hồ sơ
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} href="/them">
                  <FontAwesomeIcon icon={faPlus} className="me-1" />
                  Thêm công thức
                </NavDropdown.Item>
                {isAdmin && (
                  <NavDropdown.Item as={Link} href="/quan-tri">
                    <FontAwesomeIcon icon={faTools} className="me-1" />
                    Quản trị
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                  Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} href="/dang-nhap">
                  <FontAwesomeIcon icon={faSignInAlt} className="me-1" />
                  Đăng nhập
                </Nav.Link>
                <Nav.Link as={Link} href="/dang-ky">
                  <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                  Đăng ký
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
