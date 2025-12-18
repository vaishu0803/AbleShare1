import { PrismaClient, Priority, Status } from "@prisma/client";

const prisma = new PrismaClient();

export const TaskRepository = {
  // =========================
  // CREATE TASK
  // =========================
  createTask: async (data: {
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    assignedToId: number;
    creatorId: number;
  }) => {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,

        // ✅ relation-safe (CORRECT)
        creator: {
          connect: { id: data.creatorId },
        },
        assignedTo: {
          connect: { id: data.assignedToId },
        },
      },

      // ✅ return relations to frontend
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  // =========================
  // GET TASKS BY VIEW
  // =========================
  getTasksByView: async (userId: number, view: string) => {
    const today = new Date();

    const baseInclude = {
      creator: {
        select: { id: true, name: true, email: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    };

    if (view === "assigned") {
  return prisma.task.findMany({
    where: {
      assignedToId: userId,
      status: {
        not: Status.COMPLETED, // 🔥 THIS LINE
      },
    },
    orderBy: { dueDate: "asc" },
     include: baseInclude,
  });
}


   if (view === "created") {
  return prisma.task.findMany({
    where: {
      creatorId: userId,
      status: {
        not: Status.COMPLETED,
      },
    },
    orderBy: { dueDate: "asc" },
     include: baseInclude,
  });
}


    if (view === "overdue") {
      return prisma.task.findMany({
        where: {
          dueDate: { lt: today },
          status: { not: Status.COMPLETED },
        },
        orderBy: { dueDate: "asc" },
        include: baseInclude,
      });
    }

    return prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: baseInclude,
    });
  },

    getById: async (id: number) => {
    return prisma.task.findUnique({
      where: { id },
    });
  },

  // =========================
  // UPDATE TASK
  // =========================
  updateTask: async (id: number, data: any) => {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
  },

  // =========================
  // DELETE TASK
  // =========================
  deleteTask: async (id: number) => {
    return prisma.task.delete({
      where: { id },
    });
  },
};
