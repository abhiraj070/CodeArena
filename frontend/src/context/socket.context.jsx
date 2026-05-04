import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "./user.context";

const socketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useUser();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user?._id) {
            return undefined;
        }

        const newSocket = io(
            import.meta.env.VITE_FEATURE_SERVICE_URL || "http://localhost:8000",
            {
                withCredentials: true,
                autoConnect: true,
                auth: { userId: user._id },
            }
        );

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user]);

    return (
        <socketContext.Provider value={socket}>
            {children}
        </socketContext.Provider>
    );
};

export const useSocket = () => useContext(socketContext);
