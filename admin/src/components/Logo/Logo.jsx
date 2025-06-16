import React from "react";
import "./Logo.scss";
import { useNavigate } from "react-router-dom";

const Logo = () => {
    const navigate = useNavigate();
    return (
        <div className="logo-container" onClick={() => navigate("/")}>
            <img className="logo-image" src="/assets/icons/summer.png" alt="Netflix Logo" />
            <h1 className="logo-name">NETFLIX</h1>
        </div>
    );
}

export default Logo;
