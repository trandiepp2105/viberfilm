import React, {useState, useEffect} from "react";
import "./AddFileMore.scss";


const AddFileMore = () => {
    const [subtitles, setSubtitles] = useState([{id: Date.now(), haveFile: null}]);
    const [audios, setAudios] = useState([{id: Date.now(), haveFile: null}]);
    const [typeVideo, setTypeVideo] = useState('episode');

    const increaseSubtitle = () => setSubtitles([...subtitles, {id: Date.now(), haveFile: null}]);

    const increaseAudio = () => setAudios([...audios, {id: Date.now(), haveFile: null}]);

    const descreaseSubtitle = (id) => setSubtitles(subtitles.filter(subtitle => subtitle.id !== id));

    const descreaseAudio = (id) => setAudios(audios.filter(audio => audio.id !== id));

    const handleSubfileSubtitle = (e, id) => {
        const file = e.target.files[0];
        if (!file) return;
        const nameFile = file.name;
        setSubtitles(prevsubs => 
            prevsubs.map(subtitle => 
                subtitle.id === id ? {...subtitle, haveFile: nameFile} : subtitle
        ));
    }

    const handleSubfileAuido = (e, id) => {
        const file = e.target.files[0];
        if (!file) return;
        const nameFile = file.name;
        setAudios(prevaudios =>
            prevaudios.map(audio =>
                audio.id === id ? {...audio, haveFile: nameFile} : audio
        ));
    }

    useEffect(() => {
        return () => {
        }
    }, [subtitles]);

    return (
        <div className="add-file-more">
            <div className="button-container">
                <button className={`episode-button type-episode-btn ${typeVideo === 'episode' ? 'chosen' : ''}`} 
                    alt="episode"
                    onClick={() => setTypeVideo('episode')}
                >Episode</button>
                <button className={`trailer-button type-episode-btn ${typeVideo === 'episode' ? '' : 'chosen'}`}
                    alt="trailer"
                    onClick={() => setTypeVideo('trailer')}
                >Trailer</button>
                <label className="change-button type-episode-btn" htmlFor="dropzone">Change</label>
                
            </div>
            <div className="upload-subfile">
                <p className="upload-subfile-description">Select language and upload the files</p>
                {subtitles.map((subtitle, index) => (
                    <div className="subtitle-upload-container subfile-upload-container" key={subtitle.id}>
                        <div className="subtitle-add title-add ">
                            <p>Subtitle</p>
                            {index === 0 ? 
                                subtitles.length === 1 ?
                                    <button className="add-button add-subtitle" onClick={increaseSubtitle}>+</button>
                                    :
                                    <div style={{display: 'flex', gap: '5px'}}>
                                        <button className="add-button add-subtitle" onClick={increaseSubtitle}>+</button>
                                        <button className="subtract-button subtract-subtitle" onClick={() => descreaseSubtitle(subtitle.id)}>-</button>
                                    </div>
                                
                                :
                                <button className="subtract-button subtract-subtitle" onClick={() => descreaseSubtitle(subtitle.id)}>-</button>
                            }
                        </div>
                        <div className="upload-box subtitle-upload-box">
                            <select name="select-subtitle-language" id="subtitle-language" className="select-language">
                                <option value="English">English</option>
                                <option value="Vietnamese">Vietnamese</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Japanese">Japanese</option>
                            </select>
                            <label className="upload-button-language" htmlFor={`upload-subtitle-${subtitle.id}`}>Upload</label>
                            <input 
                                type="file" 
                                name="upload-subtitle" 
                                id={`upload-subtitle-${subtitle.id}`}
                                className="upload-subtitle" 
                                onChange={(event) => handleSubfileSubtitle(event, subtitle.id)}
                                hidden
                            />
                        </div>
                        {subtitle.haveFile &&
                            <div className="subfile-upload subtitle-file">
                                <p>{subtitle.haveFile}</p>
                                <button className="preview-subfile" title="preview">
                                    <img src="/assets/icons/eplisis.png" alt="preview" className="preview-subfile-img" />
                                </button>
                            </div>
                        }
                    </div>
                ))}
                {audios.map((audio, index) => (
                    <div className="audio-upload-container subfile-upload-container" key={audio.id}>
                        <div className="audio-add title-add">
                            <p>Audio</p>
                            {index === 0 ?
                                audios.length === 1 ?
                                    <button className="add-button add-audio" onClick={increaseAudio}>+</button>
                                    :
                                    <div style={{display: 'flex', gap: '5px'}}>
                                        <button className="add-button add-audio" onClick={increaseAudio}>+</button>
                                        <button className="subtract-button subtract-audio" onClick={() => descreaseAudio(audio.id)}>-</button>
                                    </div>
                                :
                                <button className="subtract-button subtract-audio" onClick={() => descreaseAudio(audio.id)}>-</button>
                            }
                        </div>
                        <div className="upload-box audio-upload-box">
                            <select name="select-audio-language" id="audio-language" className="select-language">
                                <option value="English">English</option>
                                <option value="Vietnamese">Vietnamese</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Japanese">Japanese</option>
                            </select>
                            <label className="upload-button-language" htmlFor={`upload-audio-${audio.id}`}>Upload</label>
                            <input 
                                type="file" 
                                name="upload-audio" 
                                id={`upload-audio-${audio.id}`}
                                className="upload-audio" 
                                onChange={(event) => handleSubfileAuido(event, audio.id)}
                                hidden/>
                        </div>
                        {audio.haveFile &&
                            <div className="subfile-upload subtitle-file">
                                <p>{audio.haveFile}</p>
                                <button className="preview-subfile" title="preview">
                                    <img src="/assets/icons/eplisis.png" alt="preview" className="preview-subfile-img" />
                                </button>
                            </div>
                        }
                    </div>
                ))}  
            </div>
        </div>
    )
};

export default AddFileMore;