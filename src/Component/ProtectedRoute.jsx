// Component/ProtectedRoute.jsx - UPDATED WITH ROLE-BASED ACCESS
import React from "react";
import { Navigate } from "react-router-dom";
import { useStaffstore } from "../Store/staffStore";

const ProtectedRoute = ({ children, requiredFeature }) => {
  const { isAuthenticated, user } = useStaffstore();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If no specific feature is required, just show the page
  if (!requiredFeature) {
    return children;
  }

  // Check if user has access to required feature
  const userFeatures = user?.role?.features || [];
  const hasAccess = userFeatures.includes(requiredFeature);

  // If user doesn't have access, show Access Denied page
  if (!hasAccess) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow text-center p-5">
              <div className="card-body">
                {/* Lock Icon */}
                <div className="mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
                    fill="currentColor"
                    className="text-danger"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  </svg>
                </div>

                {/* Title */}
                <h2 className="text-danger mb-3">Access Denied</h2>

                {/* Message */}
                <p className="text-muted mb-4">
                  You don't have permission to access this page.
                  <br />
                  <br />
                  Required feature: <strong>{requiredFeature}</strong>
                  <br />
                  <br />
                  Contact your administrator if you need access.
                </p>

                {/* Back Button */}
                <a href="/home" className="btn btn-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z" />
                  </svg>
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has access, show the page
  return children;
};

export default ProtectedRoute;