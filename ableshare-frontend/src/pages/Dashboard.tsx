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

import api from "../api/axios";
import type { Task } from "../types/task";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useState, useEffect } from "react";

/* ---------- FETCH ---------- */
const fetchTasks = async (): Promise<Task[]> => {
  const res = await api.get("/tasks");
  return res.data;
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  /* ---------- REACT QUERY ---------- */
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "all"],
    queryFn: fetchTasks,
  });

  /* ---------- SOCKET LIVE UPDATES ---------- */
  useEffect(() => {
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", "all"] });

    socket.on("task:created", invalidate);
    socket.on("task:updated", invalidate);
    socket.on("task:deleted", invalidate);

    return () => {
      socket.off("task:created", invalidate);
      socket.off("task:updated", invalidate);
      socket.off("task:deleted", invalidate);
    };
  }, [queryClient]);

  /* ---------- STATS ---------- */
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
       <div className="
  flex flex-col sm:flex-row 
  sm:items-center sm:justify-between 
  gap-3
">
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
    className="
      bg-green-600 hover:bg-green-700 
      text-white 
      px-4 py-2 
      rounded-lg 
      text-sm font-medium 
      self-start sm:self-auto
    "
  >
    + Add Task
  </button>
</div>


        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Tasks" value ={
  isLoading ? (
    <div className="h-5 w-10 bg-gray-300 rounded animate-pulse"></div>
  ) : (
    String(total)
  )
}
 icon={ListTodo} />
          <StatCard title="High Priority" value ={
  isLoading ? (
    <div className="h-5 w-10 bg-gray-300 rounded animate-pulse"></div>
  ) : (
    String(highPriority)
  )
} icon={Star} />
          <StatCard title="Completed Tasks" value ={
  isLoading ? (
    <div className="h-5 w-10 bg-gray-300 rounded animate-pulse"></div>
  ) : (
    String(completed)
  )
} icon={CheckCircle} />
          <StatCard title="Overdue Tasks" value ={
  isLoading ? (
    <div className="h-5 w-10 bg-gray-300 rounded animate-pulse"></div>
  ) : (
    String(overdue)
  )
} icon={Clock} />
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
          queryClient.invalidateQueries({ queryKey: ["tasks", "all"] });
        }}
      />
    </div>
  );
};

export default Dashboard;
