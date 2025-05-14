"use client";
import React, { useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  createUserDocument,
  updateUsernameInComments,
} from "@/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUserPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setError(""); // Reset error to empty string on component mount
  }, []);

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }
    if (username.length > 20) {
      setError("Tên người dùng phải có độ dài tối đa 20 ký tự.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile and create user document
      await updateProfile(user, { displayName: username });
      await createUserDocument(user, { username, authProvider: "email" });

      // Update username in comments
      await updateUsernameInComments(user.uid, username);
    } catch (err) {
      setError("Đăng ký thất bại. Thử lại.");
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Create/update user document
      await createUserDocument(user, { authProvider: "google" });

      // Update username in comments
      await updateUsernameInComments(user.uid, user.displayName);
    } catch (err) {
      setError("Đăng ký với Google thất bại. Thử lại.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4">
        <h2 className="text-center">Đăng ký</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleEmailRegister}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FontAwesomeIcon icon={faUser} className="me-1" />
              Tên người dùng
            </Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nhập tên người dùng của bạn"
              maxLength="20"
            />
          </Form.Group>
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
          <Form.Group className="mb-3">
            <Form.Label>
              <FontAwesomeIcon icon={faLock} className="me-1" />
              Nhập lại mật khẩu
            </Form.Label>
            <Form.Control
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
              placeholder="Nhập lại mật khẩu của bạn"
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100 mb-2">
            <FontAwesomeIcon icon={faUserPlus} className="me-1" />
            Đăng ký
          </Button>
        </Form>
        <Button
          variant="primary"
          className="w-100 mt-2 btn-google"
          onClick={handleGoogleRegister}
        >
          <FontAwesomeIcon icon={faGoogle} className="me-1" />
          Đăng ký với Google
        </Button>
      </Card>
    </div>
  );
};

export default Register;
