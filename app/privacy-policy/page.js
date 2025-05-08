"use client";
import React from "react";
import { Card } from "react-bootstrap";

const content = {
  title: "Privacy Policy",
  "Recipe App": "Recipe Sharing Platform",
  html: `
      <div>
        <h2 class="mb-2">Privacy Policy</h2>
        <h6 class="text-muted">Last updated: March 25, 2025</h6>
        <h5 class="text-primary">Introduction</h5>
        <p>Welcome to the Recipe Sharing Platform ("we," "us," or "our"). We are committed to protecting your privacy and ensuring that your personal information is handled responsibly. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
        <h5 class="text-primary">Information We Collect</h5>
        <p>We may collect the following types of information:</p>
        <ul>
          <li><strong>Personal Information:</strong> When you register or log in (including via Google), we may collect your email address, name, and other details you provide.</li>
          <li><strong>Recipe Data:</strong> Information you submit when adding or editing recipes, such as titles, descriptions, ingredients, steps, categories, and optional images.</li>
          <li><strong>Comments:</strong> Any comments you post on recipes.</li>
          <li><strong>Usage Data:</strong> Information about how you interact with our platform, such as pages visited, search queries, and IP address.</li>
        </ul>
        <h5 class="text-primary">How We Use Your Information</h5>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and improve our services, such as displaying your recipes and comments.</li>
          <li>Manage your account and authenticate your login.</li>
          <li>Communicate with you, including responding to inquiries or sending updates.</li>
          <li>Analyze usage trends to enhance user experience.</li>
        </ul>
        <h5 class="text-primary">Sharing Your Information</h5>
        <p>We do not sell your personal information. We may share it with:</p>
        <ul>
          <li><strong>Service Providers:</strong> Third parties that assist with hosting, analytics, or authentication (e.g., Google for login).</li>
          <li><strong>Legal Requirements:</strong> If required by law or to protect our rights.</li>
        </ul>
        <h5 class="text-primary">Cookies and Tracking</h5>
        <p>We use cookies to store your language preference and improve your experience. You can disable cookies in your browser settings, but this may affect functionality.</p>
        <h5 class="text-primary">Your Choices</h5>
        <p>You can:</p>
        <ul>
          <li>Update or delete your recipes and comments.</li>
          <li>Change your language settings.</li>
          <li>Delete your account by contacting us.</li>
        </ul>
        <h5 class="text-primary">Data Security</h5>
        <p>We implement reasonable measures to protect your information, but no system is completely secure. Please use strong passwords and keep your account details confidential.</p>
        <h5 class="text-primary">Contact Us</h5>
        <p>If you have questions about this Privacy Policy, contact us at: <a href="mailto:tung.42@gmail.com">tung.42@gmail.com</a>.</p>
      </div>
    `,
};

const PrivacyPolicy = () => {
  return (
    <Card>
      <Card.Body>
        <div
          className="privacy-policy"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      </Card.Body>
    </Card>
  );
};

export default PrivacyPolicy;
