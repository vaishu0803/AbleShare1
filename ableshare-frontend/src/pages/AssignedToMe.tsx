import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../api/axios";
import type { Task } from "../types/task";
import { Check } from "lucide-react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

/* ---------- OVERDUE ---------- */
const isOverdue = (task: Task) => {
  if (!task.dueDate) return false;
  if (task.status === "COMPLETED") return false;
  return new Date(task.dueDate) < new Date();
};

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-700 border-gray-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-400",
  REVIEW: "bg-blue-100 text-blue-700 border-blue-400",
  COMPLETED: "bg-green-100 text-green-700 border-green-500",
};

const AssignedToMe = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  const detailRef = useRef<HTMLDivElement | null>(null);

  /* ---------- REACT QUERY ---------- */
 const { data: tasks = [], isLoading } = useQuery<Task[]>({
  queryKey: ["tasks", "assigned"],
  queryFn: async () => {
    const res = await api.get("/tasks?view=assigned");
    return res.data;
  },
});


  /* ---------- SOCKET ---------- */
  useEffect(() => {
    if (!user) return;

    const invalidate = () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks", "assigned"],
      });

    socket.on("task:created", invalidate);
    socket.on("task:updated", invalidate);
    socket.on("task:deleted", invalidate);

    return () => {
      socket.off("task:created", invalidate);
      socket.off("task:updated", invalidate);
      socket.off("task:deleted", invalidate);
    };
  }, [user?.id, queryClient]);

  /* ---------- CLICK OUTSIDE CLOSE ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (detailRef.current && !detailRef.current.contains(e.target as Node)) {
        setSelectedTask(null);
      }
    };

    if (selectedTask) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedTask]);

  /* ---------- UPDATE STATUS ---------- */
  const updateStatus = async (taskId: number, status: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });

      queryClient.invalidateQueries({
        queryKey: ["tasks", "assigned"],
      });

      toast.success(`Status updated to ${status}`);

      if (status === "COMPLETED") setSelectedTask(null);
    } catch (err) {
      console.error("Status update failed", err);
      toast.error("Failed to update status");
    }
  };

  /* ---------- COMPLETE ---------- */
  const completeTask = async (taskId: number) => {
    try {
      setCompletingId(taskId);
      await updateStatus(taskId, "COMPLETED");
      setTimeout(() => setCompletingId(null), 350);
    } catch {
      setCompletingId(null);
    }
  };

  /* ---------- FILTER + SORT ---------- */
  const visibleTasks = [...tasks]
    .filter(task => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && task.priority !== priorityFilter)
        return false;
      return true;
    })
    .map(t => ({ ...t, overdue: isOverdue(t) }))
    .sort((a, b) => {
      const aDate = new Date(a.dueDate || "").getTime();
      const bDate = new Date(b.dueDate || "").getTime();
      return sortOrder === "ASC" ? aDate - bDate : bDate - aDate;
    });

  /* ---------- OPEN FROM GLOBAL SEARCH ---------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get("task");

    if (!taskId || !tasks.length) return;

    const found = tasks
      .map(t => ({ ...t, overdue: isOverdue(t) }))
      .find(t => t.id === Number(taskId));

    if (!found) return;

    setSelectedTask(found);

    setTimeout(() => {
      const el = document.getElementById(`task-${found.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  }, [location.search, tasks]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex flex-col gap-4 sm:px-6 px-4 py-6">
          {/* FILTER BAR */}
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <select
              value={sortOrder}
              onChange={e =>
                setSortOrder(e.target.value as "ASC" | "DESC")
              }
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="ASC">Due Date ↑</option>
              <option value="DESC">Due Date ↓</option>
            </select>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT LIST */}
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Assigned to me</h1>
              <p className="text-sm text-gray-500 mb-4">
                Tasks assigned by others
              </p>

              {!isLoading && visibleTasks.length === 0 && (
                <div className="text-center text-gray-400 mt-20">
                  No tasks found
                </div>
              )}

              {isLoading && (
                <div className="space-y-3 mt-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-3 bg-white rounded-md px-3 py-3 border"
                    >
                      <div className="w-5 h-5 rounded-full bg-gray-300" />
                      <div className="flex-1">
                        <div className="h-3 w-40 bg-gray-300 rounded mb-2"></div>
                        <div className="h-2 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {visibleTasks.map(task => (
                  <div
                    id={`task-${task.id}`}
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`
                      flex items-center gap-3 bg-white rounded-md px-3 py-2 cursor-pointer border
                      ${task.overdue ? "border-red-400 bg-red-50" : ""}
                      ${
                        selectedTask?.id === task.id
                          ? "border-green-500"
                          : "border-transparent"
                      }
                    `}
                  >
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        completeTask(task.id);
                      }}
                      className={`
                        w-5 h-5 rounded-full border flex items-center justify-center
                        ${
                          completingId === task.id
                            ? "border-green-600 bg-green-50"
                            : "border-gray-400 hover:border-green-600"
                        }
                      `}
                    >
                      {completingId === task.id && (
                        <Check className="w-3 h-3 text-green-600" />
                      )}
                    </button>

                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      {(task as any).overdue && (
                        <span className="text-xs text-red-600 font-medium">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL */}
            {selectedTask && (
              <div
                ref={detailRef}
                className="
                  fixed bottom-0 left-0 right-0 z-40
                  lg:static lg:w-[340px]
                  bg-white rounded-t-xl lg:rounded-lg
                  p-4 border shadow-lg lg:shadow-none
                "
              >
                <h2 className="font-semibold text-lg mb-2">
                  {selectedTask.title}
                </h2>

                <p className="text-xs text-gray-500 mb-4">
                  Assigned by {selectedTask.creator?.name ?? "Unknown"}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedTask.id, s)}
                      className={`
                        px-3 py-1 text-xs font-medium border rounded-full
                        ${STATUS_COLORS[s]}
                        ${
                          selectedTask.status === s
                            ? "ring-2 ring-offset-1"
                            : ""
                        }
                      `}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <p className="text-sm">
                  <span className="text-gray-500 text-xs">Priority:</span>{" "}
                  {selectedTask.priority}
                </p>

                {selectedTask.dueDate && (
                  <p className="text-sm mt-2">
                    <span className="text-gray-500 text-xs">Due:</span>{" "}
                    {new Date(selectedTask.dueDate).toDateString()}
                  </p>
                )}

                <button
                  onClick={() => completeTask(selectedTask.id)}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark as completed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedToMe;
