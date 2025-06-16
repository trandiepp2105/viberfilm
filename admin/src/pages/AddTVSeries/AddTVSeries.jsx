import React , {useState, useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import "./AddTVSeries.scss";
import InforFilmDropdown from "../../components/InforFilmDropdown/InforFilmDropdown";
import PopupAddNew from "../../components/PopupAddNew/PopupAddNew";
import filmServices from "../../services/filmServices";
import SelectCustom from "../../components/SelectCustom/SelectCustom";


const AddTVSeries = () => {
    const nagigate = useNavigate();
    const [people, setPeople] = useState([]);
    const [genres, setGenres] = useState([]);
    const [tags, setTags] = useState([]);
    const [nationalities, setNationalities] = useState([]);
    const [titlePopup, setTitlePopup] = useState("");
    const [popupOptions, setPopupOptions] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    const [seasonTitle, setSeasonTitle] = useState("");
    const [seasonNumberOfEpisodes, setSeasonNumberOfEpisodes] = useState("");
    const [seasonReleaseYear, setSeasonReleaseYear] = useState("");
    const [seasonDirectors, setSeasonDirectors] = useState([]);
    const [seasonScreenwriters, setSeasonScreenwriters] = useState([]);
    const [seasonActors, setSeasonActors] = useState([]);
    const [seasonGenres, setSeasonGenres] = useState([]);
    const [seasonTags, setSeasonTags] = useState([]);
    const [seasonNationality, setSeasonNationality] = useState([]);
    const [seasonStatus, setSeasonStatus] = useState("");
    const [seasonDescription, setSeasonDescription] = useState("");
    const [seasonBannerImg, setSeasonBannerImg] = useState(null);

    const getData = async () => {
        try {
            const peopleData = await filmServices.getPeople();
            const genresData = await filmServices.getGenres();
            const tagsData = await filmServices.getTags();
            const nationalitiesData = await filmServices.getNationalities();
            setPeople(peopleData);
            setGenres(genresData);
            setTags(tagsData);
            setNationalities(nationalitiesData);
        }
        catch (error) {
        }
    }

    useEffect(() => {
        getData();
    }, [])

    useEffect(() => {
        if (popupOptions.length === 0) return;
        const getNewData = async () => {
            switch (titlePopup) {
                case "Directors":
                case "Screenwriters":
                case "Actors":
                    const peopleData = await filmServices.getPeople();
                    setPeople(peopleData);
                    break;
                case "Genres":
                    const genresData = await filmServices.getGenres();
                    setGenres(genresData);
                    break;
                case "Tags":
                    const tagsData = await filmServices.getTags();
                    setTags(tagsData);
                    break;
                case "Nationality":
                    const nationalitiesData = await filmServices.getNationalities();
                    setNationalities(nationalitiesData);
                    break;
                default:
                    return;
            }
        }
        getNewData();
        setTitlePopup("");
        setPopupOptions([]);
    }, [titlePopup, popupOptions]);

    const handleTitlePopup = (title) => {
        setTitlePopup(title);
    }

    const handleShowThumbnail = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSeasonBannerImg(file);
        const url = URL.createObjectURL(file);
        setThumbnail(url);
    }

    useEffect(() => {
        if (!thumbnail) return;
        return () => URL.revokeObjectURL(thumbnail);
    }
    , [thumbnail]);


    const handleSeasonTitle = (e) => {
        setSeasonTitle(e.target.value);
    }

    const handleSeasonNumberOfEpisodes = (e) => {
        setSeasonNumberOfEpisodes(e.target.value);
    }

    const handleSeasonReleaseYear = (e) => {
        setSeasonReleaseYear(e.target.value);
    }

    const handleSeasonStatus = (value) => {
        if (value === "Ongoing") {
            setSeasonStatus("on_going");
        }
        else {
            setSeasonStatus("completed");
        }
    }

    const handleSeasonDescription = (e) => {
        setSeasonDescription(e.target.value);
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        const formatCareers = (seasonDirectors, seasonScreenwriters, seasonActors) => {
            const careers = [];
            careers.push({career_name: "Director", people: []})
            careers.push({career_name: "Writer", people: []})
            careers.push({career_name: "Actor", people: []})

            seasonDirectors.forEach(director => {
                careers[0].people.push({id: director.id, name: director.name});
            });

            seasonScreenwriters.forEach(screenwriter => {
                careers[1].people.push({id: screenwriter.id, name: screenwriter.name});
            });

            seasonActors.forEach(actor => {
                careers[2].people.push({id: actor.id, name: actor.name});
            });

            return JSON.stringify(careers);
        }
        

        const formData = new FormData();
        formData.append("banner_img", seasonBannerImg);
        formData.append("season_name", seasonTitle);
        formData.append("num_episodes", seasonNumberOfEpisodes);
        formData.append("release_date", seasonReleaseYear);
        formData.append("description", seasonDescription);
        formData.append("status", seasonStatus);
        formData.append("genres", JSON.stringify(seasonGenres.map(genre => genre.id)));
        formData.append("nations", JSON.stringify(seasonNationality.map(nation => nation.id)));
        formData.append("tags", JSON.stringify(seasonTags.map(tag => tag.id)));
        formData.append("careers", formatCareers(seasonDirectors, seasonScreenwriters, seasonActors));

        filmServices.postSeason(formData)
            .then(() => {
                nagigate("/tv-series");
            })
            .catch(error => {   
                alert("Failed to add new TV series");
            })
    }

    return (
        <div className="main-content-add-tv-series">
            <div className="cancel-button-container">
                <button type="button" className="cancel-button" onClick={() => nagigate(-1)}>
                    <img src="/assets/icons/back.png" alt="cancel-btn" className="cancel-button-img" />
                </button>
            </div>
            <form action="form" className="add-tv-series-form"
                onSubmit={(e) => handleSubmit(e)}>
                <div className="form-column column1">
                    <div className="season-title-area text-box">
                        <p className="seson-title">Season title</p>
                        <input type="text" className="series-title-input text-input" 
                            value={seasonTitle} onChange={handleSeasonTitle}/>
                    </div>
                    <div className="number-episode-release-year-area">
                        <div className="number-episode-area mini-text-box">
                            <p className="number-episode">Number of episodes</p>
                            <input type="text" className="number-episode-input mini-text-input" 
                                value={seasonNumberOfEpisodes} onChange={handleSeasonNumberOfEpisodes}/>
                        </div>                                                                                                                                                                                                     
                        <div className="release-year-area mini-text-box">
                            <p className="release-year">Release year</p>
                            <input type="text" className="release-year-input mini-text-input" 
                                value={seasonReleaseYear} onChange={handleSeasonReleaseYear}/>
                        </div>
                    </div>
                    <InforFilmDropdown title={"Directors"} options={people} 
                        handleTitlePopup={handleTitlePopup} 
                        selected={seasonDirectors}
                        handleSelected={setSeasonDirectors}/>

                    <InforFilmDropdown title={"Screenwriters"} options={people} 
                        handleTitlePopup={handleTitlePopup} 
                        selected={seasonScreenwriters}
                        handleSelected={setSeasonScreenwriters}/>

                    <InforFilmDropdown title={"Actors"} options={people} 
                        handleTitlePopup={handleTitlePopup} 
                        selected={seasonActors}
                        handleSelected={setSeasonActors}/>

                    <InforFilmDropdown title={"Genres"} options={genres} 
                        handleTitlePopup={handleTitlePopup} 
                        selected={seasonGenres}
                        handleSelected={setSeasonGenres}/>

                    <InforFilmDropdown title={"Tags"} options={tags} 
                        handleTitlePopup={handleTitlePopup} 
                        selected={seasonTags}
                        handleSelected={setSeasonTags}/>

                    <InforFilmDropdown title={"Nationality"} options={nationalities} 
                        handleTitlePopup={handleTitlePopup} 
                        selected={seasonNationality}
                        handleSelected={setSeasonNationality}
                    />

                </div>
                <div className="form-column column2">
                    <div className="big-thumbnail-area text-box">
                        <label className="thumbnail-label" htmlFor="big-thumbnail-img-season">
                            {thumbnail ? 
                                <img src={thumbnail} alt="thumbnail" className="big-thumbnail-img"/> 
                                : 
                                <div className="thumbnail-placeholder">
                                    <p className="thumnbnail-upload-description">Upload thumbnail here</p>
                                    <div className="upload-thumbnail-box">
                                        <div className="plus-box"></div>
                                    </div>
                                </div>
                            }    
                        </label>
                    </div>
                    <input type="file" hidden id="big-thumbnail-img-season" onChange={handleShowThumbnail}/>
                    <div className="description-area text-box">
                        <p className="description">Description</p>
                        <textarea className="description-input text-input" value={seasonDescription} onChange={handleSeasonDescription}/>
                    </div>
                    <SelectCustom label={"Status"} options={["Ongoing", "Completed"]} onChange={handleSeasonStatus}/>
                    <button className="submit-form-btn" type="submit">
                        Submit
                    </button>
                </div>
            </form>  
            <PopupAddNew title={titlePopup} setTitle={setTitlePopup} oldOptions={people} setOptions={setPopupOptions}/>
        </div>
    )
}

export default AddTVSeries;