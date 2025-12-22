import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  if (!user) return null;

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    user.name
  )}`;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-100"
      >
        {/* Text visible only on sm+ devices */}
        <div className="hidden sm:block text-right leading-tight">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
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
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border z-50 p-3">
          <div className="pb-3 border-b">
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 mt-2 rounded-md text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
