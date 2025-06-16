import React from "react";
import "./Header.scss";

import { useLocation } from "react-router-dom";

const getHeaderTitle =  (path) => {
    switch (path) {
        case "/series":
            return "TV Series";
        case "/series/add":
            return "Add TV Series";
        case "/movies":
            return "Movies";
        case "/movies/add":
            return "Add Movies";
        case "/dashboard":
            return "Dashboard";
        case "/film-maker":
            return "Film Maker";
        default:
            return "Login";
    }
}

const Header = ({isLogin, avt, name}) => {
    const location = useLocation();

    return (
        <div className="header-container">
            <h1 className="header-title">{getHeaderTitle(location.pathname)}</h1>
            {isLogin ?
                <div className="account">
                    <div className="notification">
                        <img className="notification-icon" src="/assets/icons/bell.png" alt="Notification Icon" />
                    </div>
                    <div className="user-container">
                        <img className="user-avatar" src= {avt} alt="User" />
                        <h2 className="user-name">{name}</h2>
                    </div>
                </div>  
                : null
            } 
        </div>
    );
}

export default Header;