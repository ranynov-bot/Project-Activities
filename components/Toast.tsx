import React, { useEffect, useMemo } from 'react';
import { Notification } from '../types';
import CheckIcon from './icons/CheckIcon';
import InfoIcon from './icons/InfoIcon';
import WarningIcon from './icons/WarningIcon';
import ErrorIcon from './icons/ErrorIcon';
import CloseIcon from './icons/CloseIcon';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const NOTIFICATION_TIMEOUT = 5000; // 5 seconds

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, NOTIFICATION_TIMEOUT);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const { icon, colorClasses } = useMemo(() => {
    switch (notification.type) {
      case 'success':
        return {
          icon: <CheckIcon className="w-6 h-6" />,
          colorClasses: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 border-green-400 dark:border-green-600',
        };
      case 'warning':
        return {
          icon: <WarningIcon className="w-6 h-6" />,
          colorClasses: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300 border-yellow-400 dark:border-yellow-600',
        };
      case 'error':
        return {
          icon: <ErrorIcon className="w-6 h-6" />,
          colorClasses: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 border-red-400 dark:border-red-600',
        };
      default: // info
        return {
          icon: <InfoIcon className="w-6 h-6" />,
          colorClasses: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 border-sky-400 dark:border-sky-600',
        };
    }
  }, [notification.type]);

  return (
    <div
      className={`relative w-full p-4 pr-12 rounded-lg shadow-lg border-l-4 animate-fade-in-right ${colorClasses}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          {notification.title && <p className="text-sm font-bold">{notification.title}</p>}
          <p className="text-sm">{notification.message}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-md text-inherit hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
        aria-label="Close notification"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
      <style>{`
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;