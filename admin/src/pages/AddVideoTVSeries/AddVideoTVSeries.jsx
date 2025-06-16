import React, {useCallback, useState, useEffect, useRef} from "react";
import "./AddVideoTVSeries.scss";
import { useDropzone } from "react-dropzone";
import MoreInforVideoTVSeries from "../../components/MoreInforVideoTVSeries/MoreInforVideoTVSeries";
import UploadVideoBox from "../../components/UploadVideoBox/UploadVideoBox";
import ControlVideo from "../../components/ControlVideo/ControlVideo";
import AllowFormat from "../../components/AllowFormat/AllowFormat";
import AddFileMore from "../../components/AddFileMore/AddFileMore";

const AddVideoTVSeries = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [thumbnail, setThumbnail] = useState(null);

    const toggleModal = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    const handleThumbnail = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Invalid file type. Please upload a valid image file.");
            e.target.value = "";
            return;
        }
        setThumbnail({
            ...file,
            preview: URL.createObjectURL(file),
        }); 
    }, []);

    useEffect(() => {
        return () => {
            if (thumbnail) {
                URL.revokeObjectURL(thumbnail.preview);
            }
        }
    }, [thumbnail]);

    
    const [video, setVideo] = useState(null);
    const allowedTypes = ["video/mp4", "video/mov", "video/wmv"];
    
    const onDrop = useCallback((acceptedFiles) => {
        const validFiles = acceptedFiles.filter(file => allowedTypes.includes(file.type));
        if (validFiles.length > 1) {
            alert("Please upload only one video file.");
            return;
        }
        if (validFiles.length === 0) {
            alert("Invalid file type. Please upload a valid video file.");
            return;
        }
        if (validFiles.length > 0) {
            if (video) {
                URL.revokeObjectURL(video.preview);
            }
            const newFile = validFiles[0];
            setVideo({
                ...newFile,
                preview: URL.createObjectURL(newFile)
            });
        } 
    }, [video]);

    const { getRootProps, getInputProps} = useDropzone({ 
        onDrop,
        accept: {
            "video/mp4": [],
            "video/quicktime": [],
            "video/x-ms-wmv": []  
        },
        maxFiles: 1,
        noClick: true,
    });

    useEffect(() => {
        return () => {
            if (video) {
                URL.revokeObjectURL(video.preview);
            }
        }
    }, [video]);

    const videoRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [volume, setVolume] = useState(1);
    const [preVolume, setPreVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const handlePlay = () => {
        videoRef.current.play();
        setIsPlaying(true);
    }

    const handlePause = () => {
        videoRef.current.pause();
        setIsPlaying(false);
    }

    const handleBackWard = () => {
        videoRef.current.currentTime -= 10;
    }

    const handleSeek = (e) => {
        const seekTime = e.target.value * duration / 100;
        videoRef.current.currentTime = seekTime;
        setProgress(e.target.value);

    }

    const handleVolume = (e) => {
        const newVolume = e.target.value;
        setIsMuted(newVolume == 0);
        setVolume(newVolume);
    }

    const applyVolume = () => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            setPreVolume(volume);
        }
    }

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
            setPreVolume(volume);
            setVolume(0);
            videoRef.current.volume = 0;
        }
        else {
            videoRef.current.volume = preVolume == 0 ? 1 : preVolume;
            setVolume(videoRef.current.volume);
        }
    }

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const handleDurationChange = () => {
            setDuration(video.duration);
        }
        video.addEventListener('durationchange', handleDurationChange);
        return () => {
            if (video)
                video.removeEventListener('durationchange', handleDurationChange);
        };
    }, [video]);


    useEffect(() => {
        if (!videoRef.current) return;
        const handleTimeUpdate = () => {
            setProgress(videoRef.current.currentTime * 100 / duration);
        }
        videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            if (videoRef.current)
                videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
    }, [duration]);

    useEffect(() => {
        if (!videoRef.current) return;
        const handleWaiting = () => {
            setIsBuffering(true);
        }

        const handlePlaying = () => {
            setIsBuffering(false);
        }
        videoRef.current.addEventListener('waiting', handleWaiting);
        videoRef.current.addEventListener('playing', handlePlaying);
        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener('waiting', handleWaiting);
                videoRef.current.removeEventListener('playing', handlePlaying);
            }
        }
    }, [video]);

    useEffect(() => {
        if (!videoRef.current) return;

        const updateState = () => {
            setIsPlaying(!videoRef.current.paused);
        }

        videoRef.current.addEventListener("play", updateState);
        videoRef.current.addEventListener("pause", updateState);

        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener("play", updateState);
                videoRef.current.removeEventListener("pause", updateState);
            }
        }
    }, [video]);

    return (
        <form className="main-content-add-video-tv-series" onSubmit={(e) => e.preventDefault()}>
            <div className="upload-video-area">
                <UploadVideoBox  
                    getRootProps={getRootProps} 
                    getInputProps={getInputProps} 
                    video={video} 
                    setVideoRef={videoRef}
                />
                {video &&
                    <ControlVideo
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        handlePlay={handlePlay}
                        handlePause={handlePause}
                        handleSeek={handleSeek}
                        handleBackWard={handleBackWard}
                        handleVolume={handleVolume}
                        toggleMute={toggleMute}
                        applyVolume={applyVolume}
                        progress={progress}
                        duration={duration}
                        volume={volume}
                    />
                }
                {video && <AddFileMore/>}
                <AllowFormat/>
            </div>
            <MoreInforVideoTVSeries setIsOpen={toggleModal} handleThumbnail={handleThumbnail} image={thumbnail}/> 
            {isOpen && (
                <div className="img-modal" onClick={toggleModal}>
                    <img src={thumbnail.preview} alt="img full size" className="thumbnail-preview-full-size" onClick={(e) => e.stopPropagation()}/>
                </div>
            )}
        </form>
    )
}

export default AddVideoTVSeries;
