"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "@/firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Form, Button, Alert, Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faImage,
  faList,
  faRoute,
  faPlus,
  faTags,
  faHeading,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import slugify from "@/utils/slug";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";

const AddRecipe = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newRecipeSlug, setNewRecipeSlug] = useState("");
  const router = useRouter();

  const CLOUDINARY_CLOUD_NAME = "filecuatui";
  const CLOUDINARY_UPLOAD_PRESET = "recipe";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/dang-nhap");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) return data.secure_url;
      throw new Error(data.error?.message || "Tải ảnh thất bại");
    } catch (err) {
      throw new Error("Lỗi khi tải ảnh: " + err.message);
    }
  };

  const generateUniqueSlug = async (baseSlug) => {
    const q = query(collection(db, "recipes"), where("slug", "==", baseSlug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return baseSlug;
    }
    return baseSlug + "-temp-" + Math.random().toString(36).substring(2, 8);
  };

  const isValidYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (youtubeUrl && !isValidYoutubeUrl(youtubeUrl)) {
        setError("URL YouTube không hợp lệ");
        return;
      }

      let imageUrl = "";
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const baseSlug = slugify(title);
      let slug = await generateUniqueSlug(baseSlug);

      const docRef = await addDoc(collection(db, "recipes"), {
        title,
        description,
        ingredients: ingredients.split("\n"),
        steps: steps.split("\n"),
        category,
        imageUrl,
        youtubeUrl: youtubeUrl || "",
        slug,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      });

      if (slug.includes("-temp-")) {
        slug = `${baseSlug}-${docRef.id}`;
        await updateDoc(docRef, { slug });
      }

      setNewRecipeSlug(slug);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || "Không thể thêm công thức.");
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push(`/cong-thuc/${newRecipeSlug}`);
  };

  if (loading) {
    return <div>Đang kiểm tra trạng thái đăng nhập...</div>;
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <head>
        <title>Thêm Công Thức - Ứng Dụng Công Thức</title>
        <meta
          property="og:title"
          content="Thêm Công Thức - Ứng Dụng Công Thức"
        />
        <meta
          property="og:description"
          content="Chia sẻ công thức yêu thích của bạn với mọi người!"
        />
      </head>
      <h2>
        <FontAwesomeIcon icon={faUtensils} className="me-2" /> Thêm Công Thức
      </h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faHeading} className="me-1" /> Tiêu Đề
          </Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Tên công thức"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faFileAlt} className="me-1" /> Mô Tả
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Mô tả công thức của bạn"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faList} className="me-1" /> Nguyên Liệu
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
            placeholder="Liệt kê nguyên liệu, mỗi dòng một nguyên liệu"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faRoute} className="me-1" /> Các Bước
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
            placeholder="Liệt kê các bước, mỗi dòng một bước"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faTags} className="me-1" /> Danh Mục
          </Form.Label>
          <Form.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Chọn danh mục</option>
            <option value="Breakfast">Bữa Sáng</option>
            <option value="Lunch">Bữa Trưa</option>
            <option value="Dinner">Bữa Tối</option>
            <option value="Dessert">Tráng Miệng</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faImage} className="me-1" /> Hình Ảnh Công
            Thức (không bắt buộc)
          </Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faYoutube} className="me-1" /> URL Video
            YouTube (không bắt buộc)
          </Form.Label>
          <Form.Control
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Form.Group>
        <Button type="submit" variant="primary">
          <FontAwesomeIcon icon={faPlus} className="me-1" /> Thêm Công Thức
        </Button>
      </Form>

      <Modal show={showSuccessModal} onHide={handleModalClose} centered>
        <Modal.Header>
          <Modal.Title>Thêm Công Thức Thành Công</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Công thức <strong>{title}</strong> đã được thêm thành công!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleModalClose}>
            Xem Công Thức
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddRecipe;
