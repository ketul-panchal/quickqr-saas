import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { notificationApi } from '../api/notification.api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { on, off, isConnected } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setIsLoading(true);
            const response = await notificationApi.getNotifications(1, 20);
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const response = await notificationApi.getUnreadCount();
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [isAuthenticated]);

    // Add a new notification (from socket)
    const addNotification = useCallback((notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 50));
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        toast.custom(
            (t) => (
                <div
                    className={`${t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-sky-600 hover:text-sky-500 focus:outline-none"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
                position: 'top-right',
            }
        );
    }, []);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        // Check if it's a valid MongoDB ObjectId (24 hex characters)
        const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(notificationId);

        if (!isValidObjectId) {
            // Local-only notification (from socket), just mark locally
            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === notificationId || n.id === notificationId
                        ? { ...n, isRead: true }
                        : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
            return;
        }

        try {
            await notificationApi.markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === notificationId || n.id === notificationId
                        ? { ...n, isRead: true }
                        : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, []);

    // Clear all notifications (local only)
    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    // Fetch notifications on mount and when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            fetchUnreadCount();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

    // Listen for socket events
    useEffect(() => {
        if (!isConnected) return;

        const handleNewOrder = (data) => {
            console.log('New order notification received:', data);
            // Show toast immediately
            addNotification({
                id: `temp_${Date.now()}`,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data,
                isRead: false,
                createdAt: data.timestamp || new Date().toISOString(),
            });
            // Refetch to get the real notification with MongoDB _id
            setTimeout(() => {
                fetchNotifications();
                fetchUnreadCount();
            }, 500);
        };

        const handleNewNotification = (data) => {
            console.log('New notification received:', data);
            addNotification({
                id: `temp_${Date.now()}`,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data,
                isRead: false,
                createdAt: data.timestamp || new Date().toISOString(),
            });
            // Refetch to get the real notification with MongoDB _id
            setTimeout(() => {
                fetchNotifications();
                fetchUnreadCount();
            }, 500);
        };

        on('order:new', handleNewOrder);
        on('notification:new', handleNewNotification);

        return () => {
            off('order:new', handleNewOrder);
            off('notification:new', handleNewNotification);
        };
    }, [isConnected, on, off, addNotification, fetchNotifications, fetchUnreadCount]);

    const value = {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        fetchUnreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export default NotificationContext;
