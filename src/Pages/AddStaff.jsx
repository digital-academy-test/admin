import React, { useState, useEffect } from "react";
import { useRolestore } from "../Store/roleStore";

import toast from "react-hot-toast";
import { FaUserPlus, FaEnvelope, FaPhone, FaBriefcase, FaBuilding, FaUserTag } from "react-icons/fa";
import { useStaffstore } from "../Store/staffStore";

function AddStaff() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    jobTitle: "",
    role: "",
  });

  const { getRole, roles } = useRolestore();
  const { loading, addStaff } = useStaffstore();

  useEffect(() => {
    getRole();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const result = await addStaff(formData);
      toast.success(
        `Staff created successfully! Staff ID: ${result.staffId}. Login details sent to email.`
      );
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        department: "",
        jobTitle: "",
        role: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to add staff");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Add New Staff Member</h3>
            <a href="/staff" className="btn btn-outline-secondary">
              Back to Staff List
            </a>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header text-white" style={{ backgroundColor: "#15253a" }}>
              <h5 className="mb-0">
                <FaUserPlus className="me-2" />
                Staff Information
              </h5>
            </div>
            <div className="card-body p-4">
              {/* Info Alert */}
              <div className="alert alert-info" role="alert">
                <strong>Note:</strong> A random password will be generated and sent to the staff member's email address along with their Staff ID.
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Full Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <FaUserPlus className="me-2 text-muted" />
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <FaEnvelope className="me-2 text-muted" />
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter email address"
                      required
                    />
                    <small className="form-text text-muted">
                      Login credentials will be sent to this email
                    </small>
                  </div>

                  {/* Phone */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <FaPhone className="me-2 text-muted" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., +1234567890"
                    />
                  </div>

                  {/* Department */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <FaBuilding className="me-2 text-muted" />
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., IT, HR, Finance"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <FaBriefcase className="me-2 text-muted" />
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., Manager, Developer"
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <FaUserTag className="me-2 text-muted" />
                      Assign Role <span className="text-danger">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">-- Select Role --</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                    <small className="form-text text-muted">
                      Role determines access permissions
                    </small>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn text-white"
                        style={{ backgroundColor: "#15253a" }}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Staff...
                          </>
                        ) : (
                          <>
                            <FaUserPlus className="me-2" />
                            Add Staff Member
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setFormData({
                            fullName: "",
                            email: "",
                            phone: "",
                            department: "",
                            jobTitle: "",
                            role: "",
                          });
                        }}
                      >
                        Clear Form
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">What happens next?</h6>
            </div>
            <div className="card-body">
              <ol className="mb-0">
                <li className="mb-2">System automatically generates a unique Staff ID (e.g., STF0001)</li>
                <li className="mb-2">A secure random password is created</li>
                <li className="mb-2">Welcome email is sent with login credentials</li>
                <li className="mb-0">Staff member can login and change their password</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStaff;