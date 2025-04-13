import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

const Toast = ({ message, type = "success", duration = 3000, onClose }: ToastProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIconByType = () => {
    switch (type) {
      case "success":
        return "check_circle";
      case "error":
        return "error";
      case "info":
        return "info";
      default:
        return "check_circle";
    }
  };

  const getColorByType = () => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-green-500";
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 flex justify-center items-center px-4 lg:px-0 z-50 pointer-events-none">
      <div className="bg-gray-800 text-white py-2 px-4 rounded-md shadow-lg max-w-md w-full pointer-events-auto flex items-center justify-between">
        <div className="flex items-center">
          <span className={`material-icons mr-2 ${getColorByType()}`}>{getIconByType()}</span>
          <span>{message}</span>
        </div>
        <button className="text-gray-300 hover:text-white" onClick={handleClose}>
          <span className="material-icons">close</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
