import React, { useState, useEffect } from "react";
import { useStaffstore } from "../Store/staffStore";
import { useRolestore } from "../Store/roleStore";
import toast from "react-hot-toast";
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaUserPlus,
  FaFilter,
  FaDownload 
} from "react-icons/fa";

function StaffManagement() {
  const { getAllStaff, staff, updateStaff, deleteStaff, loading, error } = useStaffstore();
  const { getRole, roles } = useRolestore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    jobTitle: "",
    role: "",
  });

  useEffect(() => {
    getAllStaff();
    getRole();
  }, []);

  // Get unique departments for filter
  const departments = [...new Set(staff.map((s) => s.department))];

  // Filter staff based on search and filters
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.staffId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      !filterDepartment || member.department === filterDepartment;

    const matchesRole =
      !filterRole || member.role?._id === filterRole;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Handle View Staff
  const handleView = (member) => {
    setSelectedStaff(member);
    setShowViewModal(true);
  };

  // Handle Edit Staff
  const handleEdit = (member) => {
    setSelectedStaff(member);
    setEditFormData({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      department: member.department,
      jobTitle: member.jobTitle,
      role: member.role?._id || "",
    });
    setShowEditModal(true);
  };

  // Handle Update Staff
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateStaff(selectedStaff._id, editFormData);
      toast.success("Staff updated successfully!");
      setShowEditModal(false);
      getAllStaff(); // Refresh list
    } catch (err) {
      toast.error(err.message || "Failed to update staff");
    }
  };

  // Handle Delete Staff
  const handleDelete = async (member) => {
    if (window.confirm(`Are you sure you want to delete ${member.fullName}?`)) {
      try {
        await deleteStaff(member._id);
        toast.success("Staff deleted successfully!");
        getAllStaff(); // Refresh list
      } catch (err) {
        toast.error(err.message || "Failed to delete staff");
      }
    }
  };

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ["Staff ID", "Full Name", "Email", "Phone", "Department", "Job Title", "Role"],
      ...filteredStaff.map((member) => [
        member.staffId,
        member.fullName,
        member.email,
        member.phone,
        member.department,
        member.jobTitle,
        member.role?.roleName || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Staff Management</h3>
            <div>
              <button
                className="btn btn-outline-success me-2"
                onClick={handleExport}
              >
                <FaDownload className="me-2" />
                Export CSV
              </button>
              <a href="/add_staff" className="btn text-white" style={{ backgroundColor: "#15253a" }}>
                <FaUserPlus className="me-2" />
                Add New Staff
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, or staff ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Department Filter */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm("");
                  setFilterDepartment("");
                  setFilterRole("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5>Total Staff</h5>
              <h2>{staff.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5>Active Staff</h5>
              <h2>{staff.filter((s) => s.isActive).length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5>Departments</h5>
              <h2>{departments.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5>Roles</h5>
              <h2>{roles.length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No staff members found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Job Title</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member._id}>
                      <td>
                        
                        <strong>{member.staffId}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          
                          <span>{member.fullName}</span>
                        </div>
                      </td>
                      <td>{member.email}</td>
                      <td>{member.phone}</td>
                      <td>{member.department}</td>
                      <td>{member.jobTitle}</td>
                      <td>
                        <span className="badge bg-primary">
                          {member.role?.roleName || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            member.isActive ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info text-white me-1"
                          onClick={() => handleView(member)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn btn-sm btn-warning text-white me-1"
                          onClick={() => handleEdit(member)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(member)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedStaff && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Staff Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center mb-3">
                    <img
                      src={selectedStaff.profilePic || "https://via.placeholder.com/150"}
                      alt={selectedStaff.fullName}
                      className="rounded-circle mb-3"
                      width="150"
                      height="150"
                    />
                    <h5>{selectedStaff.fullName}</h5>
                    <p className="text-muted">{selectedStaff.jobTitle}</p>
                  </div>
                  <div className="col-md-8">
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <th width="150">Staff ID:</th>
                          <td>{selectedStaff.staffId}</td>
                        </tr>
                        <tr>
                          <th>Email:</th>
                          <td>{selectedStaff.email}</td>
                        </tr>
                        <tr>
                          <th>Phone:</th>
                          <td>{selectedStaff.phone}</td>
                        </tr>
                        <tr>
                          <th>Department:</th>
                          <td>{selectedStaff.department}</td>
                        </tr>
                        <tr>
                          <th>Role:</th>
                          <td>
                            <span className="badge bg-primary">
                              {selectedStaff.role?.roleName || "N/A"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Status:</th>
                          <td>
                            <span
                              className={`badge ${
                                selectedStaff.isActive ? "bg-success" : "bg-secondary"
                              }`}
                            >
                              {selectedStaff.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Last Login:</th>
                          <td>
                            {selectedStaff.lastLogin
                              ? new Date(selectedStaff.lastLogin).toLocaleString()
                              : "Never"}
                          </td>
                        </tr>
                        <tr>
                          <th>Created:</th>
                          <td>
                            {new Date(selectedStaff.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStaff && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Staff</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.fullName}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, phone: e.target.value })
                      }
                    />
                  </div>

                  {/* Department */}
                  <div className="mb-3">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.department}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, department: e.target.value })
                      }
                    />
                  </div>

                  {/* Job Title */}
                  <div className="mb-3">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.jobTitle}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, jobTitle: e.target.value })
                      }
                    />
                  </div>

                  {/* Role */}
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={editFormData.role}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, role: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Select Role --</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn text-white"
                    style={{ backgroundColor: "#15253a" }}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Staff"}
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

export default StaffManagement;