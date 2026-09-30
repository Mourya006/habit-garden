import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function FloatingDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const items = [
    {
      icon: "🏠",
      label: "Home",
      path: "/",
    },
    {
      icon: "🌳",
      label: "Garden",
      path: "/garden",
    },
    {
      icon: "📊",
      label: "Progress",
      path: "/progress",
    },
  ];

  function isActive(path) {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  }

  return (
    <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 px-3">

      <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-[#18391f]/90 p-2 shadow-2xl backdrop-blur-xl">

        {items.map((item) => {
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex min-w-[64px] flex-col items-center justify-center rounded-xl px-3 py-2 transition-all sm:min-w-[78px] ${
                active
                  ? "bg-[#e0cc98] text-[#253a26] shadow-lg"
                  : "text-[#e8eadc] hover:bg-white/10"
              }`}
            >
              <span className="text-lg leading-none">
                {item.icon}
              </span>

              <span className="mt-1 text-[10px] font-semibold sm:text-xs">
                {item.label}
              </span>
            </button>
          );
        })}

        <div className="mx-1 h-8 w-px bg-white/10" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-w-[60px] flex-col items-center justify-center rounded-xl px-3 py-2 text-[#f5d6ce] transition hover:bg-red-500/10"
        >
          <span className="text-lg leading-none">
            🚪
          </span>

          <span className="mt-1 text-[10px] font-semibold sm:text-xs">
            Logout
          </span>
        </button>

      </div>

    </div>
  );
}