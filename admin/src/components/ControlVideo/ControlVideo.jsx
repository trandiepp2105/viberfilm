import React, {useState, useEffect, useRef} from "react";
import "./ControlVideo.scss";

const UploadVideoContainer = (
    {
        isPlaying, 
        isMuted,
        handlePlay, 
        handlePause, 
        handleBackWard, 
        handleSeek, 
        toggleMute,
        handleVolume, 
        applyVolume,
        progress, 
        volume, 
        duration
    }) => {

    const rangeInputRef = useRef(null);
    const timeOutProgress = useRef(null);
    const rangeVolumeRef = useRef(null);
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => {
        if (!rangeInputRef.current) return;
        const handleStyle = () => {
            rangeInputRef.current.style.background = 
            `linear-gradient(to right, #5259E0 ${rangeInputRef.current.value}%, #E0E0E0 ${rangeInputRef.current.value}%)`;
        }
        handleStyle();
        rangeInputRef.current.addEventListener('input', handleStyle);
        return () => {
            if (rangeInputRef.current)
                rangeInputRef.current.removeEventListener('input', handleStyle);
        }
    }, [progress]);

    useEffect(() => {
        const rangeVolume = rangeVolumeRef.current;
        if (!rangeVolume) return; 
        const handleStyle = () => {
            rangeVolume.style.background = `linear-gradient(to right, yellowgreen  ${rangeVolume.value*100}%, #E0E0E0 ${rangeVolume.value*100}%)`;
        }  
        handleStyle();
        rangeVolume.addEventListener('input', handleStyle);
        return () => {
            if (rangeVolume)
                rangeVolume.removeEventListener('input', handleStyle);
        }
    }, [volume]);

    useEffect(() => {
        const videoProgress = document.querySelector('.video-progress-bar');
        if (!videoProgress) return;

        const showProgressBar = () => {
            setShowProgress(true);
            if (timeOutProgress.current) {
                clearTimeout(timeOutProgress.current);
            }
        }

        const hideProgressBar = () => {
            timeOutProgress.current = setTimeout(() => {
                setShowProgress(false);
            }, 2500);
        }

        if (videoProgress) {
            videoProgress.addEventListener('mouseenter', showProgressBar);
            videoProgress.addEventListener('mouseleave', hideProgressBar);
        }
        return () => {
            if (videoProgress) {
                videoProgress.removeEventListener('mouseenter', showProgressBar);
                videoProgress.removeEventListener('mouseleave', hideProgressBar);
            }
            clearTimeout(timeOutProgress.current);
        };
    }, []);    

    const formatTimeVideo = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);

        const format = (value) => {
            if (value < 10) {
                return `0${value}`;
            }
            if (value < 1) {
                return '00';
            }
            return value;
        }

        return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
    };

    return (
        <div className="control-video-container">
            <div className="video-controls">
                <div className={`video-progress-bar ${showProgress ? 'visible' : ''}`}>
                    <input 
                        type="range" 
                        ref={rangeInputRef} 
                        className="progress-bar" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={progress} 
                        onChange={handleSeek}
                    />
                </div>
                <div className="button-control-video">
                    <div className="pause-play-btn">
                        {!isPlaying ? 
                            <button className="play-button" onClick={handlePlay} aria-label="play button" title="play">
                                <img src="/assets/icons/play.png" alt="play button" className="pause-play-btn play-button-img"/>
                            </button> :
                            <button className="pause-button" onClick={handlePause} aria-label="pause-button" title="pause">
                                <img src="/assets/icons/pause.png" alt="pause button" className="pause-play-btn pause-button-img"/>
                            </button>
                        }   
                    </div>
                    <button 
                        className="backward-button icon-control-container" 
                        onClick={handleBackWard} 
                        aria-label="backward button" 
                        title="backward"
                        type="button"
                    >
                        <img src="/assets/icons/rewind-button.png" alt="backward button" className="backward-button-img icon-control-video"/>
                    </button>
                    <div className="video-time">
                        <span>{formatTimeVideo(progress*duration/100)}</span>
                        <span>/</span>
                        <span>{formatTimeVideo(duration)}</span>
                    </div>
                    <button className="cc-button icon-control-container" onClick aria-label="cc button" title="cc" type="button" disabled>
                        <img src="/assets/icons/cc.png" alt="cc" className="icon-control-video"/>
                    </button>
                    <div className="volume-video-container">
                        <button 
                            className="volume-button icon-control-container" 
                            onClick={toggleMute}
                            aria-label="volume button" 
                            title="volume"
                            type="button"
                        >
                            <img src={isMuted ? "/assets/icons/volume-mute.png" : volume < 0.5 ? "/assets/icons/volume-avg.png" : "/assets/icons/volume.png"} alt="volume" className="icon-control-video"/>
                        </button>
                        <div className="volume-video-change-box">
                            <input 
                                ref={rangeVolumeRef} 
                                type="range" 
                                className="volume-video-change" 
                                min="0" 
                                max="1"
                                step="0.01"
                                value={volume} 
                                onChange={handleVolume}
                                onMouseUp={applyVolume}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadVideoContainer;