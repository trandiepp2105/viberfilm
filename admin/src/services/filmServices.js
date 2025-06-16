import apiAdmin from "./apiAdmin";

const filmServices = {
    getListSeries: async () => {
        try {
            const response = await apiAdmin.get("/film/series/");
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    getListMovies: async () => {
        try {
            const response = await apiAdmin.get("/film/movies/");
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    getPeople: async () => {
        try {
            const response = await apiAdmin.get("/people/")
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
    getGenres: async () => {
        try {
            const response = await apiAdmin.get("/film/genres/")
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
    getTags: async () => {
        try {
            const response = await apiAdmin.get("/film/tags/")
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
    getNationalities: async () => {
        try {
            const response = await apiAdmin.get("/film/nations/")
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
    postSeason: async (data) => {
        try {
            const response = await apiAdmin.post("/film/seasons/", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            }});
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
    postEpisode: async (formData) => {
        try {
            const response = await apiAdmin.post("/film/episodes/", formData)
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
    postPeople: async (data) => {
        try {
            const response = await apiAdmin.post("/people/", data)
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
    postGenre: async (data) => {
        try {
            const response = await apiAdmin.post("/film/genres/", data)
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
    postTag: async (data) => {
        try {
            const response = await apiAdmin.post("/film/tags/", data)
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
    postNationality: async (data) => {
        try {
            const response = await apiAdmin.post("/film/nations/", data)
            return response.data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    },
};

export default filmServices;