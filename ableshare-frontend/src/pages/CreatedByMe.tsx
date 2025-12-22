import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../api/axios";
import { socket } from "../socket";
import type { Task } from "../types/task";

import {
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

/* ---------- FETCH ---------- */
const fetchTasks = async (): Promise<Task[]> => {
  const res = await api.get("/tasks?view=completed");
  return res.data;
};

const Completed = () => {
  const queryClient = useQueryClient();

  const desktopRef = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  /* ---------- REACT QUERY ---------- */
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "completed"],
    queryFn: fetchTasks,
  });

  /* ---------- SOCKET LIVE ---------- */
  useEffect(() => {
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", "completed"] });

    socket.on("task:updated", invalidate);
    socket.on("task:deleted", invalidate);
    socket.on("task:created", invalidate);

    return () => {
      socket.off("task:updated", invalidate);
      socket.off("task:deleted", invalidate);
      socket.off("task:created", invalidate);
    };
  }, [queryClient]);

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex flex-col gap-4 px-4 lg:px-6 py-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">
              Completed Tasks
            </h1>
          </div>

          {/* MAIN SECTION */}
          <div
            className="
              flex pb-6 gap-4
              flex-col
              lg:flex-row
              h-auto lg:h-[calc(100vh-140px)]
              overflow-hidden
            "
          >

            {/* LEFT LIST */}
            <div className="flex-1 overflow-y-auto pr-2">

              {/* LOADER */}
              {isLoading && (
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

              {/* EMPTY */}
              {!isLoading && tasks.length === 0 && (
                <p className="text-gray-400 text-center mt-20">
                  No completed tasks yet
                </p>
              )}

              {/* TASK LIST */}
              <div className="space-y-2 pb-10">
                {tasks.map(task => (
                  <div key={task.id}>
                    <div
                      onClick={() =>
                        setSelectedTask(
                          selectedTask?.id === task.id ? null : task
                        )
                      }
                      className={`
                        bg-white px-4 py-3 rounded-md cursor-pointer border transition
                        ${
                          selectedTask?.id === task.id
                            ? "border-green-500"
                            : "border-transparent"
                        }
                      `}
                    >
                      <p className="font-medium">
                        {task.title}
                      </p>

                      <p className="text-xs text-gray-400">
                        Completed ✔️
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL (DESKTOP) */}
            <div
              ref={desktopRef}
              className="hidden lg:block w-[360px] sticky top-24 h-fit"
            >
              {selectedTask ? (
                <div className="bg-white border rounded-md p-4">
                  <p className="font-semibold">{selectedTask.title}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedTask.description || "No description"}
                  </p>

                  <p className="mt-3 text-green-600 text-sm font-medium">
                    Status: Completed
                  </p>
                </div>
              ) : (
                <div className="text-gray-400 text-center mt-32">
                  Select a task to view details
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Completed;
