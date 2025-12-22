import { Request, Response } from "express";
import { TaskService } from "../services/task.service";
import { TaskRepository } from "../repositories/task.repository";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";


export const TaskController = {
  /* ================= CREATE TASK ================= */
createTask: async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validated = CreateTaskDto.parse(req.body);

    const task = await TaskService.create(req.user.id, {
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
    });

    return res.status(201).json(task);
  } catch (err: any) {
    console.error("Create Task Failed", err);

    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation Failed",
        errors: err.errors,
      });
    }

    res.status(500).json({ message: "Failed to create task" });
  }
},


  /* ================= GET TASKS ================= */
  getTasks: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const view = (req.query.view as string) || "all";

      const tasks = await TaskService.getByView(req.user.id, view);
      res.json(tasks);
    } catch (err) {
      console.error("Get Tasks Failed", err);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  },

  /* ================= UPDATE TASK ================= */
 updateTask: async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    let body = { ...req.body };

    //  If status is empty string → remove it so Prisma won't complain
    if (body.status === "" || body.status === null) {
      delete body.status;
    }

    //  If assignedToId comes empty → set it null (optional field)
    if (body.assignedToId === "" || body.assignedToId === null) {
      body.assignedToId = null;
    }

  // Validate first (keep dueDate as string/null)
const validated = UpdateTaskDto.parse(body);

const payload: any = { ...validated };

if (validated.dueDate) {
  payload.dueDate = new Date(validated.dueDate);
}

const task = await TaskService.update(taskId, payload);



    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.json({
      success: true,
      data: task,
    });
  } catch (err: any) {
    console.error("Update Task Failed", err);

    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: err.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
},


  search: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const q = (req.query.q as string) || "";

    if (!q.trim()) {
      return res.json([]);
    }

    const tasks = await TaskRepository.searchTasks(req.user!.id, q);
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: "Search failed" });
  }
},


  /* ================= DELETE TASK ================= */
  deleteTask: async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const taskId = Number(req.params.id);

    const deleted = await TaskService.remove(taskId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.error("Delete Task Failed", err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
},

};
