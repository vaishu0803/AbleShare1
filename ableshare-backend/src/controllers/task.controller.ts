import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

export const TaskController = {
  createTask: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, dueDate, priority, assignedToId } = req.body;

    const task = await TaskService.create(req.user.id, {
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
      assignedToId: assignedToId ?? null,
    });

    res.status(201).json(task);
  },

  getTasks: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const view = req.query.view as string;
    const tasks = await TaskService.getByView(req.user.id, view);
    res.json(tasks);
  },

  updateTask: async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);

    if (req.body.dueDate) {
      req.body.dueDate = new Date(req.body.dueDate);
    }

    const task = await TaskService.update(taskId, req.body);
    res.json(task);
  },

  deleteTask: async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);
    await TaskService.remove(taskId);
    res.status(204).send();
  },
};
