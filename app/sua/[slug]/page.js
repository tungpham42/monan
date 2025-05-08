"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Form, Button, Alert, Image, Modal } from "react-bootstrap";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faImage,
  faList,
  faRoute,
  faSave,
  faTags,
  faTrash,
  faHeading,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import slugify from "@/utils/slug";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";

const EditRecipe = () => {
  const { slug } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [error, setError] = useState("");
  const [recipeId, setRecipeId] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newRecipeSlug, setNewRecipeSlug] = useState("");
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const CLOUDINARY_CLOUD_NAME = "filecuatui";
  const CLOUDINARY_UPLOAD_PRESET = "recipe";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!authLoaded || !slug) {
        if (!slug) setError("Không có slug công thức được cung cấp.");
        return;
      }

      if (!currentUser) {
        router.push("/dang-nhap");
        return;
      }

      try {
        const q = query(collection(db, "recipes"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          if (data.userId !== currentUser.uid) {
            router.push("/");
            return;
          }
          setRecipeId(docSnap.id);
          setTitle(data.title);
          setDescription(data.description);
          setIngredients(data.ingredients.join("\n"));
          setSteps(data.steps.join("\n"));
          setCategory(data.category || "");
          setExistingImageUrl(data.imageUrl || "");
          setYoutubeUrl(data.youtubeUrl || "");
        } else {
          setError("Không tìm thấy công thức.");
        }
      } catch (err) {
        setError("Lỗi khi tải công thức: " + err.message);
      }
    };

    fetchRecipe();
  }, [authLoaded, slug, currentUser, router]);

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
      throw new Error(data.error?.message || "Tải hình ảnh thất bại");
    } catch (err) {
      throw new Error("Lỗi khi tải hình ảnh: " + err.message);
    }
  };

  const generateUniqueSlug = async (baseSlug, currentId) => {
    const q = query(collection(db, "recipes"), where("slug", "==", baseSlug));
    const querySnapshot = await getDocs(q);

    const existingDocs = querySnapshot.docs.filter(
      (doc) => doc.id !== currentId
    );
    if (existingDocs.length === 0) {
      return baseSlug;
    }
    return `${baseSlug}-${currentId}`;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setExistingImageUrl("");
  };

  const isValidYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeId) {
      setError("Không có ID công thức để cập nhật.");
      return;
    }

    try {
      if (youtubeUrl && !isValidYoutubeUrl(youtubeUrl)) {
        setError("Liên kết YouTube không hợp lệ");
        return;
      }

      let imageUrl = existingImageUrl;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const baseSlug = slugify(title);
      const newSlug = await generateUniqueSlug(baseSlug, recipeId);

      const recipeRef = doc(db, "recipes", recipeId);
      await updateDoc(recipeRef, {
        title,
        description,
        ingredients: ingredients.split("\n"),
        steps: steps.split("\n"),
        category,
        imageUrl,
        youtubeUrl: youtubeUrl || "",
        slug: newSlug,
        updatedAt: new Date().toISOString(),
      });

      setNewRecipeSlug(newSlug);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || "Cập nhật công thức thất bại.");
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push(`/cong-thuc/${newRecipeSlug}`);
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h2>
        <FontAwesomeIcon icon={faUtensils} className="me-2" /> Chỉnh sửa công
        thức
      </h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faHeading} className="me-1" />
            Tiêu đề
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
            <FontAwesomeIcon icon={faFileAlt} className="me-1" />
            Mô tả
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
            <FontAwesomeIcon icon={faList} className="me-1" />
            Nguyên liệu
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
            <FontAwesomeIcon icon={faRoute} className="me-1" />
            Các bước
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
            <FontAwesomeIcon icon={faTags} className="me-1" />
            Danh mục
          </Form.Label>
          <Form.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Chọn một danh mục</option>
            <option value="Breakfast">Bữa sáng</option>
            <option value="Lunch">Bữa trưa</option>
            <option value="Dinner">Bữa tối</option>
            <option value="Dessert">Tráng miệng</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faImage} className="me-1" />
            Hình ảnh công thức (tùy chọn)
          </Form.Label>
          {existingImageUrl && !imageFile && (
            <div className="mb-2 d-flex align-items-start">
              <Image
                src={existingImageUrl}
                alt="Công thức hiện tại"
                style={{ maxWidth: "200px", borderRadius: "8px" }}
              />
              <Button
                variant="danger"
                size="sm"
                className="ms-2"
                onClick={handleRemoveImage}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </div>
          )}
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faYoutube} className="me-1" />
            Liên kết video YouTube (tùy chọn)
          </Form.Label>
          <Form.Control
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Form.Group>
        <Button type="submit" variant="primary">
          <FontAwesomeIcon icon={faSave} className="me-1" />
          Cập nhật công thức
        </Button>
      </Form>

      <Modal show={showSuccessModal} onHide={handleModalClose} centered>
        <Modal.Header>
          <Modal.Title>Cập Nhật Công Thức Thành Công</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Công thức <strong>{title}</strong> đã được cập nhật thành công!
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

export default EditRecipe;
