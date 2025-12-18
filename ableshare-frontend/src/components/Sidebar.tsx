import { NavLink } from "react-router-dom";
import { Home, List, Star } from "lucide-react";
import logo from "../assets/logo3.png";
import logoCollapsed from "../assets/logo2.png";

const Sidebar: React.FC = () => {
  const baseClass =
    "relative flex items-center gap-4 px-4 py-3 rounded-lg transition";

  return (
   <aside
  className="
    bg-gray-100
    flex flex-col
    border border-gray-200 shadow-sm

    h-screen w-20
    sm:w-64 sm:h-[calc(100vh-2rem)]

    m-0 sm:m-4
    rounded-none sm:rounded-2xl
  "
>

      {/* LOGO */}
     {/* LOGO */}
<div className="flex items-center justify-center px-4 h-20 border-b border-gray-200">
{/* Expanded logo */}
<img
  src={logo}
  alt="AbleShare"
  className="hidden sm:block h-12"
/>

{/* Collapsed logo */}
<img
  src={logoCollapsed}
  alt="AbleShare"
   className="h-9translate-y-0.5 sm:hidden"
/>

</div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-2 sm:px-3 py-5 space-y-1">
        {/* DASHBOARD */}
        <NavLink to="/dashboard" className={baseClass}>
          {({ isActive }: { isActive: boolean }) => (
            <>
              {isActive && (
                <span
                  className="
                    absolute left-0 top-1/2 -translate-y-1/2
                    h-9 w-1 rounded-r-full bg-green-600
                  "
                />
              )}

              <Home
                size={20}
                className={isActive ? "text-green-600" : "text-gray-500"}
              />

              <span
                className={`hidden sm:block text-[15px] ${
                  isActive
                    ? "text-black font-semibold"
                    : "text-gray-600"
                }`}
              >
                Dashboard
              </span>
            </>
          )}
        </NavLink>

        {/* ASSIGNED */}
        <NavLink to="/assigned" className={baseClass}>
          {({ isActive }: { isActive: boolean }) => (
            <>
              {isActive && (
                <span
                  className="
                    absolute left-0 top-1/2 -translate-y-1/2
                    h-9 w-1 rounded-r-full bg-green-600
                  "
                />
              )}

              <List
                size={20}
                className={isActive ? "text-green-600" : "text-gray-500"}
              />

              <span
                className={`hidden sm:block text-[15px] ${
                  isActive
                    ? "text-black font-semibold"
                    : "text-gray-600"
                }`}
              >
                Assigned to Me
              </span>
            </>
          )}
        </NavLink>

        {/* CREATED */}
        <NavLink to="/created" className={baseClass}>
          {({ isActive }: { isActive: boolean }) => (
            <>
              {isActive && (
                <span
                  className="
                    absolute left-0 top-1/2 -translate-y-1/2
                    h-9 w-1 rounded-r-full bg-green-600
                  "
                />
              )}

              <Star
                size={20}
                className={isActive ? "text-green-600" : "text-gray-500"}
              />

              <span
                className={`hidden sm:block text-[15px] ${
                  isActive
                    ? "text-black font-semibold"
                    : "text-gray-600"
                }`}
              >
                Created By Me
              </span>
            </>
          )}
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
