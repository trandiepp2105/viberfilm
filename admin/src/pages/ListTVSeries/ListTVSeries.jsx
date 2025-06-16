import React, {useEffect, useState} from "react";
import "./ListTVSeries.scss";
import { Link } from "react-router-dom";
import VideoOption from "../../components/VideoOption/VideoOption";
import TableHeader from "../../components/TableHeader/TableHeader";
import FilterBar from "../../components/FilterBar/FilterBar";
import PageNavi from "../../components/PageNavi/PageNavi";
import filmServices from "../../services/filmServices";
import ListFilms from "../../components/ListFilms/ListFilms";

function ListTVSeries() {
    const  [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const pageSize = 10
    const maxSize = 100;
    const fields = ["Poster", "Detail", "Rating", "View", "Seasons", "Actions"];

    useEffect(() => {
        const fetchListSeries = async () => {
            try {
                const response = await filmServices.getListSeries();
                setVideos(response);
            } catch (error) {
            }
        }
        fetchListSeries();
    }, []);

    return (
        <div className="main-content-list-tv-series">
            <ListFilms videos={videos} page={page} maxSize={maxSize} fields={fields} add="series"/>
        </div>
    )
}

export default ListTVSeries;