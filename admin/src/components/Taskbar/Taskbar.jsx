import React from "react";
import "./Taskbar.scss";
import {useLocation} from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Taskbar = () => {
    const location = useLocation();

    const navigate = useNavigate();

    const goToDashboard = () => {
        navigate('/dashboard');
    }

    const goToTVSeries = () => {
        navigate('/series');
    }
        
    const goToMovies = () => {
        navigate('/movies');
    }

    const goToFilmMaker = () => {
        navigate('/film-maker');
    }

    const goToInbox = () => {
        navigate('/inbox');
    }

    const goToTask = () => {
        navigate('/task');
    }
 
    return (
        <div className="taskbar-container">
            <div className="content-managerment-container"> 
                <p className="task-heading c-m-title">Content Managerment</p>
                <ul className="options-container c-m-list">
                    <li className={`options c-m-1 ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}>
                        <img className="option-icon" src="/assets/icons/dashboard.png"/>
                        <p className="task-name" onClick={goToDashboard}>Dashboard</p>
                    </li>
                    <li className={`options c-m-2 ${location.pathname.startsWith('/series') ? 'active' : ''}`}>
                        <img className="option-icon" src="/assets/icons/video.png"/>
                        <p className="task-name" onClick={goToTVSeries}>TV Series</p>
                    </li>
                    <li className={`options c-m-3 ${location.pathname.startsWith('/movies') ? 'active' : ''}`}>
                        <img className="option-icon" src="/assets/icons/movies.png"/>
                        <p className="task-name" onClick={goToMovies}>Movies</p>
                    </li>
                    <li className={`options c-m-3 ${location.pathname.startsWith('/film-maker') ? 'active' : ''}`}>
                        <img className="option-icon" src="/assets/icons/celebrity.png"/>
                        <p className="task-name" onClick={goToFilmMaker}>Film Maker</p>
                    </li>
                </ul>
            </div>
            <div className="personal-container">
                <p className="task-heading p-title">Personal</p>
                <ul className="options-container p-list">
                    <li className={`options p-1 ${location.pathname.startsWith('/inbox') ? 'active' : ''}`}>
                        <img className="option-icon" src="/assets/icons/inbox.png"/>
                        <p className="task-name" onClick={goToInbox}>Inbox</p>
                    </li>
                    <li className={`options p-2 ${location.pathname.startsWith('/task') ? 'active' : ''}`}>
                        <img className="option-icon" src="/assets/icons/tasks.png"/>
                        <p className="task-name" onClick={goToTask}>Task</p>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Taskbar;