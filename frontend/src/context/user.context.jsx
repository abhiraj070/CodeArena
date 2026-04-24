import { createContext,useState, useContext } from "react";

const userContext= createContext()

export const UserProvider=({children})=>{
    const [user,setUser]= useState(() => {
        try {
            const storedUser = localStorage.getItem("user")
            if(!storedUser || storedUser === "null"){
                return null
            }
            return JSON.parse(storedUser)
        } catch {
            return null
        }
    })
    return (
        <userContext.Provider value={{user, setUser}}>
            {children}
        </userContext.Provider>
    )
}

export const userProvider = UserProvider

export const useUser=()=>useContext(userContext)