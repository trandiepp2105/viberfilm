import React, { useState, useEffect } from "react";
import "./NavBar.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRoot, setIsRoot] = useState(true); // State lưu trạng thái đang ở trang gốc hay không
  const [activeTab, setActiveTab] = useState("/"); // State lưu tab đang active

  useEffect(() => {
    // Kiểm tra xem path hiện tại có phải là '/' hay không
    setIsRoot(location.pathname === "/");
    // Cập nhật active tab theo URL hiện tại
    setActiveTab(location.pathname);
  }, [location]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const handleChangeSearchValue = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Navigate to browse page with search query
      navigate(`/browse?search=${encodeURIComponent(searchValue.trim())}`);
      setActiveTab('/browse');
      // Clear search value after submitting
      setSearchValue('');
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0); // Kiểm tra nếu đã cuộn
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup khi component bị unmount
  }, []);
  const navigationTabs = [
    {
      name: "Home",
      to: "/",
    },
    {
      name: "Series",
      to: "/browse/series",
    },
    {
      name: "Movies",
      to: "/browse/movies",
    },
    {
      name: "New & Popular",
      to: "/new-and-popular",
    },
  ];

  const handleClickTab = (tabTo) => {
    setActiveTab(tabTo);
    scrollToTop();
  };

  const isTabActive = (tabTo) => {
    return activeTab === tabTo;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Thêm hiệu ứng cuộn mượt
    });
  };
  return (
    <div
      className={`nav-bar ${!isRoot ? "root-nav-bar" : ""} ${
        isScrolled ? "scrolled" : ""
      }`}
    >
      <Link to="/" className="logo-link" onClick={scrollToTop}>
        <div className="custom-logo">
          <span className="logo-text">ViberFilm</span>
        </div>
      </Link>
      <div className="primary-navigation">
        {navigationTabs.map((tab, index) => (
          <Link
            to={tab.to}
            key={index}
            className={`navigation-tab ${isTabActive(tab.to) ? 'active' : ''}`}
            onClick={() => handleClickTab(tab.to)}
          >
            {tab.name}
          </Link>
        ))}
      </div>
      <div className="secondary-navigation">
        <div className="search-bar">
          <form onSubmit={handleSearchSubmit}>
            <label className="search-bar-inner" htmlFor="search-movie">
              <div className="search-icon-wrapper" onClick={handleSearchSubmit}>
                <svg
                width="25px"
                height="25px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0" />

                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="#fff"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />{" "}
                </g>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Movie name, genre"
              id="search-movie"
              value={searchValue}
              onChange={handleChangeSearchValue}
              onKeyPress={handleSearchKeyPress}
            />
          </label>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
