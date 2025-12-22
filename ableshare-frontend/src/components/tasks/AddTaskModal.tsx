import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

/* ---------------- SCHEMA ---------------- */
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
  assignedToId: z.number(),   // back to normal number
});

type TaskFormData = z.infer<typeof taskSchema>;

type AddTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type UserOption = {
  id: number;
  name: string;
};

const AddTaskModal = ({ open, onClose, onCreated }: AddTaskModalProps) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserOption[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      assignedToId: user?.id ?? 0,
    },
  });

  /* Default assign to logged-in user */
  useEffect(() => {
    if (open && user) {
      setValue("assignedToId", user.id);
    }
  }, [open, user, setValue]);

  /* Fetch All Users */
  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, [open]);

  if (!open) return null;

  /* Cancel */
  const onCancel = () => {
    reset({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      assignedToId: user?.id ?? 0,
    });
    onClose();
  };

  /* Submit */
  const onSubmit = async (data: TaskFormData) => {
    try {
      await api.post("/tasks", {
        ...data,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : null,
      });

      toast.success("Task created successfully");

      reset();
      onClose();
      onCreated();
    } catch (err) {
      console.error("Create task failed", err);
      toast.error("Failed to create task");
    }
  };

  /* ---------------- UI ---------------- */
 return (
  <>
    {/* Overlay */}
    <div className="fixed inset-0 bg-black/30 z-50" />

    {/* Modal */}
    <div className="fixed inset-0 flex items-center justify-center z-60">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">

          <h2 className="text-lg font-semibold">Add Task</h2>

          {/* TITLE */}
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Title"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}

          {/* DESCRIPTION */}
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Description"
            {...register("description")}
          />

          {/* ASSIGN TO — FIXED DROPDOWN */}
          <select
            className="w-full border rounded-lg px-3 py-2 relative z-[9999]"
            {...register("assignedToId", { valueAsNumber: true })}
          >
            {user && (
              <option value={user.id}>Assign to myself</option>
            )}

            {users
              .filter((u) => u.id !== user?.id)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>

          {/* PRIORITY */}
          <select
            className="w-full border rounded-lg px-3 py-2 relative z-[9999]"
            {...register("priority")}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          {/* DUE DATE */}
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2"
            {...register("dueDate")}
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onCancel} className="text-gray-500">
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTaskModal;
