import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    user.name
  )}`;

  const handleLogout = async () => {
    try {
      await logout();          // 🔥 clear auth state
      navigate("/login");      // 🔥 redirect to login
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="relative">
      {/* Profile button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-100"
      >
        {/* Text */}
       <div className="text-right leading-tight">

          <p className="text-sm font-medium text-gray-900">
            {user.name}
          </p>
          <p className="text-xs text-gray-500">
            {user.email}
          </p>
        </div>

        {/* Avatar */}
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-9 h-9 rounded-full border"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
          <ul className="text-sm py-1">
            <li
              onClick={handleLogout}
              className="px-4 py-2 hover:bg-red-50 cursor-pointer text-red-600"
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
