import React from "react";
import { Outlet } from "react-router-dom";
import "./Layout.scss";
import Logo from "../Logo/Logo";
import Header from "../Header/Header";
import Taskbar from "../Taskbar/Taskbar";

const Layout = ({isLogin, avatar, name}) => {
    return (
        <div className="layout-container">
            <div className="navigation-bar">
                <Logo />
                <Taskbar />
            </div>
            <Header isLogin={isLogin} avt={avatar} name={name}/>
            <Outlet />
        </div>
    )
}

export default Layout;