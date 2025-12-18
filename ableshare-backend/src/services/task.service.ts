import { TaskRepository } from "../repositories/task.repository";
import { getIO } from "../socket";

export const TaskService = {
  create: async (userId: number, payload: any) => {
    const task = await TaskRepository.createTask({
      ...payload,
      creatorId: userId,
    });

    const io = getIO();

    // 🔔 SOCKET: ONLY notify ASSIGNEE (if not creator)
    if (task.assignedToId !== task.creatorId) {
      io.emit("task:notification", {
        action: "ASSIGNED",
        taskId: task.id,
        title: task.title,
        assignedToId: task.assignedToId,
        creatorId: task.creatorId,
      });
    }

    return task;
  },

  getByView: async (userId: number, view: string) => {
    return TaskRepository.getTasksByView(userId, view);
  },

  update: async (taskId: number, payload: any) => {
    const task = await TaskRepository.updateTask(taskId, payload);
    const io = getIO();

    // 🔔 SOCKET: notify OTHER users about update
    io.emit("task:notification", {
      action: "UPDATED",
      taskId: task.id,
      title: task.title,
      assignedToId: task.assignedToId,
      creatorId: task.creatorId,
      updatedFields: Object.keys(payload),
    });

    return task;
  },

  remove: async (taskId: number) => {
    await TaskRepository.deleteTask(taskId);

    const io = getIO();
    io.emit("task:notification", {
      action: "DELETED",
      taskId,
    });
  },
};
