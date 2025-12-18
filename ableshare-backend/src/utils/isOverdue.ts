export const isOverdue = (dueDate: string | Date | null, status: string) => {
  if (!dueDate) return false;
  if (status === "COMPLETED") return false;

  return new Date(dueDate) < new Date();
};
