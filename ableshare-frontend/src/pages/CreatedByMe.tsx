import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../api/axios";
import type { Task } from "../types/task";
import AddTaskModal from "../components/tasks/AddTaskModal";
import TaskDetailPanel from "../components/tasks/TaskDetailPanel";
import { socket } from "../socket";
import { useSearchParams } from "react-router-dom";

const isOverdue = (task: Task) => {
  if (!task.dueDate) return false;
  if (task.status === "COMPLETED") return false;
  return new Date(task.dueDate) < new Date();
};

const CreatedByMe = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  const desktopRef = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);

  const [params] = useSearchParams();

  /* ---------- LOAD TASKS ---------- */
  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks?view=created");
      setTasks(res.data);
    } catch {
      console.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* ---------- SOCKET LIVE ---------- */
  useEffect(() => {
    socket.on("task:created", loadTasks);
    socket.on("task:updated", loadTasks);
    socket.on("task:deleted", loadTasks);

    return () => {
      socket.off("task:created", loadTasks);
      socket.off("task:updated", loadTasks);
      socket.off("task:deleted", loadTasks);
    };
  }, []);

  /* ---------- AUTO OPEN TASK FROM SEARCH ---------- */
  useEffect(() => {
    const id = params.get("task");
    if (!id) return;

    const task = tasks.find(t => t.id === Number(id));
    if (task) setSelectedTask(task);
  }, [tasks, params]);

  /* ---------- CLICK OUTSIDE CLOSE PANEL ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (desktopRef.current?.contains(e.target as Node)) return;
      if (mobileRef.current?.contains(e.target as Node)) return;
      setSelectedTask(null);
    };

    if (selectedTask) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedTask]);

  /* ---------- FILTER + SORT ---------- */
  const visibleTasks = [...tasks]
    .filter(task => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false;
      return true;
    })
    .map(t => ({ ...t, overdue: isOverdue(t) }))
    .sort((a, b) => {
      const aDate = new Date(a.dueDate || "").getTime();
      const bDate = new Date(b.dueDate || "").getTime();
      return sortOrder === "ASC" ? aDate - bDate : bDate - aDate;
    });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex flex-col gap-4 px-4 lg:px-6 py-6">

          {/* FILTER BAR */}
          <div className="flex flex-wrap gap-4 lg:gap-6">

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
              onChange={e => setSortOrder(e.target.value as "ASC" | "DESC")}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="ASC">Due Date ↑</option>
              <option value="DESC">Due Date ↓</option>
            </select>
          </div>

          {/* MAIN SECTION */}
          <div className="flex gap-6 pb-6 h-[calc(100vh-140px)]">

            {/* LEFT LIST */}
            <div className="flex-1 overflow-y-auto pr-2">

              <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-100 py-2 z-10">
                <h1 className="text-xl font-semibold">Created By Me</h1>

                <button
                  onClick={() => setOpenCreate(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  + Create Task
                </button>
              </div>

              {!loading && visibleTasks.length === 0 && (
                <p className="text-gray-400 text-center mt-20">No tasks found</p>
              )}

              {loading && (
  <div className="space-y-3 mt-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-white px-4 py-4 rounded-md border"
      >
        <div className="h-3 w-48 bg-gray-300 rounded mb-2"></div>
        <div className="h-2 w-24 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
)}


              <div className="space-y-2 pb-10">
                {visibleTasks.map(task => (
                  <div key={task.id}>
                    <div
                      onClick={() =>
                        setSelectedTask(
                          selectedTask?.id === task.id ? null : task
                        )
                      }
                      className={`
                        bg-white px-4 py-3 rounded-md cursor-pointer border transition
                        ${task.overdue ? "border-red-400 bg-red-50" : ""}
                        ${
                          selectedTask?.id === task.id
                            ? "border-green-500"
                            : "border-transparent"
                        }
                      `}
                    >
                      <p className="font-medium">{task.title}</p>

                      <p className="text-xs text-gray-400">
                        Priority: {task.priority}
                      </p>

                      {task.overdue && (
                        <p className="text-xs text-red-600 font-medium">
                          Overdue
                        </p>
                      )}
                    </div>

                    {/* MOBILE PANEL */}
                    {selectedTask?.id === task.id && (
                      <div ref={mobileRef} className="lg:hidden mt-2">
                        <TaskDetailPanel
                          task={selectedTask}
                          onClose={() => setSelectedTask(null)}
                          onUpdated={loadTasks}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DESKTOP PANEL */}
            <div
              ref={desktopRef}
              className="hidden lg:block w-[360px] sticky top-24 h-fit"
            >
              {selectedTask ? (
                <TaskDetailPanel
                  task={selectedTask}
                  onClose={() => setSelectedTask(null)}
                  onUpdated={loadTasks}
                />
              ) : (
                <div className="text-gray-400 text-center mt-32">
                  Select a task to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      <AddTaskModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadTasks}
      />
    </div>
  );
};

export default CreatedByMe;
