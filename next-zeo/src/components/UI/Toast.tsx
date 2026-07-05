import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'notification';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    actionLabel?: string;
    onAction?: () => void;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    isVisible,
    onClose,
    duration = 5000,
    actionLabel,
    onAction,
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'notification':
                return <Bell className="w-5 h-5 text-blue-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'notification':
                return 'bg-blue-50 border-blue-200'; // Specific style for notifications if needed, otherwise same as info
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`flex items-start p-4 rounded-lg border shadow-lg max-w-sm w-full bg-white ${getBackgroundColor()}`}
                    >
                        <div className="flex-shrink-0 mr-3 mt-0.5">
                            {getIcon()}
                        </div>
                        <div className="flex-1 mr-2">
                            <p className="text-sm font-medium text-gray-900 border-none bg-transparent m-0 p-0 focus:ring-0 focus:outline-none">{message}</p>
                            {actionLabel && onAction && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction();
                                    }}
                                    className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none transition-colors"
                                >
                                    {actionLabel}
                                </button>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
