import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import {authMiddleware } from "../middlewares/auth.middleware";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import { validateDto } from "../middlewares/validateDto";


const router = Router();

router.post("/", authMiddleware, TaskController.createTask);
router.get("/", authMiddleware, TaskController.getTasks);
router.put("/:id", authMiddleware, TaskController.updateTask);
router.patch("/:id", authMiddleware, TaskController.updateTask);
router.delete("/:id", authMiddleware, TaskController.deleteTask);
router.post("/", validateDto(CreateTaskDto), TaskController.createTask);
router.put("/:id", validateDto(UpdateTaskDto), TaskController.updateTask);

router.get("/search", authMiddleware, TaskController.search);

export default router;
