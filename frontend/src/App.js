import "./App.css";
import React, { useRef, useState, useEffect, createContext } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import BrowsePage from "./pages/BrowsePage/BrowsePage";
import SearchPage from "./pages/SearchPage/SearchPage";
import HomePage from "./pages/HomePage/HomePage";
import PreviewModal from "./components/PreviewModal/PreviewModal";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import NewAndPopularPage from "./pages/NewAndPopularPage/NewAndPopularPage";
import WatchVideoPage from "./pages/WatchVideoPage/WatchVideoPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BounceLoader from "react-spinners/BounceLoader";
import MovieDetailPage from "./pages/MovieDetailPage/MovieDetailPage";

export const AppContext = createContext();

function App() {
  const appRef = useRef(null);
  const location = useLocation();

  // Preview modal state
  const [previewMovie, setPreviewMovie] = useState({
    isOpen: false,
    movie: null,
  });

  // Loading state
  const [loading, setLoading] = useState(false);

  // Toast notification handler
  const handleNotify = (notify) => {
    toast[notify.type](notify.message);
  };

  // Loading spinner styles
  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "#f1c40f",
  };

  // Prevent body scroll when loading
  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "auto";
  }, [loading]);

  return (
    <AppContext.Provider
      value={{
        previewMovie,
        setPreviewMovie,
        handleNotify,
        setLoading,
      }}
    >
      <div className="App" ref={appRef}>
        <ToastContainer className="toast-container" />

        {/* Loading Spinner */}
        {loading && (
          <div className="loading-container">
            <BounceLoader
              color={"#f1c40f"}
              loading={true}
              cssOverride={override}
            />
          </div>
        )}

        {/* Navigation Bar */}
        <div className="header">
          <NavBar />
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Preview Modal */}
          {previewMovie.isOpen && <PreviewModal movie={previewMovie.movie} />}
          
          {/* Routes */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse/*" element={<BrowsePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/new-and-popular" element={<NewAndPopularPage />} /> {/* New & Popular page */}
            <Route path="/watch/movie/:slug" element={<WatchVideoPage />} />
            <Route path="/watch/series/:slug" element={<WatchVideoPage />} />
            <Route path="/series/*" element={<MovieDetailPage />} />
            <Route path="/movies/*" element={<MovieDetailPage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>

        {/* Footer */}
        <div className="footer">
          <Footer />
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
