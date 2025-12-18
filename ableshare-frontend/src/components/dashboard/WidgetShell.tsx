import type { ReactNode } from 'react';


interface WidgetShellProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const WidgetShell = ({ title, children, className = "" }: WidgetShellProps) => {
  return (
    <div
  className={`
    bg-white rounded-xl p-5 border border-gray-100
    transition-all duration-300 ease-out
    hover:shadow-xl hover:-translate-y-1
    hover:border-blue-200
    relative overflow-hidden
    ${className}
  `}
>
  {/* Accent bar */}
  <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition" />

      {title && (
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default WidgetShell;
