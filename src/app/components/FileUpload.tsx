import { useEdgeStore } from "@/lib/edgestore";
import React from "react";

interface FileUploadProps {
  label: string;
  accept?: string;
  setImageUrl: (url: string) => void;
  imageUrl: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = "image/*",
  setImageUrl,
  imageUrl,
  className = "",
}) => {
  const { edgestore } = useEdgeStore();
  const [file, setFile] = React.useState<File>();
  const handleUpload = async () => {
    if (!file) return;
    if (imageUrl === "") {
      const res = await edgestore.publicFiles.upload({
        file,
      });
      setImageUrl(res.url);
    } else {
      const res = await edgestore.publicFiles.upload({
        file,
        options: {
          replaceTargetUrl: imageUrl,
        },
      });
      setImageUrl(res.url);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => setFile(e.target.files?.[0])}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        className="mt-2 bg-blue-500 text-white p-2 rounded"
        onClick={handleUpload}
      >
        Upload
      </button>
    </div>
  );
};
