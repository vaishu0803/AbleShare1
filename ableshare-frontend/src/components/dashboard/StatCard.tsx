import  type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: ReactNode;   // <-- This works in TSX
  icon: React.ElementType;
};


const StatCard = ({ title, value, icon: Icon }: StatCardProps) => {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        p-5
        min-h-[130px]
        border
        shadow-sm
        hover:shadow-md
        transition
        flex
        flex-col
        justify-between
      "
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500 leading-tight">
          {title}
        </p>

        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-gray-500">
          <Icon size={16} />
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-semibold text-gray-900 leading-none">
        {value}
      </p>
    </div>
  );
};

export default StatCard;
