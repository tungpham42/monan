"use client";
import React from "react";
import { Container } from "react-bootstrap";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-dark pb-1 mt-4">
      <Container>
        <p className="text-center">
          © {currentYear}{" "}
          <a
            className="text-dark font-weight-bold text-decoration-none"
            href="https://tungpham42.github.io"
            target="_blank"
            rel="noreferrer"
          >
            Phạm Tùng
          </a>
          {" | "}
          <Link
            href="/privacy-policy"
            className="text-dark text-decoration-none"
          >
            Privacy Policy
          </Link>
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
