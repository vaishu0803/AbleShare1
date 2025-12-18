import { useEffect, useState } from "react";
import StatCard from "../components/dashboard/StatCard";
import PriorityTasks from "../components/dashboard/PriorityTasks";
import AddTaskModal from "../components/tasks/AddTaskModal";
import { socket } from "../socket";


import {
  ListTodo,
  Star,
  CheckCircle,
  Clock,
} from "lucide-react";

import { fetchTasks } from "../api/tasks";
import type { Task } from "../types/task";

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // ✅ SINGLE source of truth
  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  // fetch on page load
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

  // derived stats
  const total = tasks.length;
  const highPriority = tasks.filter(t => t.priority === "HIGH").length;
  const completed = tasks.filter(t => t.status === "COMPLETED").length;
 const now = new Date();

const overdue = tasks.filter(task => {
  if (!task.dueDate) return false;

  const due = new Date(task.dueDate);
  return due < now && task.status !== "COMPLETED";
}).length;


  return (
    <div className="bg-gray-100 min-h-screen rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6 px-4 xl:px-6 py-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of your tasks
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Task
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Tasks" value={loading ? "-" : String(total)} icon={ListTodo} />
          <StatCard title="High Priority" value={loading ? "-" : String(highPriority)} icon={Star} />
          <StatCard title="Completed Tasks" value={loading ? "-" : String(completed)} icon={CheckCircle} />
          <StatCard title="Overdue Tasks" value={loading ? "-" : String(overdue)} icon={Clock} />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         

          <PriorityTasks tasks={tasks} />

        </div>
      </div>

      {/* MODAL */}
      <AddTaskModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          setOpen(false);
          loadTasks(); // 🔥 THIS IS THE FIX
        }}
      />
    </div>
  );
};

export default Dashboard;
