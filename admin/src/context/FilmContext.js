import React, {useState, useEffect, createContext} from 'react'; 
import filmServices from '../services/filmServices';

export const FilmContext = createContext();
export const FilmProvider = ({children}) => {



    return (
        <FilmContext.Provider value={{films, loading, addFilm, updateFilm, deleteFilm}}>
            {children}
        </FilmContext.Provider>
    )
}