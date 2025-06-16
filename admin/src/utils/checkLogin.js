import Cookies from "js-cookie";
import userServices from "../services/userServices";

const checkLogin = async () => {
    const token = Cookies.get("access_token");
    if (token && token !== "" && token !== "undefined") {
        return true;
    }
    const refreshToken = Cookies.get("refresh_token");
    if (refreshToken && refreshToken !== "" && refreshToken !== "undefined") {
        try {
            await userServices.refreshToken();
            return true;
        }
        catch (error) {
            console.error("Error while refreshing token", error);
            return false;
        }
    }
    return false;
}

export default checkLogin;