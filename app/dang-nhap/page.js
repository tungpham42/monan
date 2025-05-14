"use client";

import React, { useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  createUserDocument,
  updateUsernameInComments,
} from "@/firebase/config";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setError(""); // Reset error on component mount
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update user document with last login
      const userData = await createUserDocument(user, {
        authProvider: "email",
      });

      // Update username in comments
      await updateUsernameInComments(
        user.uid,
        user.displayName || userData.username
      );
    } catch (err) {
      setError("Email hoặc mật khẩu không hợp lệ.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Create/update user document
      await createUserDocument(user, { authProvider: "google" });

      // Update username in comments
      await updateUsernameInComments(user.uid, user.displayName);
    } catch (err) {
      setError("Đăng nhập với Google thất bại. Thử lại.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4">
        <h2 className="text-center">Đăng nhập</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleEmailLogin}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FontAwesomeIcon icon={faEnvelope} className="me-1" />
              Email
            </Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              <FontAwesomeIcon icon={faLock} className="me-1" />
              Mật khẩu
            </Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu của bạn"
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100 mb-2">
            <FontAwesomeIcon icon={faSignInAlt} className="me-1" />
            Đăng nhập
          </Button>
        </Form>
        <Button
          variant="primary"
          className="w-100 mt-2 btn-google"
          onClick={handleGoogleLogin}
        >
          <FontAwesomeIcon icon={faGoogle} className="me-1" />
          Đăng nhập với Google
        </Button>
      </Card>
    </div>
  );
};

export default Login;
