import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string(),
  assignedToId: z.string(), // "self"
});

export type TaskFormData = z.infer<typeof taskSchema>;
