import React, {useState, useContext, useEffect} from "react";
import "./Login.scss";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import userServices from "../../services/userServices";
import { UserContext } from "../../context/UserContext";


const Login = () => {
    const [isRemember, setIsRemember] = useState(false);
    const {isAuth, setIsAuth, login } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    if (isAuth) navigate("/dashboard", {replace: true}); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(email, password);
            if (response.status === 200) {
                setIsAuth(true);
                navigate("/dashboard", {replace: true});
            }
        }
        catch (error) { 
            console.error("Error while logging in", error);
        }
    }
    
    return (
        <div className="login-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="login-main-content" style={{backgroundImage: `url("/assets/images/login-background.jpg")`}}>
                <p className="welcome-back">WELCOME BACK!</p>
                <p className="login-message">Log in to continue</p>
                <form className="form-login" onSubmit={handleSubmit}>
                    <input type="text" 
                        placeholder="Email" 
                        name="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input type="password" 
                        placeholder="Password" 
                        name="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="login-button" type="submit">LOG IN</button>
                </form>
                <div className="login-more-options">
                    <div className="remember-password">
                        <input type="checkbox" 
                            id="remember-password" 
                            className="remember-me" 
                            checked={isRemember} 
                            onChange={() => setIsRemember(!isRemember)}/>
                        <label htmlFor="remember-password" className="remember-label">
                            <p className="remember-box">
                                {isRemember && <img src="/assets/icons/checked.png" alt="checked"/>}
                            </p> 
                            <p className="remember-text">Remember me</p>
                        </label>
                    </div>
                    <Link className="forgot-password">Forgot password</Link>
                </div>  
            </div>
        </div>
    )
}

export default Login;