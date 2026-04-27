import { createContext, useContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

const socketContext = createContext(null)

export const SocketProvider = ({ children }) => {
        const socket = useMemo(() => { // since in our model the socketProvider component never unmounts so no cleanup effect run so the socket id for a user remains same but in some cases like network drop or tab close the user gets new socket id on relogin
        return io(import.meta.env.VITE_FEATURE_SERVICE_URL || "http://localhost:8000", {
            withCredentials: true,
            autoConnect: false,
        });
    }, []);

    useEffect(() => { //this is a cleanup effect: a function returned cleanup effect is run when the component unmounts or the effect is re-run due to its dependencies. so when the socketProvider component unmounts or the socket changes the cleanup takes place
        return () => socket.disconnect();
    }, [socket]);
    
    return <socketContext.Provider value={socket}>{children}</socketContext.Provider>
}

export const useSocket = () => {
    const context = useContext(socketContext)
    if (!context) {
        throw new Error("useSocket must be used inside SocketProvider")
    }
    return context
}
