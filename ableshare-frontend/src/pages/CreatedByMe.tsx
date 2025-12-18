import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../api/axios";
import type { Task } from "../types/task";
import AddTaskModal from "../components/tasks/AddTaskModal";
import TaskDetailPanel from "../components/tasks/TaskDetailPanel";
import { socket } from "../socket";

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

  const desktopRef = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);

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

  // CLICK OUTSIDE CLOSE
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        desktopRef.current &&
        desktopRef.current.contains(e.target as Node)
      ) return;

      if (
        mobileRef.current &&
        mobileRef.current.contains(e.target as Node)
      ) return;

      setSelectedTask(null);
    };

    if (selectedTask) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedTask]);

  const visibleTasks = [...tasks].sort((a, b) => {
    const aOver = isOverdue(a);
    const bOver = isOverdue(b);

    if (aOver && !bOver) return -1;
    if (!aOver && bOver) return 1;

    return (
      new Date(a.dueDate || "").getTime() -
      new Date(b.dueDate || "").getTime()
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex gap-6 px-4 lg:px-6 pb-6 h-[calc(100vh-88px)]">

          {/* LEFT LIST */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-100 py-2 z-10">
              <h1 className="text-xl font-semibold">Created by me</h1>

              <button
                onClick={() => setOpenCreate(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md"
              >
                + Create Task
              </button>
            </div>

            {!loading && visibleTasks.length === 0 && (
              <p className="text-gray-400 text-center mt-20">
                No tasks created yet
              </p>
            )}

            <div className="space-y-2 pb-10">
              {visibleTasks.map((task) => {
                const overdue = isOverdue(task);

                return (
                  <div key={task.id}>
                    {/* TASK CARD */}
                    <div
                      onClick={() =>
                        setSelectedTask(
                          selectedTask?.id === task.id ? null : task
                        )
                      }
                      className={`bg-white px-4 py-3 rounded-md cursor-pointer border transition
                        ${overdue ? "border-red-400 bg-red-50" : ""}
                        ${
                          selectedTask?.id === task.id
                            ? "border-green-500"
                            : "border-transparent"
                        }`}
                    >
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-gray-400">
                        Priority: {task.priority}
                      </p>

                      {overdue && (
                        <p className="text-xs text-red-600 font-medium">
                          Overdue
                        </p>
                      )}
                    </div>

                    {/* MOBILE DETAILS BELOW TASK */}
                    {selectedTask?.id === task.id && (
                      <div
                        ref={mobileRef}
                        className="lg:hidden mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TaskDetailPanel
                          task={selectedTask}
                          onClose={() => setSelectedTask(null)}
                          onUpdated={loadTasks}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DESKTOP RIGHT PANEL */}
          <div
            ref={desktopRef}
            className="hidden lg:block w-[360px] sticky top-24 h-fit"
            onClick={(e) => e.stopPropagation()}
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

      <AddTaskModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadTasks}
      />
    </div>
  );
};

export default CreatedByMe;
