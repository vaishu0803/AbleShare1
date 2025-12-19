import { TaskRepository } from "../repositories/task.repository";
import { getIO } from "../socket";

export const TaskService = {
  /* ================= CREATE ================= */
  create: async (userId: number, payload: any) => {
    const task = await TaskRepository.createTask({
      ...payload,
      creatorId: userId,
    });

    const io = getIO();

    // 🔥 Notify ASSIGNED USER
    io.to(`user:${task.assignedToId}`).emit("task:created", task);

    return task;
  },

  /* ================= GET BY VIEW ================= */
  getByView: async (userId: number, view: string) => {
    return TaskRepository.getTasksByView(userId, view);
  },

  /* ================= UPDATE ================= */
  update: async (taskId: number, payload: any) => {
    // ⭐ Get previous data to detect status change
    const previous = await TaskRepository.getTaskById(taskId);

    const task = await TaskRepository.updateTask(taskId, payload);

    const io = getIO();

    // 🔥 Notify ASSIGNED user realtime
    io.to(`user:${task.assignedToId}`).emit("task:updated", task);

    /* ================= STATUS CHANGE NOTIFICATION ================= */
    if (
      payload.status &&           // status field sent
      previous?.status !== task.status // actually changed
    ) {
      io.to(`user:${task.creatorId}`).emit("task:status-changed", {
        taskId: task.id,
        title: task.title,
        from: previous?.status,
        to: task.status,
      });
    }

    return task;
  },

  /* ================= DELETE ================= */
 remove: async (taskId: number) => {
  const deletedTask = await TaskRepository.deleteTask(taskId);

  const io = getIO();

  if (deletedTask) {
    io.to(`user:${deletedTask.assignedToId}`).emit("task:deleted", {
      id: taskId,
    });
  }
   //  Notify assigned user task deleted
    io.to(`user:${deletedTask.assignedToId}`).emit("task:deleted", {
      id: taskId,
    });
     return deletedTask;
  },
};
