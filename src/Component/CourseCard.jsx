import React from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

function CourseCard({ course, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 shadow-sm border-0 rounded-4 position-relative overflow-hidden">
        {/* Image */}
        <div className="position-relative">
          <img
            src={course.course_thumbnail || "/placeholder.jpg"}
            className="card-img-top rounded-top-4"
            alt={course.course_title}
            style={{ height: "200px", objectFit: "cover" }}
          />

          {/* Edit & Delete Icons */}
          <div
            className="position-absolute top-0 end-0 d-flex gap-2 p-2"
            style={{ zIndex: 2 }}
          >
            <button
              className="btn btn-light btn-sm shadow-sm rounded-circle"
              title="Edit Course"
              onClick={() => navigate(`/course/${course._id}/edit`)}
            >
              <FiEdit2 className="text-primary" />
            </button>

            <button
              className="btn btn-light btn-sm shadow-sm rounded-circle"
              title="Delete Course"
              onClick={() => onDelete?.(course._id)}
            >
              <FiTrash2 className="text-danger" />
            </button>

          </div>
        </div>

        {/* Card Body */}
        <div className="card-body">
          <h5 className="card-title fw-bold text-truncate">
            {course.course_title}
          </h5>
          <p className="text-muted mb-2">
            {course.short_description?.substring(0, 80)}...
          </p>

          {/* Price Section */}
          <p className="fw-semibold mb-2">
            {course.is_free ? (
              <span className="badge bg-success">Free</span>
            ) : (
              <>
                <span className="text-primary me-2">
                  ₦{course.discount_price || course.original_price}
                </span>
                {course.discount_price && (
                  <del className="text-muted small">
                    ₦{course.original_price}
                  </del>
                )}
              </>
            )}
          </p>

          <p className="small text-secondary mb-0">
            {course.language} • {course.level}
          </p>
        </div>

        {/* Card Footer */}
        <div className="card-footer bg-transparent border-0 d-flex  justify-content-between px-3 pb-3">
          <button
            className="btn btn-outline-primary btn-sm "
            onClick={() => navigate(`/course/${course._id}/view`)}
          >
            View
          </button>

          <button
            className="btn btn-outline-success btn-sm "
            onClick={() => navigate(`/course/${course._id}/add-section`)}
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
