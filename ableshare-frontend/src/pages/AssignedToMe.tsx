import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../api/axios";
import type { Task } from "../types/task";
import { Check } from "lucide-react";
import { socket } from "../socket";

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const detailRef = useRef<HTMLDivElement | null>(null);

  /* ---------- LOAD ---------- */
  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks?view=assigned");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load assigned tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    socket.on("task:created", loadTasks);
    socket.on("task:updated", loadTasks);

    return () => {
      socket.off("task:created", loadTasks);
      socket.off("task:updated", loadTasks);
    };
  }, []);

  /* ---------- CLICK OUTSIDE ---------- */
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
      await loadTasks();

      if (status === "COMPLETED") setSelectedTask(null);
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  /* ---------- COMPLETE ---------- */
  const completeTask = async (taskId: number) => {
    try {
      setCompletingId(taskId);
      await updateStatus(taskId, "COMPLETED");

      setTimeout(() => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setCompletingId(null);
      }, 350);
    } catch {
      setCompletingId(null);
    }
  };

  /* ---------- SORT ---------- */
  const visibleTasks = [...tasks]
    .map(t => ({ ...t, overdue: isOverdue(t) }))
    .sort((a, b) => {
      if (a.overdue && !b.overdue) return -1;
      if (!a.overdue && b.overdue) return 1;
      return new Date(a.dueDate || "").getTime() -
        new Date(b.dueDate || "").getTime();
    });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 py-6 relative">

          {/* LEFT LIST */}
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Assigned to me</h1>
            <p className="text-sm text-gray-500 mb-4">
              Tasks assigned by others
            </p>

            {!loading && visibleTasks.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                Tasks assigned to you will show up here
              </div>
            )}

            <div className="space-y-2">
              {visibleTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`flex items-center gap-3 bg-white rounded-md px-3 py-2 cursor-pointer border
                    ${task.overdue ? "border-red-400 bg-red-50" : ""}
                    ${selectedTask?.id === task.id ? "border-green-500" : "border-transparent"}
                  `}
                >

                  {/* RADIO → COMPLETE */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      completeTask(task.id);
                    }}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center
                      ${completingId === task.id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-400 hover:border-green-600"}
                    `}
                  >
                    {completingId === task.id && (
                      <Check className="w-3 h-3 text-green-600" />
                    )}
                  </button>

                  {/* TEXT */}
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>

                    {task.overdue && (
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

              {/* STATUS BUTTONS */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selectedTask.id, s)}
                    className={`
                      px-3 py-1 text-xs font-medium border rounded-full
                      ${STATUS_COLORS[s]}
                      ${selectedTask.status === s ? "ring-2 ring-offset-1" : ""}
                    `}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* PRIORITY */}
              <p className="text-sm">
                <span className="text-gray-500 text-xs">Priority:</span>{" "}
                {selectedTask.priority}
              </p>

              {/* DUE DATE */}
              {selectedTask.dueDate && (
                <p className="text-sm mt-2">
                  <span className="text-gray-500 text-xs">Due:</span>{" "}
                  {new Date(selectedTask.dueDate).toDateString()}
                </p>
              )}

              {/* COMPLETE BUTTON */}
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
  );
};

export default AssignedToMe;
