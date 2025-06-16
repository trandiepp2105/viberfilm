import "./App.css";
import React, { useRef, useState, useEffect, createContext, useContext } from "react";
import { Route, Routes, Navigate, useLocation, useNavigate, replace } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ListTVSeries from "./pages/ListTVSeries/ListTVSeries";
import AddVideoTVSeries from "./pages/AddVideoTVSeries/AddVideoTVSeries";
import AddTVSeries from "./pages/AddTVSeries/AddTVSeries";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import ListMovies from "./pages/ListMovies/ListMovies";
import ListFilmMaker from "./pages/ListFilmMaker/ListFilmMaker";
import { UserContext, UserProvider } from "./context/UserContext";

const ProtectedRoute = ({element}) => {
  const { isAuth, loading } = useContext(UserContext);

  if (loading) return null;
  return isAuth ? element : <Navigate to="/login" replace/>
}

function App() {

  return (
    <UserProvider>  
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Navigate to="/dashboard" replace />}/>
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard/>}/>}/>
          <Route path="/series" element={<ProtectedRoute element={<ListTVSeries/>}/>}/>
          <Route path="/series/add" element={<ProtectedRoute element={<AddTVSeries/>}/>}/>
          <Route path="/add-video-series" element={<ProtectedRoute element={<AddVideoTVSeries/>}/>}/>
          <Route path="/movies" element={<ProtectedRoute element={<ListMovies/>}/>}/>
          <Route path="/film-maker" element={<ProtectedRoute element={<ListFilmMaker/>}/>}/>
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
