"use client";

import { useState, useEffect } from "react";
import { Card, Button, Row, Col, Accordion, Spinner } from "react-bootstrap";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faRedo } from "@fortawesome/free-solid-svg-icons";
import "./WeeklySuggestions.css";

export default function WeeklySuggestions({ recipes }) {
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [activeCategories, setActiveCategories] = useState([
    "Breakfast",
    "Lunch",
    "Dinner",
    "Dessert",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const days = [
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
    "Chủ Nhật",
  ];
  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert"];

  // Function to generate random weekly plan
  const generateWeeklyPlan = () => {
    setIsLoading(true);
    const newPlan = days.map((day) => {
      const dailySuggestions = categories
        .filter((category) => activeCategories.includes(category))
        .map((category) => {
          const categoryRecipes = recipes.filter(
            (recipe) => recipe.category === category
          );
          if (categoryRecipes.length === 0) return null;
          const randomIndex = Math.floor(
            Math.random() * categoryRecipes.length
          );
          return categoryRecipes[randomIndex];
        });
      return {
        day,
        meals: dailySuggestions.filter((recipe) => recipe !== null),
      };
    });
    setTimeout(() => {
      setWeeklyPlan(newPlan);
      setIsLoading(false);
    }, 500); // Simulate loading for user feedback
  };

  // Toggle category filter
  const toggleCategory = (category) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  // Generate initial plan on mount or when recipes/activeCategories change
  useEffect(() => {
    if (recipes.length > 0) {
      generateWeeklyPlan();
    } // eslint-disable-next-line
  }, [recipes, activeCategories]);

  return (
    <div className="my-5">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <h2 className="mb-3 mb-md-0">Gợi ý công thức theo tuần</h2>
        <div className="d-flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={
                activeCategories.includes(category)
                  ? "primary"
                  : "outline-primary"
              }
              onClick={() => toggleCategory(category)}
              size="sm"
              aria-pressed={activeCategories.includes(category)}
              className="rounded-pill"
            >
              {category === "Breakfast"
                ? "Bữa sáng"
                : category === "Lunch"
                ? "Bữa trưa"
                : category === "Dinner"
                ? "Bữa tối"
                : "Tráng miệng"}
            </Button>
          ))}
          <Button
            variant="primary"
            onClick={generateWeeklyPlan}
            disabled={isLoading}
            className="rounded-pill"
            aria-label="Làm mới gợi ý thực đơn hàng tuần"
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Đang làm mới...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faRedo} className="me-1" />
                Làm mới
              </>
            )}
          </Button>
        </div>
      </div>
      {weeklyPlan.length === 0 ? (
        <p className="alert alert-info">
          Không có công thức nào để gợi ý. Vui lòng thêm công thức.
        </p>
      ) : (
        <Accordion defaultActiveKey="0">
          {weeklyPlan.map((dayPlan, index) => (
            <Accordion.Item eventKey={`${index}`} key={index}>
              <Accordion.Header>
                <h3 className="card-title">{dayPlan.day}</h3>
              </Accordion.Header>
              <Accordion.Body>
                {dayPlan.meals.length === 0 ? (
                  <p>Không có công thức cho ngày này.</p>
                ) : (
                  <div className="list-group">
                    {dayPlan.meals.map((recipe, mealIndex) => (
                      <div
                        key={mealIndex}
                        className="list-group-item d-flex align-items-start"
                        role="listitem"
                      >
                        <span className="item-number">{mealIndex + 1}</span>
                        <div>
                          <h5 className="recipe-category">
                            {recipe.category === "Breakfast"
                              ? "Bữa sáng"
                              : recipe.category === "Lunch"
                              ? "Bữa trưa"
                              : recipe.category === "Dinner"
                              ? "Bữa tối"
                              : "Tráng miệng"}
                          </h5>
                          <div className="card-text">
                            <Link
                              href={`/cong-thuc/${recipe.slug}`}
                              className="text-decoration-none h3 mb-2"
                              aria-label={`Xem công thức ${recipe.title}`}
                            >
                              {recipe.title}
                            </Link>
                            <p className="my-2">
                              {recipe.description.slice(0, 300)}...
                            </p>
                            <Button
                              as={Link}
                              href={`/cong-thuc/${recipe.slug}`}
                              variant="outline-primary"
                              size="sm"
                              aria-label={`Xem chi tiết công thức ${recipe.title}`}
                            >
                              <FontAwesomeIcon icon={faEye} className="me-1" />
                              Xem
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
}
