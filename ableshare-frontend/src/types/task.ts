export type Task = {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  priority?: string;
  status: string;

  creatorId: number;
  assignedToId: number;

  creator?: {
    id: number;
    name: string;
    email: string;
  };
};
