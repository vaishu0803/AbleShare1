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

    const validated = UpdateTaskDto.parse(req.body);

    if (validated.dueDate) {
      validated.dueDate = new Date(validated.dueDate) as any;
    }

    const task = await TaskService.update(taskId, validated);

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
      const taskId = Number(req.params.id);

      await TaskService.remove(taskId);

      res.json({ message: "Task deleted" });
    } catch (err) {
      console.error("Delete Task Failed", err);
      res.status(500).json({ message: "Failed to delete task" });
    }
  },
};
