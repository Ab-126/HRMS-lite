import { toast as sonnerToast } from "sonner";

export function ToastProvider({ children }) {
  // ToastProvider is just a pass-through now, since Toaster is rendered in App.js
  return <>{children}</>;
}

export function useToast() {
  const toast = (message, type = "info") => {
    if (type === "success") {
      sonnerToast.success(message);
    } else if (type === "error") {
      sonnerToast.error(message);
    } else {
      sonnerToast(message);
    }
  };

  return { toast, dismiss: sonnerToast.dismiss };
}