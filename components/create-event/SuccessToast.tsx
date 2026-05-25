"use client";

import { useEffect } from "react";

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

const SuccessToast = ({
  message,
  visible,
  onDismiss,
  duration = 3200,
}: SuccessToastProps) => {
  useEffect(() => {
    if (!visible) return;

    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none"
      aria-hidden={!visible}
    >
      <div
        role="status"
        aria-live="polite"
        className="toast-enter w-full max-w-md glass border border-dark-200 rounded-[10px] px-5 py-3.5 text-center shadow-[0px_4px_40px_0px_#5dfeca33]"
      >
        <p className="text-light-100 text-sm sm:text-base font-medium">{message}</p>
      </div>
    </div>
  );
};

export default SuccessToast;
