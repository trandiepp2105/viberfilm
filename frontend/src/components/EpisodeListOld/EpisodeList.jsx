import React, { useState, useRef, useEffect } from "react";
import "./EpisodeList.scss";
import EpisodeCard from "../EpisodeCard/EpisodeCard";

// Dữ liệu mẫu nhiều season
const seasons = [
	{
		season_number: 1,
		series_name: "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.",
		episodes: [
			{
				id: 1,
				season_number: 1,
				series_name: "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.",
				episode_number: 1,
				episode_name: "Defense and First Battle",
				release_date: "2020-01-08",
				duration: 23,
				description: "New World Online's seventh event begins, and it's a battle tower event with multiple difficulty levels. Maple and Sally team up to take on the highest difficulty level, giving the game's admins more than they bargained for...",
				thumbnail: "https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=contain,format=auto,quality=70,width=320,height=180/catalog/crunchyroll/0eb69d5eaa6d3ca8e03910221c904c9f.jpg",
			},
			{
				id: 2,
				season_number: 1,
				series_name: "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.",
				episode_number: 2,
				episode_name: "Defense and Friends",
				release_date: "2020-01-15",
				duration: 23,
				description: "Maple and Sally make new friends and get invited to a guild. Together they work toward building a team that will let them compete in the upcoming team events.",
				thumbnail: "https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=contain,format=auto,quality=70,width=320,height=180/catalog/crunchyroll/0eb69d5eaa6d3ca8e03910221c904c9f.jpg",
			},
			{
				id: 3,
				season_number: 1,
				series_name: "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.",
				episode_number: 3,
				episode_name: "Defense and Reaching Second Level",
				release_date: "2020-01-22",
				duration: 23,
				description: "After Maple gets nerfed, her and Sally do some exploring before challenging the dungeon that leads to the second level. Can they clear it in time for the second event?",
				thumbnail: "https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=contain,format=auto,quality=70,width=320,height=180/catalog/crunchyroll/0eb69d5eaa6d3ca8e03910221c904c9f.jpg",
			},
			{
				id: 4,
				season_number: 1,
				series_name: "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.",
				episode_number: 4,
				episode_name: "Defense and Second Event",
				release_date: "2020-01-29",
				duration: 23,
				description: "The guild works together to explore new areas and help each other out. Maple discovers some interesting new abilities.",
				thumbnail: "https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=contain,format=auto,quality=70,width=320,height=180/catalog/crunchyroll/0eb69d5eaa6d3ca8e03910221c904c9f.jpg",
			},
		],
	},
	{
		season_number: 2,
		series_name: "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.",
		episodes: [
			// Dữ liệu mẫu giống season 1, chỉ đổi id, season_number, episode_number
			{
				id: 101,
				season_number: 2,
				series_name: "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.",
				episode_number: 1,
				episode_name: "New Season Begins",
				release_date: "2021-01-08",
				duration: 23,
				description: "Maple returns for a new season of adventures with her friends, facing new challenges and even tougher opponents.",
				thumbnail: "https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=contain,format=auto,quality=70,width=320,height=180/catalog/crunchyroll/0eb69d5eaa6d3ca8e03910221c904c9f.jpg",
			},
			{
				id: 102,
				season_number: 2,
				series_name: "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.",
				episode_number: 2,
				episode_name: "More Defense, More Fun",
				release_date: "2021-01-15",
				duration: 23,
				description: "The guild faces new events and Maple finds even more creative ways to defend herself.",
				thumbnail: "https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=contain,format=auto,quality=70,width=320,height=180/catalog/crunchyroll/0eb69d5eaa6d3ca8e03910221c904c9f.jpg",
			},
		],
	},
];

const EpisodeList = ({ seriesData }) => {
	// Sử dụng dữ liệu từ API hoặc fallback về dữ liệu mẫu
	const availableSeasons = seriesData?.seasons || seasons;
	const [currentSeason, setCurrentSeason] = useState(availableSeasons[0] || seasons[0]);
	
	// Cập nhật season hiện tại khi seriesData thay đổi
	useEffect(() => {
		if (seriesData?.seasons && seriesData.seasons.length > 0) {
			setCurrentSeason(seriesData.seasons[0]);
		}
	}, [seriesData]);

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Đóng dropdown khi click ra ngoài
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false);
			}
		}
		if (dropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [dropdownOpen]);

	return (
		<div className="episode-list">
			<div className="episode-list__header">
				<div className="episode-list__season-dropdown" ref={dropdownRef}>
					<span
						className={`episode-list__season${dropdownOpen ? " open" : ""}`}
						onClick={() => setDropdownOpen((v) => !v)}
					>
						<span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 8, transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(-180deg)' : 'none' }}>
							<svg width="22" height="22" viewBox="-6.5 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M18.813 11.406l-7.906 9.906c-0.75 0.906-1.906 0.906-2.625 0l-7.906-9.906c-0.75-0.938-0.375-1.656 0.781-1.656h16.875c1.188 0 1.531 0.719 0.781 1.656z" fill="#1de9b6"/>
							</svg>
						</span>
						S{currentSeason.season_number}: {currentSeason.series_name}
					</span>
					{dropdownOpen && (
						<div className="episode-list__season-list">
							{availableSeasons.map((s) => (
								<div
									key={s.season_number}
									className={`episode-list__season-item${s.season_number === currentSeason.season_number ? " active" : ""}`}
									onClick={() => {
										setCurrentSeason(s);
										setDropdownOpen(false);
									}}
								>
									<span className="episode-list__season-title">
										S{s.season_number}: {s.series_name}
									</span>
									<span className="episode-list__season-epcount">
										{s.episodes.length} Episodes
									</span>
								</div>
							))}
						</div>
					)}
				</div>
				<div className="episode-list__actions">
					<span className="episode-list__sort">
						<i className="fa fa-sort-amount-asc" /> OLDEST
					</span>
					<span className="episode-list__options">
						<i className="fa fa-ellipsis-v" /> OPTIONS
					</span>
				</div>
			</div>
			<div className="episode-list__grid">
				{currentSeason.episodes.map((ep) => (
					<div className="episode-list__item" key={ep.id}>
						<EpisodeCard key={ep.id} episode={ep} />
					</div>
				))}
			</div>
		</div>
	);
};

export default EpisodeList;
