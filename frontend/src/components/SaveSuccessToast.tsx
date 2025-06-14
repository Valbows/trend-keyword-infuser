import React, { useEffect, useState } from 'react';

interface SaveSuccessToastProps {
  message: string | null;
  duration?: number; // Duration in milliseconds
}

const SaveSuccessToast: React.FC<SaveSuccessToastProps> = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, duration]);

  if (!visible || !message) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg animate-pulse z-50">
      {message}
    </div>
  );
};

export default SaveSuccessToast;
