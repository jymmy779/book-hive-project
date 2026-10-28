interface LoadingProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const Loading = ({
  fullScreen = false,
  size = "md",
  text = "Đang tải...",
}: LoadingProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-4 border-border border-t-primary rounded-full animate-spin`}
      />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface-cream flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>;
};
