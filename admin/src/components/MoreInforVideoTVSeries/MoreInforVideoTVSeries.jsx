import React, {useState, useEffect} from "react";
import "./MoreInforVideoTVSeries.scss";

const MoreInforVideoTVSeries = ({setIsOpen, handleThumbnail, image}) => {    

    return (
        <div className="more-information-video">
            <div className="more-header">
                <p className="more-title">MORE</p>
                <button className="cancel-btn">cancel</button>
            </div>
            <div className="more-infor-container">
                <div className="episode-title-container input-container">
                    <p className="episode-title-label">Episode title</p>
                    <input type="text" className="text-input episode-title-box" />
                </div>
                <div className="episode-number-container input-container">
                    <p className="episode-number-label">Episode number</p>
                    <input type="text" className="text-input episode-number-box" />
                </div>
                <div className="description-container input-container">
                    <p className="description-label">Description</p>
                    <textarea className="description-box text-area" />
                </div>
                <div className="thumbnail-area input-container">
                    <p className="thumbnail-title">Thumbnail</p>
                    <p className="thumbnail-more-description">Select and upload a picture that show what's in your video.</p>
                    <div className="thumbnail-preview-container">
                        <label className="thumbnail-box" htmlFor="thumbnail-input-file">
                            <img src="/assets/icons/image-gray.png" alt="" className="thumbnail-img" />
                            <p className="thumbnail-upload-text">Upload</p>
                        </label>
                        <input type="file" id="thumbnail-input-file" onChange={handleThumbnail} hidden/>
                        {image && <img src={image.preview} alt="preview image" className="thumbnail-preview-img" onClick= {setIsOpen}/>}
                    </div>
                </div>
            </div>
            <button className="save-infor-video-btn">
                Save
            </button>
        </div>
    )
}

export default MoreInforVideoTVSeries;