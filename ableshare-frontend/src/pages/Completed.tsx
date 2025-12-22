import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { Task } from "../types/task";
import { useEffect } from "react";
import { socket } from "../socket";

const fetchTasks = async (): Promise<Task[]> => {
  const res = await api.get("/tasks");
  return res.data;
};

const Completed = () => {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "completed"],
    queryFn: fetchTasks,
  });

  /* ---------- LIVE UPDATES ---------- */
  useEffect(() => {
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", "completed"] });

    socket.on("task:updated", invalidate);
    socket.on("task:created", invalidate);
    socket.on("task:deleted", invalidate);

    return () => {
      socket.off("task:updated", invalidate);
      socket.off("task:created", invalidate);
      socket.off("task:deleted", invalidate);
    };
  }, [queryClient]);

  const completed = tasks.filter(t => t.status === "COMPLETED");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Completed Tasks</h1>

      {isLoading && <p>Loading...</p>}

      {completed.length === 0 && (
        <p className="text-gray-500">No completed tasks yet.</p>
      )}

      <div className="space-y-3">
        {completed.map(task => (
          <div
            key={task.id}
            className="border bg-gray-50 rounded-lg p-4 flex flex-col gap-1"
          >
            <span className="font-semibold text-gray-800">{task.title}</span>

            <div className="text-sm text-gray-500">
              Priority: {task.priority}
            </div>

            {task.dueDate && (
              <div className="text-xs text-gray-400">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Completed;
