import { AlertTriangle, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Task } from "../../types/task";

/* ---------- URGENCY TYPE ---------- */
type Urgency = "overdue" | "high" | "today";

/* ---------- URGENCY ORDER (TS SAFE) ---------- */
const urgencyOrder: Record<Urgency, number> = {
  overdue: 1,
  high: 2,
  today: 3,
};

/* ---------- URGENCY UI ---------- */
const urgencyUI: Record<
  Urgency,
  { bar: string; badge: string; label: string }
> = {
  overdue: {
    bar: "bg-red-500",
    badge: "bg-red-50 text-red-600",
    label: "Overdue",
  },
  high: {
    bar: "bg-orange-400",
    badge: "bg-orange-50 text-orange-600",
    label: "High priority",
  },
  today: {
    bar: "bg-amber-400",
    badge: "bg-amber-50 text-amber-600",
    label: "Due today",
  },
};

/* ---------- CALCULATE URGENCY ---------- */
const getUrgency = (task: Task): Urgency | null => {
  if (!task.dueDate || task.status === "COMPLETED") return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);

  // 🔴 Overdue = date strictly less than today
  if (due < today) return "overdue";

  // 🟡 Due today
  if (due.getTime() === today.getTime()) return "today";

  // 🟠 High priority (future)
  if (task.priority === "HIGH") return "high";

  return null;
};

interface PriorityTasksProps {
  tasks: Task[];
}

const PriorityTasks = ({ tasks }: PriorityTasksProps) => {
  const navigate = useNavigate();

  /* ---------- DERIVED PRIORITY TASKS ---------- */
  const priorityTasks = useMemo(() => {
    return tasks
      .map((task) => {
        const urgency = getUrgency(task);
        if (!urgency) return null;

        return {
          ...task,
          urgency,
        };
      })
      .filter(
        (t): t is Task & { urgency: Urgency } => t !== null
      )
      .sort(
        (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      )
      .slice(0, 6); // keep widget compact
  }, [tasks]);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-500" />
          <h3 className="text-sm font-semibold text-gray-800">
            High Priority Tasks
          </h3>
        </div>

        <button
          onClick={() => navigate("/assigned")}
          className="text-xs text-green-600 hover:underline"
        >
          View all
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
        {priorityTasks.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">
            No priority tasks 🎉
          </p>
        )}

        {priorityTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => navigate(`/tasks/${task.id}`)}
            className="
              group flex items-center gap-3
              p-3 rounded-lg
              cursor-pointer
              border border-transparent
              hover:border-gray-200
              hover:bg-gray-50
              transition-all
            "
          >
            {/* LEFT BAR */}
            <div
              className={`w-1 h-10 rounded-full ${
                urgencyUI[task.urgency].bar
              }`}
            />

            {/* TITLE */}
            <p className="flex-1 text-sm font-medium text-gray-800">
              {task.title}
            </p>

            {/* BADGE */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap
                ${urgencyUI[task.urgency].badge}`}
            >
              {urgencyUI[task.urgency].label}
            </span>

            {/* ARROW */}
            <ChevronRight
              size={16}
              className="
                text-gray-400
                opacity-0
                group-hover:opacity-100
                group-hover:translate-x-1
                transition
              "
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityTasks;
