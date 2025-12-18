import api from "./axios";

export const fetchTasks = async (view?: string) => {
  const query = view ? `?view=${view}` : "";
  const res = await api.get(`/tasks${query}`);
  return res.data;
};
