import React from "react";
import "./UploadVideoBox.scss";
import PlusShape from "../PlusShape/PlusShape";

const UploadVideoBox = ({getRootProps, getInputProps, video, setVideoRef}) => {

    return (
        <div className="upload-video-box" {...getRootProps()}>
            <div className="upload-video-dropzone">
                <PlusShape isVisible={video ? true : false}/>
                {video && 
                    <div className="upload-video-preview">
                        <video ref={setVideoRef} src={video.preview} className="video-preview"/>
                    </div>
                }
                <input type="file" id="dropzone" {...getInputProps()} hidden/> 
            </div>
            {!video && 
                <div className="upload-video-tag">
                    <label className="upload-video-label-button" htmlFor="dropzone">Upload video</label>
                    <p className="description-upload-video">or drag and drop video here</p>
                </div>
            }
        </div>
    )
}

export default UploadVideoBox;