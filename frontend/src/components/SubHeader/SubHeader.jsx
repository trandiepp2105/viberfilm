import React, { useState, useRef, useEffect } from "react";
import "./SubHeader.scss";
import "../../styles/style.scss";
import "../../styles/responsive.scss";
import { Link } from "react-router-dom";

const SubHeader = () => {
  const [isSubgenresVisible, setSubgenresVisible] = useState(false);
  const subgenresRef = useRef(null); // useRef để tham chiếu đến vùng subgenres

  const fakeSubgenres = [
    "Action",
    "Anime",
    "Asian",
    "Award-Winning",
    "Classics",
    "Comedies",
    "Crime",
    "Documentaries",
    "Dramas",
    "Fantasy",
    "Hollywood",
    "Horror",
    "Independent",
    "International",
    "Kids & Family",
    "Romance",
    "Sci-Fi",
    "Shorts",
    "Thriller",
    "Vietnamese Movies",
  ];

  // Đóng subgenres khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subgenresRef.current &&
        !subgenresRef.current.contains(event.target)
      ) {
        setSubgenresVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0); // Kiểm tra nếu đã cuộn
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup khi component bị unmount
  }, []);

  return (
    <div className={`sub-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="sub-header-wrapper">
        <div className="genre-selecter">
          <div className="parent-genre"></div>
          <div className="genre-selecter-detail">
            <span className="genre-title sub-header-title">Movies</span>
            <div
              className="subgenres"
              ref={subgenresRef} // Tham chiếu đến vùng subgenres
              onClick={() => setSubgenresVisible((prev) => !prev)}
            >
              <div className="track-container">
                Genres
                <span className="arrow"></span>
              </div>
              {isSubgenresVisible && (
                <ul className="subgenres-list">
                  {fakeSubgenres.map((subgenre, index) => (
                    <li className="subgenre-item" key={index}>
                      <Link to={`/genre/${subgenre}`}>{subgenre}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubHeader;
