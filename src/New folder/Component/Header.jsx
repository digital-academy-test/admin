import React from "react";
import { FaFacebook, FaHome, FaBell, FaUserCircle, FaVideo } from "react-icons/fa";
import { BsGrid3X3GapFill, BsMessenger } from "react-icons/bs";
import logo from '../assets/mobile-logo.png';
import { Link } from "react-router-dom";

function Header({ onToggleSidebar }) {
  return (
    <nav
      className="d-flex align-items-center justify-content-between px-3 py-2 shadow-sm bg-white"
      style={{ position: "fixed", top: "0px", width: "100%", zIndex: 1000 }}
    >
      {/* Left: Logo */}
      <div className="d-flex align-items-center">
        <img src={logo} alt="" style={{ width: 35, objectFit: "cover" }} />
      </div>

      {/* Center: Search Bar */}
      <div className="d-none d-md-block flex-grow-1 px-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search "
          style={{ borderRadius: "50px", maxWidth: "400px", background: "var(--bg-color)" }}
        />
      </div>

      {/* Right: Icons */}
      <div className="d-flex align-items-center gap-3">
        <FaHome size={24} className="text-secondary cursor-pointer" />
        {/* Toggle sidebar when clicked */}
        <BsGrid3X3GapFill
          size={24}
          className="text-secondary cursor-pointer"
          onClick={onToggleSidebar}
        />
        <BsMessenger size={24} className="text-secondary cursor-pointer" />
        <FaVideo size={24} className="text-secondary cursor-pointer" />
        <FaBell size={24} className="text-secondary cursor-pointer" />
        <Link to="/profile"><FaUserCircle size={28} color="#20537c" className="cursor-pointer" /></Link>
      </div>
    </nav>
  );
}

export default Header;
