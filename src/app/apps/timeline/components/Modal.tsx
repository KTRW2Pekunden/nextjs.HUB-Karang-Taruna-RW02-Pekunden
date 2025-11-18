import { X } from "lucide-react";
import {
  COLOR_BG_DARK,
  COLOR_BORDER_DARK,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
} from "../constants";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(28, 31, 36, 0.8)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl relative"
        style={{
          backgroundColor: COLOR_BG_DARK,
          border: `1px solid ${COLOR_BORDER_DARK}`,
          color: COLOR_TEXT_PRIMARY,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-4 border-b flex justify-between items-center"
          style={{ borderColor: COLOR_BORDER_DARK }}
        >
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700/50 transition"
          >
            <X className="w-5 h-5" style={{ color: COLOR_TEXT_SECONDARY }} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
