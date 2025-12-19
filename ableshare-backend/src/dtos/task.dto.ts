import { z } from "zod";

export const CreateTaskDto = z.object({
  title: z.string().min(3, "Title must be atleast 3 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
  dueDate: z.string().nullable().optional(),
  assignedToId: z.number(),
});

export const UpdateTaskDto = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
  dueDate: z.string().nullable().optional(),
});
