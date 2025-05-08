"use client";
import React from "react";
import { Card, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faComment,
  faEye,
  faInfoCircle,
  faPencilAlt,
  faPlus,
  faSearch,
  faSignInAlt,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

// Hard-coded Vietnamese translations
const translation = {
  "Recipe App": "Nền tảng Chia sẻ Công thức",
  title: "Cách Sử dụng Nền tảng Chia sẻ Công thức",
  lastUpdated: "Cập nhật lần cuối: Ngày 26 tháng 3 năm 2025",
  sections: [
    {
      heading: "Bắt đầu",
      content:
        "Chào mừng bạn đến với Nền tảng Chia sẻ Công thức! Dù bạn là một người yêu thích ẩm thực muốn chia sẻ các sáng tạo nấu nướng của mình hay chỉ đơn giản là tìm kiếm các công thức mới để thử, hướng dẫn này sẽ giúp bạn dễ dàng khám phá các tính năng của chúng tôi.",
    },
    {
      heading: "Tạo Tài khoản",
      content:
        "Để bắt đầu chia sẻ công thức của riêng bạn và bình luận về công thức của người khác, bạn cần một tài khoản. Đây là cách thực hiện:",
      list: [
        "Nhấn vào <strong>Đăng ký</strong> trên thanh điều hướng.",
        "Đăng ký bằng email và mật khẩu của bạn, hoặc sử dụng tài khoản Google để thiết lập nhanh chóng.",
        "Sau khi đăng ký, bạn sẽ sẵn sàng tham gia vào cộng đồng!",
      ],
    },
    {
      heading: "Đăng nhập",
      content: "Nếu bạn đã có tài khoản, việc đăng nhập rất đơn giản:",
      list: [
        "Nhấn vào <strong>Đăng nhập</strong> trên thanh điều hướng.",
        "Nhập email và mật khẩu của bạn, hoặc đăng nhập bằng Google.",
        "Bạn sẽ được chuyển đến trang chủ để khám phá các công thức.",
      ],
    },
    {
      heading: "Khám phá Công thức",
      content: "Khám phá nhiều công thức đa dạng từ cộng đồng của chúng tôi:",
      list: [
        "Sử dụng <strong>Thanh tìm kiếm</strong> trên trang chủ để tìm công thức theo tên.",
        "Lọc theo danh mục (ví dụ: Bữa sáng, Bữa tối) hoặc sắp xếp theo thứ tự chữ cái hoặc ngày.",
        "Nhấn <strong>Xem Công thức</strong> trên bất kỳ thẻ công thức nào để xem chi tiết đầy đủ.",
      ],
    },
    {
      heading: "Thêm Công thức",
      content: "Chia sẻ những món ăn yêu thích của bạn với mọi người:",
      list: [
        "Nhấn vào <strong>Thêm Công thức</strong> trên thanh điều hướng (bạn phải đăng nhập).",
        "Điền vào mẫu với tiêu đề công thức, mô tả, thành phần, các bước, danh mục, hình ảnh và video tùy chọn.",
        "Nhấn <strong>Thêm Công thức</strong> để đăng tải—công thức của bạn giờ đây sẽ hiển thị cho mọi người!",
      ],
    },
    {
      heading: "Quản lý Công thức của Bạn",
      content: "Giữ bộ sưu tập công thức của bạn gọn gàng:",
      list: [
        "Vào <strong>Công thức của Tôi</strong> trên thanh điều hướng để xem tất cả công thức bạn đã đăng.",
        "Nhấn <strong>Chỉnh sửa</strong> để cập nhật chi tiết hoặc hình ảnh của công thức.",
        "Sử dụng tùy chọn sắp xếp để tổ chức công thức theo tên hoặc ngày.",
      ],
    },
    {
      heading: "Tương tác với Cộng đồng",
      content: "Giao lưu với những người yêu ẩm thực khác:",
      list: [
        "Trên trang công thức, kéo xuống phần <strong>Bình luận</strong>.",
        "Thêm ý kiến hoặc mẹo của bạn bằng cách nhập vào ô bình luận và nhấn <strong>Đăng Bình luận</strong>.",
        "Xem <strong>Công thức Liên quan</strong> ở cuối mỗi trang công thức để tìm thêm cảm hứng.",
      ],
    },
    {
      heading: "Cần Giúp đỡ?",
      content:
        "Nếu bạn có câu hỏi hoặc gặp vấn đề, chúng tôi luôn sẵn sàng hỗ trợ:",
      list: [
        "Liên hệ với chúng tôi qua <a href='mailto:tung.42@gmail.com'>tung.42@gmail.com</a> để được hỗ trợ.",
        "Xem <strong>Chính sách Bảo mật</strong> để biết chi tiết về cách chúng tôi xử lý dữ liệu của bạn.",
      ],
    },
  ],
};

const Instructions = () => {
  return (
    <Card>
      <Card.Body>
        <h2 className="mb-3">
          <FontAwesomeIcon icon={faBook} className="me-2" />
          {translation.title}
        </h2>
        <Card.Subtitle className="mb-4 text-muted">
          {translation.lastUpdated}
        </Card.Subtitle>

        {translation.sections.map((section, index) => (
          <div key={index} className="mb-4">
            <h5 className="text-primary">
              <FontAwesomeIcon
                icon={
                  index === 0
                    ? faInfoCircle
                    : index === 1
                    ? faUserPlus
                    : index === 2
                    ? faSignInAlt
                    : index === 3
                    ? faSearch
                    : index === 4
                    ? faPlus
                    : index === 5
                    ? faPencilAlt
                    : index === 6
                    ? faComment
                    : faEye
                }
                className="me-2"
              />
              {section.heading}
            </h5>
            <Card.Text dangerouslySetInnerHTML={{ __html: section.content }} />
            {section.list && (
              <ListGroup variant="flush">
                {section.list.map((item, idx) => (
                  <ListGroup.Item
                    key={idx}
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ))}
              </ListGroup>
            )}
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default Instructions;
