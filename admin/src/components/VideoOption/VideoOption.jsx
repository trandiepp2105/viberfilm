import React from "react";
import "./VideoOption.scss";

const VideoOption = ({title, release_date, rating, banner_img_url, seasons}) => {

    const banner_url = "https://127.0.0.1:8000" + banner_img_url;

    return (
        <div className="video-option-container">
            <div className="video-thumbnail poster-video">
                <img src={banner_url} alt="poster" className="poster"/>   
            </div>
            <div className="video-infor-container infor-box detail-video">
                <p className="name-video video-infor-text">{title}</p>
                <p className="date-upload-video video-infor-text">Created at {release_date.split("-")[0]}</p>
            </div>
            <div className="rating-container infor-box rating-video">
                <img src="/assets/icons/star.png" alt="rating" className="rating-icon icon-infor-video"/>
                <p className="rating-video">{rating}</p>
            </div>
            <div className="view-container infor-box view-video">
                <img src="/assets/icons/eye.png" alt="view" className="view-icon icon-infor-video"/>
                <p className="view-video">100M</p>
            </div>
            <div className="status-container infor-box status-video">
                <img src="/assets/icons/check-mark.png" alt="status" className="status-icon icon-infor-video"/>
                <p className="status-video">{seasons}</p>
            </div>
            <div className="actions-container infor-box actions-video">
                <button className="btn-edit action-btn">
                    <img src="/assets/icons/edit.png" alt="edit" className="edit-icon icon-infor-video action-icon"/>
                </button>
                <button className="btn-delete action-btn">
                    <img src="/assets/icons/trash.png" alt="delete" className="delete-icon icon-infor-video action-icon"/>
                </button>
            </div>
        </div>
    )
}

export default VideoOption;