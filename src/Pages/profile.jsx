import React, { useState } from "react";
import { useStaffstore } from "../Store/staffStore";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaBuilding,
  FaLock,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";

function StaffProfile() {
  const { user, updateProfile, changePassword, loading } = useStaffstore();

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewPic, setPreviewPic] = useState(user?.profilePic || "");

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // Handle Profile Picture Change
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setProfilePic(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  // Check Password Strength
  const checkPasswordStrength = (value) => {
    let strength = "";
    const regexWeak = /[a-z]/;
    const regexMedium = /(?=.*[A-Z])(?=.*[a-z])/;
    const regexStrong = /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/;

    if (value.length === 0) strength = "";
    else if (value.length < 6) strength = "Too Short";
    else if (regexStrong.test(value)) strength = "Strong";
    else if (regexMedium.test(value)) strength = "Medium";
    else if (regexWeak.test(value)) strength = "Weak";

    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "Strong":
        return "bg-success";
      case "Medium":
        return "bg-warning";
      case "Weak":
      case "Too Short":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append text fields
      formData.append("fullName", profileData.fullName);
      formData.append("phone", profileData.phone);
      formData.append("department", profileData.department);

      // Append file if selected
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      // Debug: Log FormData contents
      console.log("Sending FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await updateProfile(formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setProfilePic(null);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordStrength === "Weak" || passwordStrength === "Too Short") {
      toast.error("Please use a stronger password");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength("");
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    }
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      department: user?.department || "",
    });
    setProfilePic(null);
    setPreviewPic(user?.profilePic || "");
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h3 className="mb-4">My Profile</h3>
        </div>
      </div>

      <div className="row">
        {/* Profile Card */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              {/* Profile Picture */}
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={previewPic || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="rounded-circle"
                  width="150"
                  height="150"
                  style={{ objectFit: "cover", border: "4px solid #15253a" }}
                />
                {isEditing && (
                  <label
                    htmlFor="profilePicture"
                    className="position-absolute bottom-0 end-0 btn btn-sm btn-primary rounded-circle"
                    style={{ width: "40px", height: "40px", cursor: "pointer" }}
                  >
                    <FaCamera />
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="d-none"
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <h4 className="mb-1">{user?.fullName}</h4>
              <p className="text-muted mb-2">{user?.jobTitle}</p>
              <span className="badge bg-primary mb-3">
                {user?.role?.roleName || "Staff"}
              </span>

              {/* Staff ID */}
              <div className="alert alert-light">
                <small className="text-muted">Staff ID</small>
                <h5 className="mb-0">{user?.staffId}</h5>
              </div>

              {/* Last Login */}
              <small className="text-muted">
                Last login:{" "}
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : "Never"}
              </small>
            </div>
          </div>

          {/* Change Password Button */}
          <div className="card shadow-sm mt-3">
            <div className="card-body">
              <button
                className="btn btn-outline-danger w-100"
                onClick={() => setShowPasswordModal(true)}
              >
                <FaLock className="me-2" />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Profile Information</h5>
              {!isEditing ? (
                <button
                  className="btn btn-sm text-white"
                  style={{ backgroundColor: "#15253a" }}
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit className="me-2" />
                  Edit Profile
                </button>
              ) : (
                <div>
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={handleProfileUpdate}
                    disabled={loading}
                  >
                    <FaSave className="me-2" />
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    <FaTimes className="me-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              <form onSubmit={handleProfileUpdate}>
                {/* Full Name */}
                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label">
                    <FaUser className="me-2 text-muted" />
                    Full Name
                  </label>
                  <div className="col-sm-9">
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, fullName: e.target.value })
                        }
                        required
                      />
                    ) : (
                      <p className="form-control-plaintext">{user?.fullName}</p>
                    )}
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label">
                    <FaEnvelope className="me-2 text-muted" />
                    Email
                  </label>
                  <div className="col-sm-9">
                    <p className="form-control-plaintext">{user?.email}</p>
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                </div>

                {/* Phone */}
                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label">
                    <FaPhone className="me-2 text-muted" />
                    Phone
                  </label>
                  <div className="col-sm-9">
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="form-control-plaintext">{user?.phone}</p>
                    )}
                  </div>
                </div>

                {/* Department */}
                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label">
                    <FaBuilding className="me-2 text-muted" />
                    Department
                  </label>
                  <div className="col-sm-9">
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={profileData.department}
                        onChange={(e) =>
                          setProfileData({ ...profileData, department: e.target.value })
                        }
                      />
                    ) : (
                      <p className="form-control-plaintext">{user?.department}</p>
                    )}
                  </div>
                </div>

                {/* Job Title (Read-only) */}
                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label">
                    <FaBriefcase className="me-2 text-muted" />
                    Job Title
                  </label>
                  <div className="col-sm-9">
                    <p className="form-control-plaintext">{user?.jobTitle}</p>
                  </div>
                </div>

                {/* Role (Read-only) */}
                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label">Role</label>
                  <div className="col-sm-9">
                    <span className="badge bg-primary fs-6">
                      {user?.role?.roleName || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Account Status */}
                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label">Status</label>
                  <div className="col-sm-9">
                    <span
                      className={`badge ${
                        user?.isActive ? "bg-success" : "bg-secondary"
                      } fs-6`}
                    >
                      {user?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Account Activity Card */}
          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h5 className="mb-0">Account Activity</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <small className="text-muted">Account Created</small>
                  <p className="mb-0">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <small className="text-muted">Last Updated</small>
                  <p className="mb-0">
                    {user?.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <small className="text-muted">Last Login</small>
                  <p className="mb-0">
                    {user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <small className="text-muted">Account Status</small>
                  <p className="mb-0">
                    <span
                      className={`badge ${
                        user?.isActive ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {user?.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPasswordModal(false)}
                ></button>
              </div>
              <form onSubmit={handlePasswordChange}>
                <div className="modal-body">
                  {/* Current Password */}
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <div className="input-group">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        className="form-control"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <div className="input-group">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className="form-control"
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          });
                          checkPasswordStrength(e.target.value);
                        }}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="progress" style={{ height: "5px" }}>
                          <div
                            className={`progress-bar ${getStrengthColor()}`}
                            style={{
                              width:
                                passwordStrength === "Strong"
                                  ? "100%"
                                  : passwordStrength === "Medium"
                                  ? "66%"
                                  : "33%",
                            }}
                          ></div>
                        </div>
                        <small className="text-muted">
                          Strength: {passwordStrength}
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={
                      loading ||
                      passwordStrength === "Weak" ||
                      passwordStrength === "Too Short"
                    }
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffProfile;