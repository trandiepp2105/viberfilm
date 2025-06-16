import React, {createContext, useEffect, useState} from "react"; 
import Login from "../pages/Login/Login"; 
import checkLogin from "../utils/checkLogin";
import Layout from "../components/Layout/Layout";
import { Routes, Route, Navigate } from "react-router-dom";
import userServices from "../services/userServices";

export const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authStatus = await checkLogin();
                setIsAuth(authStatus);
                setLoading(false);
            }
            catch (error) {
                setIsAuth(false);
            }
        }
        checkAuth();   
    }, []);

    const login = async (email, password) => {
        const response = await userServices.login(email, password);
        return response;
    }

    const logout = async () => {
        await userServices.logout();
    }

    return (
        <UserContext.Provider value={{isAuth, setIsAuth, login, logout, loading}}>
            {children}
        </UserContext.Provider> 
    )
}   





