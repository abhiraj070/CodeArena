import { createContext, useContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

const socketContext = createContext(null)

export const SocketProvider = ({ children }) => {
    const socketUrl = "http://localhost:8003"
    let socket
    useEffect(()=>{
        const socket = useMemo(() => {
        return io("http://localhost:8003", {
            withCredentials: true,
            autoConnect: false,
        });
    }, []);

    useEffect(() => {
        socket.connect();

        return () => socket.disconnect();
    }, [socket]);
    },[socket])
    
    return <socketContext.Provider value={socket}>{children}</socketContext.Provider>
}

export const useSocket = () => {
    const context = useContext(socketContext)
    if (!context) {
        throw new Error("useSocket must be used inside SocketProvider")
    }
    return context
}
