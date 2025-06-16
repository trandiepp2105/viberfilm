import apiAdmin from './apiAdmin';

const userServices = {
    login: async (email, password) => {
        try {
            const response = await apiAdmin.post("/user/admin/login/", {email, password});
            return response;    
        } catch (error) {
            return Promise.reject(error);
        }
    },

    logout: async () => {
        try {
            await apiAdmin.post("/user/logout/"); 
        } catch (error) {
            return Promise.reject(error);
        }
    },

    addNewStaff: async (email, password) => {
        try {
            await apiAdmin.post("/user/create-staff/", {username: email, email: email, password: password});
        } catch (error) {
            return Promise.reject(error);
        }
    },
    
    refreshToken: async () => {
        try {
            await apiAdmin.post("/user/refresh/");
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default userServices;