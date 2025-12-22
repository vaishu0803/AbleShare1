import ProfileMenu from "./ProfileMenu";
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SearchTask {
  id: number;
  title: string;
  priority: string;
  status: string;
  assignedToId?: number;
  creatorId?: number;
  assignedTo?: { name: string };
  creator?: { name: string };
}

const Topbar = () => {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchTask[]>([]);
  const [showResults, setShowResults] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  /* ---------- SEARCH ---------- */
  const handleSearch = async (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      const res = await api.get(`/tasks/search?q=${value}`);
      setResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  /* ---------- HIGHLIGHT ---------- */
  const highlight = (text: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
  };

  /* ---------- CLICK OUTSIDE ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- NAVIGATE ---------- */
  const handleSelect = (task: SearchTask) => {
    if (!user) return;

    if (task.assignedToId === user.id) navigate(`/assigned?task=${task.id}`);
    else navigate(`/created?task=${task.id}`);

    setShowResults(false);
    setQuery("");
  };

  return (
    <header className="mx-3 sm:mx-6 mt-4 h-16 bg-gray-100 rounded-xl border flex items-center shadow-sm relative z-50">
      <div className="w-full flex items-center px-4 sm:px-6 gap-4">

        {/* SEARCH BAR */}
        <div ref={wrapperRef} className="relative flex-1">
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => query && setShowResults(true)}
            placeholder="Search tasks globally..."
            className="w-full border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* RESULTS */}
          {showResults && results.length > 0 && (
            <div
              className="
                absolute z-50 top-12
                left-0
                w-full
                sm:w-[450px]
                bg-white shadow-xl rounded-xl border
                max-h-80 overflow-y-auto
              "
            >
              {results.map(task => (
                <div
                  key={task.id}
                  onMouseDown={() => handleSelect(task)}
                  className="p-4 border-b hover:bg-gray-100 cursor-pointer flex flex-col gap-2"
                >
                  <p
                    className="font-semibold text-gray-800 text-sm sm:text-base leading-snug"
                    dangerouslySetInnerHTML={{ __html: highlight(task.title) }}
                  />

                  <div className="flex flex-wrap gap-2 items-center text-xs">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                      {task.status}
                    </span>

                    <span
                      className={`
                        px-2 py-1 rounded-full font-medium
                        ${
                          task.priority === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }
                      `}
                    >
                      {task.priority}
                    </span>

                    <span className="text-gray-500">
                      Assigned by: {task.creator?.name || "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROFILE */}
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Topbar;
