import React from "react";
import "./ListFilms.scss";
import FilterBar from "../FilterBar/FilterBar";
import TableHeader from "../TableHeader/TableHeader";
import VideoOption from "../VideoOption/VideoOption";
import PageNavi from "../PageNavi/PageNavi";
import { Link } from "react-router-dom"; 


const ListFilms = ({videos, page, maxSize, fields, add}) => {

    return (
        <div className="list-films">
            <div className="second-row">
                <FilterBar />
                <Link className="add-button-container" to={`/${add}/add`}>
                    <div className="add-button">Add {add}</div>
                    <div className="add-plus-icon">{"+"}</div>
                </Link>
            </div>
            <div className="table-content-container">
                <TableHeader fields={fields}/>
                <div className="table-content">
                    {videos.map((video, index) => (
                        <div className="video-container" key={index}>
                            <VideoOption key={index} {...video}/>
                        </div>
                    ))}
                </div>
            </div>
            <PageNavi currentPage={page} maxSize={maxSize} pageSize={videos.length}/>
        </div>
    )
}

export default ListFilms;