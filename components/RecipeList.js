"use client";

import { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUtensils,
  faEye,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/Pagination";

export default function RecipeList({ recipes }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortOption, setSortOption] = useState("alphabetAsc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const searchParams = useSearchParams();

  // Sync initial state with URL params on mount
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search") || "";
    const categoryParam = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "alphabetAsc";

    setCurrentPage(page);
    setSearchTerm(search);
    setCategory(categoryParam);
    setSortOption(sort);
  }, [searchParams]);

  // Sorting logic
  const sortRecipes = (recipesToSort) => {
    let sortedRecipes = [...recipesToSort];
    if (sortOption === "alphabetAsc") {
      sortedRecipes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "alphabetDesc") {
      sortedRecipes.sort((a, b) => b.title.localeCompare(b.title));
    } else if (sortOption === "dateAsc") {
      sortedRecipes.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (sortOption === "dateDesc") {
      sortedRecipes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return sortedRecipes;
  };

  // Filtering logic
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = category ? recipe.category === category : true;
    return matchesSearch && matchesCategory;
  });

  const sortedRecipes = sortRecipes(filteredRecipes);
  const indexOfLastRecipe = currentPage * itemsPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - itemsPerPage;
  const currentRecipes = sortedRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  // Handle reset filters
  const handleReset = () => {
    setSearchTerm("");
    setCategory("");
    setSortOption("alphabetAsc");
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2>
          <FontAwesomeIcon icon={faUtensils} className="me-2" /> Khám phá công
          thức
        </h2>
        <Button variant="primary" onClick={handleReset}>
          <FontAwesomeIcon icon={faUndo} className="me-1" />
          Đặt lại bộ lọc
        </Button>
      </div>
      <Form
        className="mb-4 p-3 bg-white shadow-sm rounded"
        onSubmit={handleSubmit}
      >
        <Row className="align-items-center">
          <Col md={6}>
            <Form.Group className="mb-3 mb-md-0 position-relative">
              <Form.Control
                type="text"
                placeholder="Tìm kiếm công thức..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search change
                }}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="position-absolute"
                style={{
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on category change
                }}
              >
                <option value="">Tất cả danh mục</option>
                <option value="Breakfast">Bữa sáng</option>
                <option value="Lunch">Bữa trưa</option>
                <option value="Dinner">Bữa tối</option>
                <option value="Dessert">Tráng miệng</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on sort change
                }}
              >
                <option value="">Sắp xếp theo...</option>
                <option value="alphabetAsc">Theo thứ tự chữ cái (A-Z)</option>
                <option value="alphabetDesc">Theo thứ tự chữ cái (Z-A)</option>
                <option value="dateAsc">Ngày (Cũ nhất trước)</option>
                <option value="dateDesc">Ngày (Mới nhất trước)</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Form>
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
                    ></div>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>
                      <Link href={`/cong-thuc/${recipe.slug}`}>
                        {recipe.title}
                      </Link>
                    </Card.Title>
                    <Card.Text>{recipe.description.slice(0, 100)}...</Card.Text>
                    <div className="mt-auto d-flex justify-content-start gap-3">
                      <Button
                        as={Link}
                        href={`/cong-thuc/${recipe.slug}`}
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
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={sortedRecipes.length}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
