import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export const SocketProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Connect to socket when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const token = localStorage.getItem('accessToken');

            if (!token) return;

            const newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setIsConnected(true);
            });

            newSocket.on('connected', (data) => {
                console.log('Server confirmed connection:', data.message);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                setIsConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            // Disconnect if not authenticated
            if (socket) {
                socket.close();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [isAuthenticated, user]);

    // Join a restaurant room
    const joinRestaurantRoom = useCallback((restaurantId) => {
        if (socket && isConnected) {
            socket.emit('join:restaurant', restaurantId);
        }
    }, [socket, isConnected]);

    // Leave a restaurant room
    const leaveRestaurantRoom = useCallback((restaurantId) => {
        if (socket && isConnected) {
            socket.emit('leave:restaurant', restaurantId);
        }
    }, [socket, isConnected]);

    // Subscribe to an event
    const on = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback);
        }
    }, [socket]);

    // Unsubscribe from an event
    const off = useCallback((event, callback) => {
        if (socket) {
            socket.off(event, callback);
        }
    }, [socket]);

    const value = {
        socket,
        isConnected,
        joinRestaurantRoom,
        leaveRestaurantRoom,
        on,
        off,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export default SocketContext;
