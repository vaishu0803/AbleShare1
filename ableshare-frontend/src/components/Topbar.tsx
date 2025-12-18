import ProfileMenu from "./ProfileMenu";
import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
}

const Topbar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <header
      className="
        mx-3 sm:mx-6 mt-4
        h-16
        bg-gray-100
        rounded-xl
        border
        flex items-center
        shadow-sm
      "
    >
      <div className="w-full flex items-center px-4 sm:px-6">

        {/* USER INFO — Visible on ALL screens */}
        {user && (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 leading-tight">
              {user.name}
            </span>
            <span className="text-xs text-gray-500">
              {user.email}
            </span>
          </div>
        )}

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
