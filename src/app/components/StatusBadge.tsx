import { GenerationState } from "../types";

type StatusBadgeProps = {
  status: GenerationState["status"];
  version: number;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  version,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "generating":
        return "bg-yellow-100 text-yellow-800";
      case "Improvments in Progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex fixed right-5 top-8 items-center px-4 py-2 rounded-full text-md font-medium ${getStatusColor()}`}
    >
      {status === "idle" ? "Ready" : `${status} v${version}`}
    </span>
  );
};
