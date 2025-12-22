import { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Task } from "../../types/task";
import toast from "react-hot-toast";

type User = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  task: Task;
  onClose: () => void;
  onUpdated: () => void;
};

const TaskDetailPanel = ({ task, onClose, onUpdated }: Props) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split("T")[0] : ""
  );

  const [assignedToId, setAssignedToId] = useState(
    task.assignedToId ?? task.creatorId
  );

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  /* ------------ Load Users ------------ */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    loadUsers();
  }, []);

  /* ------------ SAVE ------------ */
  const handleSave = async () => {
    try {
      setLoading(true);

      await api.put(`/tasks/${task.id}`, {
        title,
        description,
        priority,
        dueDate,
        assignedToId,
      });

      toast.success("Task updated successfully");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  /* ------------ DELETE ------------ */
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success("Task deleted");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div
      className="
        bg-white border rounded-lg p-4 
        w-full max-w-sm        /* responsive width */
        mx-auto lg:mx-0        /* center only on mobile */
        h-fit
      "
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Task details</h2>
        <button onClick={onClose} className="text-gray-400">
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <input
          className="w-full border rounded-md px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border rounded-md px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full border rounded-md px-3 py-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        <input
          type="date"
          className="w-full border rounded-md px-3 py-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          className="w-full border rounded-md px-3 py-2"
          value={assignedToId}
          onChange={(e) => setAssignedToId(Number(e.target.value))}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>

        {/* SAVE */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="
            bg-green-600 text-white font-medium rounded-md
            w-full sm:w-auto
            text-sm sm:text-base
            py-2 sm:py-2.5
          "
        >
          Save changes
        </button>

        {/* DELETE */}
        <button
          onClick={handleDelete}
          className="
            bg-red-600 text-white font-medium rounded-md
            w-full sm:w-auto
            text-sm sm:text-base
            py-2 sm:py-2.5
          "
        >
          Delete Task
        </button>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
