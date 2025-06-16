import React from "react";
import "./ListDropdowns.scss";


const ListDropdown = ({handleTitlePopup}) => {
    return (
        <div className="dropdowns">
            <InforFilmDropdown title={"Directors"} options={directors} handleTitlePopup={handleTitlePopup}/>
            <InforFilmDropdown title={"Screenwriters"} options={screenwriters} handleTitlePopup={handleTitlePopup}/>
            <InforFilmDropdown title={"Actors"} options={actors} handleTitlePopup={handleTitlePopup}/>
            <InforFilmDropdown title={"Genres"} options={genres} handleTitlePopup={handleTitlePopup}/>
            <InforFilmDropdown title={"Tags"} options={tags} handleTitlePopup={handleTitlePopup}/>
            <InforFilmDropdown title={"Nationality"} options={nationalities} handleTitlePopup={handleTitlePopup}/>  
        </div>
    );
}

export default ListDropdown;