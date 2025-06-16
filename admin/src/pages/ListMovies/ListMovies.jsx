import React, {use, useState, useEffect} from "react";
import "./ListMovies.scss";
import ListFilms from "../../components/ListFilms/ListFilms";
import filmServices from "../../services/filmServices";

const ListMovies = () => {
    const [videos, setVideos] = useState([]);
    const fields = ["Poster", "Detail", "Rating", "View", "Status", "Actions"];

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await filmServices.getListMovies();
                setVideos(response);
            } catch (error) {
            }
        };

        fetchVideos();
    }, []);


    return (
        <div className="main-content-list-movies">
            <ListFilms videos={videos} fields={fields} add="movies" maxSize={videos.length}/>
        </div>
    )
}

export default ListMovies;