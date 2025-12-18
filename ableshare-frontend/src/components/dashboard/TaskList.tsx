import type { Task } from "../../types/task";

type Props = {
  tasks: Task[];
};

const TaskList = ({ tasks }: Props) => {
  if (!tasks.length) {
    return (
      <div className="bg-white rounded-xl p-6 text-center text-gray-500">
        No tasks found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm divide-y">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-4 flex items-center justify-between"
        >
          <div>
            <h3 className="font-medium text-gray-900">
              {task.title}
            </h3>
            <p className="text-sm text-gray-500">
              {task.description}
            </p>
          </div>

          <span
            className={`
              px-3 py-1 text-xs rounded-full
              ${
                task.priority === "HIGH"
                  ? "bg-red-100 text-red-600"
                  : task.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-green-100 text-green-600"
              }
            `}
          >
            {task.priority}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
