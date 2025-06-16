import React, { useState, useRef, useEffect } from "react";
import "./WatchVideoPage.scss";
import ReactPlayer from "react-player";
import { Link, useParams, useSearchParams } from "react-router-dom";
import screenfull from "screenfull";
import { videoService } from "../../services";
import movieService from "../../services/movieService";
import seriesService from "../../services/seriesService";
import recommendationService from "../../services/recommendationService";
import EpisodeList from "../../components/EpisodeList/EpisodeList";
import MovieGallery from "../../components/MovieGallery/MovieGallery";

const WatchVideoPage = () => {
  const { slug } = useParams(); // Get slug from URL
  const [searchParams] = useSearchParams(); // Get query parameters
  const episodeNumber = searchParams.get('episode'); // For series
  
  const [videoSrc, setVideoSrc] = useState("");  const [videoLoading, setVideoLoading] = useState(true); // Start with true for initial load
  const [videoError, setVideoError] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [hlsFailed, setHlsFailed] = useState(false); // Track HLS failure
  const timeoutRef = useRef(null); // Ref for timeout to clear it when needed

  const [contentData, setContentData] = useState(null); // Store movie/series data
  const [contentType, setContentType] = useState(null); // 'movie' or 'series'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [episodes, setEpisodes] = useState([]); // Store episodes for series
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState(1); // Current episode number for series
    // Similar content states
  const [similarContent, setSimilarContent] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  // View tracking states
  const [viewSession, setViewSession] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const viewTrackingRef = useRef(null); // Ref for tracking interval
  // Player states - moved up before useEffect that uses playerInfo
  const reactPlayerRef = useRef(null);
  const [playerInfo, setPlayerInfo] = useState({
    isPlaying: false,
    videoDuration: 120,
    playbackDuration: 0,
    installingTime: 0,
    isMuted: false,
    soundLevel: 50,
    maxSoundLevel: 100,
    isFullScreen: false,
    isShowController: true,
    speed: 1,
    listAudio: [
      {
        id: 1,
        name: "Tiếng Việt",
        isChosen: true,
      },
      {
        id: 2,
        name: "Tiếng Anh",
        isChosen: false,
      },
      {
        id: 3,
        name: "Tiếng Hàn",
        isChosen: false,
      },
    ],
    listSubtitle: [
      {
        id: 1,
        name: "Tiếng Việt",
        isChosen: true,
      },
      {
        id: 2,
        name: "Tiếng Anh",
        isChosen: false,
      },
      {
        id: 3,
        name: "Tiếng Hàn",
        isChosen: false,
      },
    ],
  });
  // Scroll to top when component mounts, when slug changes, or when episode changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, episodeNumber]);
  
  // Determine content type from URL path and fetch video data
  useEffect(() => {
    const fetchVideoData = async () => {      if (!slug) return;

        setLoading(true);
      setError(null);
      setVideoLoading(true);
      setVideoError(null);
      setVideoReady(false);
      setVideoSrc(""); // Reset video source first
      setHlsFailed(false); // Reset HLS failure state
      
      try {
        // Determine content type from current URL path
        const isMovie = window.location.pathname.includes('/watch/movie/');
        const isSeries = window.location.pathname.includes('/watch/series/');
          if (isMovie) {
          setContentType('movie');          // Fetch movie data by slug
          const movieData = await movieService.getMovieBySlug(slug);
          setContentData(movieData);
          // Use content.id for API call (content is the primary key)
          const videoResponse = await videoService.getMovieVideo(movieData.content.id);
          setVideoSrc(videoResponse.hls_url);        } else if (isSeries) {
          setContentType('series');
          // Fetch series data by slug
          const seriesData = await seriesService.getSeriesBySlug(slug);
          setContentData(seriesData);
            // For series, use episode number from query params (default to 1)
          const currentEpisode = episodeNumber ? parseInt(episodeNumber) : 1;
          setCurrentEpisodeNumber(currentEpisode);

          const videoResponse = await videoService.getEpisodeVideo(
            seriesData.content.id, 
            1, // season number - default to 1
            currentEpisode
          );
          setVideoSrc(videoResponse.hls_url);
            } else {
          throw new Error('Invalid content type in URL');
        }
        
      } catch (error) {
        setError(error.message || 'Failed to load video');
        setVideoError(error.message || 'Failed to load video');
        setVideoLoading(false); // Stop loading on error
        // Always fallback to demo video from server (this should now return absolute URL)
        setVideoSrc(`http://127.0.0.1:8000/media/videos/demo/hls/index.m3u8`);      } finally {
        setLoading(false);
        // Don't set videoLoading to false here - let ReactPlayer callbacks handle it
      }
    };
    
    fetchVideoData();
  }, [slug, episodeNumber]);
  
  // Track videoSrc changes - optimized to prevent infinite loops
  useEffect(() => {
    if (videoSrc) {
      setVideoLoading(true);
      setVideoReady(false); // Reset ready state when video source changes
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Set timeout for HLS fallback only - but only if video hasn't started playing
      if (videoSrc.includes('.m3u8') && !hlsFailed) {
        timeoutRef.current = setTimeout(() => {
          // Only fallback if video is still loading AND hasn't started playing
          if (videoLoading && !videoReady) {
            console.warn('HLS loading timeout after 30 seconds, trying MP4 fallback...');
            setHlsFailed(true);
            const mp4Url = videoSrc.replace('/hls/index.m3u8', '/demo_video.mp4');
            setVideoSrc(mp4Url);
          } else {
          }
          timeoutRef.current = null;
        }, 30000); // Increased to 30 seconds
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [videoSrc, hlsFailed]); // Removed videoLoading and videoReady from dependencies

  // Fetch episodes data for series
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!contentData?.content?.slug || contentType !== 'series') {
        setEpisodes([]);
        return;
      }

      setEpisodesLoading(true);
      try {
        const episodesData = await seriesService.getSeriesEpisodes(contentData.content.slug);
        setEpisodes(episodesData);
      } catch (episodesError) {
        console.error('Failed to fetch episodes:', episodesError);
        // Fallback to episodes from seriesData if available
        if (contentData?.episodes) {
          setEpisodes(contentData.episodes);
        } else {
          setEpisodes([]);
        }
      } finally {
        setEpisodesLoading(false);
      }
    };    fetchEpisodes();
  }, [contentData, contentType]);

  // Fetch similar content
  useEffect(() => {
    const fetchSimilarContent = async () => {
      if (!contentData?.content?.id || !contentType) return;

      setSimilarLoading(true);
      setSimilarContent([]); // Reset similar content

      try {
        
        let similarData = [];
        
        if (contentType === 'movie') {
          similarData = await recommendationService.getSimilarMovies(contentData.content.id, 25);
        } else if (contentType === 'series') {
          similarData = await recommendationService.getSimilarSeries(contentData.content.id, 25);
        }

        setSimilarContent(similarData);

      } catch (similarError) {
        console.error('Failed to fetch similar content:', similarError);
        // Fallback to genre-based similar content
        if (contentData?.content?.genres?.length > 0) {
          try {
            const fallbackData = await recommendationService.getSimilarByGenre(
              contentType,
              contentData.content.genres[0].id,
              contentData.content.id,
              25
            );
            const transformedFallback = fallbackData.map(item => ({
              id: item.id,
              title: item.title,
              img: item.banner_image || item.background_image || '',
              slug: item.slug,
              content_type: contentType,
              content: {
                id: item.id,
                title: item.title,
                slug: item.slug,
                content_type: contentType,
              },
              banner_img_url: item.banner_image || item.background_image || '',
            }));
            setSimilarContent(transformedFallback);
          } catch (fallbackError) {
            console.error('Failed to fetch fallback similar content:', fallbackError);
            setSimilarContent([]);
          }
        }
      } finally {
        setSimilarLoading(false);
      }
    };

    fetchSimilarContent();
  }, [contentData, contentType]); // Trigger when contentData or contentType changes

  // View tracking functions
  const startViewTracking = () => {
    if (!contentData?.content?.id || viewSession) return;

    const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setViewSession(sessionId);
    setStartTime(Date.now());
    setLastTrackedTime(0);

    // Track view progress every 5 seconds
    viewTrackingRef.current = setInterval(() => {
      if (reactPlayerRef.current && playerInfo.isPlaying) {
        const currentTime = reactPlayerRef.current.getCurrentTime();
        const watchedSeconds = Math.floor(currentTime);
        
        if (watchedSeconds > lastTrackedTime) {
          trackViewProgress(sessionId, watchedSeconds);
          setLastTrackedTime(watchedSeconds);
        }
      }
    }, 5000);

  };

  const trackViewProgress = async (sessionId, watchedSeconds) => {
    if (!contentData?.content?.id || watchedSeconds < 1) return;

    try {
      if (contentType === 'movie') {
        await videoService.trackMovieView(
          sessionId,
          contentData.content.id,
          watchedSeconds
        );
      } else if (contentType === 'series' && episodeNumber) {
        await videoService.trackEpisodeView(
          sessionId,
          contentData.content.id,
          1, // season number
          parseInt(episodeNumber),
          watchedSeconds
        );
      }
    } catch (error) {
      console.error('Failed to track view progress:', error);
    }
  };

  const stopViewTracking = () => {
    if (viewTrackingRef.current) {
      clearInterval(viewTrackingRef.current);
      viewTrackingRef.current = null;
    }

    // Final tracking when stopping
    if (viewSession && reactPlayerRef.current) {
      const finalWatchTime = Math.floor(reactPlayerRef.current.getCurrentTime());
      if (finalWatchTime > lastTrackedTime) {
        trackViewProgress(viewSession, finalWatchTime);
      }
    }

  };

  // Start tracking when video starts playing
  useEffect(() => {
    if (playerInfo.isPlaying && videoReady && !viewSession) {
      startViewTracking();
    }
  }, [playerInfo.isPlaying, videoReady, contentData]);

  // Cleanup tracking on unmount or content change
  useEffect(() => {
    return () => {
      stopViewTracking();    };
  }, [slug, episodeNumber]);

  const speedSelectRef = useRef(null);
  const [currentSpeedTranslate, setCurrentSpeedTranslate] = useState(0);
  useEffect(() => {
    setCurrentSpeedTranslate((500 - 60) * 0.5);
  }, []);
  const handleChangeSpeed = (event) => {
    if (speedSelectRef.current) {
      const rect = speedSelectRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left; // Vị trí click tính từ cạnh trái
      const percentage = (clickX / rect.width) * 100; // Tính phần trăm
      if (percentage > 0 && percentage < 12.5) {
        setPlayerInfo({
          ...playerInfo,
          speed: 0.5,
        });
        setCurrentSpeedTranslate(0);
      } else if (percentage >= 12.5 && percentage < 37.5) {
        setPlayerInfo({
          ...playerInfo,
          speed: 0.75,
        });
        setCurrentSpeedTranslate((rect.width - 10) * 0.25);
      } else if (percentage >= 37.5 && percentage < 62.5) {
        setPlayerInfo({
          ...playerInfo,
          speed: 1,
        });
        setCurrentSpeedTranslate((rect.width - 10) * 0.5);
      } else if (percentage >= 62.5 && percentage < 87.5) {
        setPlayerInfo({
          ...playerInfo,
          speed: 1.25,
        });
        setCurrentSpeedTranslate((rect.width - 10) * 0.75);
      } else if (percentage >= 87.5 && percentage <= 100) {
        setPlayerInfo({
          ...playerInfo,
          speed: 1.5,
        });
        setCurrentSpeedTranslate(rect.width - 10);
      }
    }
  };

  const togglePlay = () => {
    setPlayerInfo({
      ...playerInfo,
      isPlaying: !playerInfo.isPlaying,
    });
  };

  const handleMute = () => {
    setPlayerInfo({
      ...playerInfo,
      isMuted: !playerInfo.isMuted,
    });
  };

  const handleProgress = (state) => {
    setPlayerInfo({
      ...playerInfo,
      playbackDuration: state.playedSeconds,
    });
  };

  // Tua đi X giây
  const seekForward = (seconds) => {
    if (reactPlayerRef.current) {
      reactPlayerRef.current.seekTo(playerInfo.playbackDuration + seconds);
      // setPlayerInfo({
      //   ...playerInfo,
      //   playbackDuration: reactPlayerRef.current.getCurrentTime() + seconds,
      // });
    }
  };

  // Tua lại X giây
  const seekBackward = (seconds) => {
    if (reactPlayerRef.current) {
      reactPlayerRef.current.seekTo(playerInfo.playbackDuration - seconds);
      // setPlayerInfo({
      //   ...playerInfo,
      //   playbackDuration: reactPlayerRef.current.getCurrentTime() - seconds,
      // });
    }
  };
  const handleDuration = (duration) => {
    setPlayerInfo({
      ...playerInfo,
      videoDuration: duration,
    });
  };
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef(null);
  const handleFullScreen = () => {
    if (screenfull.isEnabled) {
      if (screenfull.isFullscreen) {
        screenfull.exit();
      } else {
        if (fullscreenContainerRef.current) {
          screenfull.request(fullscreenContainerRef.current);
        }
      }
    }  };

  const [isMoving, setIsMoving] = useState(false);
  // timeoutRef is already declared above for HLS timeout management
  useEffect(() => {
    const handleMouseMove = () => {
      setIsMoving(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsMoving(false);
      }, 5000);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(screenfull.isFullscreen);
    };

    window.addEventListener("mousemove", handleMouseMove);

    if (screenfull.isEnabled) {
      screenfull.on("change", handleFullscreenChange);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (screenfull.isEnabled) {
        screenfull.off("change", handleFullscreenChange);
      }
    };
  }, []);
  return (
    <div className="watch-video-page">
      <div className="watch-video-container" ref={fullscreenContainerRef}>        <div className="wrapper-video">          {videoLoading && (
            <div className="video-loading-overlay">
              <div className="loading-spinner"></div>
              <p>Loading video...</p>
              {videoSrc.includes('.m3u8') && (
                <button 
                  onClick={() => {
                    setHlsFailed(true);
                    const mp4Url = videoSrc.replace('/hls/index.m3u8', '/demo_video.mp4');
                    setVideoSrc(mp4Url);
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#f02a2a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Try MP4 instead
                </button>
              )}
            </div>
          )}
          
          {videoError && !videoLoading && (
            <div className="video-error-overlay">
              <div className="error-icon">⚠</div>
              <p>Video Error: {videoError}</p>
              <button 
                className="retry-button"
                onClick={() => {
                  setVideoError(null);
                  setVideoLoading(true);
                  // Retry with demo video
                  setVideoSrc(`http://127.0.0.1:8000/media/videos/demo/hls/index.m3u8`);
                }}
              >
                Retry with Demo Video
              </button>
            </div>
          )}
          
          {loading ? (
            <div className="video-loading">
              <div className="loading-spinner"></div>
              <p>Loading content...</p>
            </div>          ) : (<ReactPlayer
              key={videoSrc} // Force re-mount when URL changes
              ref={reactPlayerRef}
              url={videoSrc || `http://127.0.0.1:8000/media/videos/demo/hls/index.m3u8`}
              className={`react-player ${playerInfo.isPlaying ? "playing" : ""}`}
              height={"100%"}
              width={"100%"}
              playing={playerInfo.isPlaying}
              muted={playerInfo.isMuted}
              volume={playerInfo.soundLevel / playerInfo.maxSoundLevel}
              playbackRate={playerInfo.speed}
              onProgress={handleProgress}
              onDuration={handleDuration}              onReady={() => {
                // Clear HLS timeout since video is ready
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                // Only update if not already ready to avoid redundant state changes
                if (!videoReady) {
                  setVideoLoading(false);
                  setVideoError(null);
                  setVideoReady(true);
                }
              }}              onStart={() => {
                // Clear HLS timeout since video has started
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                // Only update loading if still loading to avoid redundant state changes
                if (videoLoading) {
                  setVideoLoading(false);
                }              }}
              onError={(error) => {
                setVideoError({
                  message: error.message,
                  target: error.target,
                  type: error.type,
                  timeStamp: error.timeStamp
                });
                
                // If HLS fails, try MP4 fallback
                if (videoSrc.includes('.m3u8') && !hlsFailed) {
                  setHlsFailed(true);
                  const mp4Url = videoSrc.replace('/hls/index.m3u8', '/demo_video.mp4');
                  // Add cache busting parameter
                  const cacheBustedUrl = `${mp4Url}?t=${Date.now()}`;
                  setVideoSrc(cacheBustedUrl);
                  return;
                }
                
                setVideoError('Failed to load video - trying cache refresh');
                setVideoLoading(false);
                
                // Try cache busting for HLS as well
                if (videoSrc.includes('.m3u8') && !videoSrc.includes('?t=')) {
                  const cacheBustedHls = `${videoSrc}?t=${Date.now()}`;
                  setTimeout(() => {
                    setVideoSrc(cacheBustedHls);
                    setVideoError(null);
                    setVideoLoading(true);
                  }, 1000);                }
              }}
              onBuffer={() => {
                // Only show loading overlay for initial buffering, not for normal buffering during playback
                if (!videoReady && !videoLoading) {
                  setVideoLoading(true);
                }
              }}
              onBufferEnd={() => {
                // Only hide loading if it was showing to avoid redundant state changes
                if (videoLoading && videoReady) {
                  setVideoLoading(false);
                }
              }}              onLoadStart={() => {
                // Only set loading if not already loading to avoid redundant state changes
                if (!videoLoading) {
                  setVideoLoading(true);
                }
              }}              onCanPlay={() => {
                // Only update if not already ready to avoid redundant state changes
                if (!videoReady) {
                  setVideoLoading(false);
                  setVideoReady(true);
                }
              }}              onCanPlayThrough={() => {
                // This event usually comes after onCanPlay, so only log it
              }}
              onLoadedMetadata={() => {
              }}              onLoadedData={() => {
                // Only update if not already ready to avoid redundant state changes
                if (!videoReady) {
                  setVideoLoading(false);
                  setVideoReady(true);
                }
              }}              // Enhanced HLS configuration for proper streaming
              config={{
                file: {
                  attributes: {
                    crossOrigin: 'anonymous',
                  },
                  forceHLS: true,
                  hlsOptions: {
                    enableWorker: false,
                    debug: true,
                    maxBufferLength: 30, // Buffer 30 seconds
                    maxMaxBufferLength: 600, // Max buffer 10 minutes
                    maxBufferSize: 60 * 1000 * 1000, // 60MB buffer
                    maxBufferHole: 0.5, // Max hole in buffer
                    lowBufferWatchdogPeriod: 0.5, // Check buffer every 0.5s
                    highBufferWatchdogPeriod: 3, // Check buffer every 3s when full
                    nudgeOffset: 0.1, // Nudge playhead by 0.1s if stalled
                    nudgeMaxRetry: 3, // Max nudge retries
                    maxSeekHole: 2, // Max seek hole tolerance
                    seekHoleNudgeDuration: 0.01, // Seek hole nudge duration
                    maxFragLookUpTolerance: 0.25, // Fragment lookup tolerance
                    liveSyncDurationCount: 3, // Live sync duration
                    liveMaxLatencyDurationCount: 10, // Max live latency
                    liveDurationInfinity: false, // Don't treat live as infinite
                    enableCEA708Captions: false, // Disable captions for better performance
                    stretchShortVideoTrack: false, // Don't stretch short tracks
                    maxAudioFramesDrift: 1, // Max audio frames drift
                    forceKeyFrameOnDiscontinuity: true, // Force keyframe on discontinuity
                    abrEwmaFastLive: 3.0, // ABR fast live EWMA
                    abrEwmaSlowLive: 9.0, // ABR slow live EWMA
                    abrEwmaFastVoD: 3.0, // ABR fast VoD EWMA
                    abrEwmaSlowVoD: 9.0, // ABR slow VoD EWMA
                    abrEwmaDefaultEstimate: 500000, // Default estimate 500kbps
                    abrBandWidthFactor: 0.95, // Bandwidth factor
                    abrBandWidthUpFactor: 0.7, // Bandwidth up factor                    maxStarvationDelay: 4, // Max starvation delay
                    maxLoadingDelay: 4, // Max loading delay
                    minAutoBitrate: 0, // Min auto bitrate
                    emeEnabled: false, // Disable EME for demo video (not encrypted)
                    // Timeout settings to improve loading
                    manifestLoadingTimeOut: 10000,
                    manifestLoadingMaxRetry: 3,
                    manifestLoadingRetryDelay: 1000,
                    levelLoadingTimeOut: 10000,
                    levelLoadingMaxRetry: 3,
                    levelLoadingRetryDelay: 1000,
                    fragLoadingTimeOut: 20000,
                    fragLoadingMaxRetry: 3,
                    fragLoadingRetryDelay: 1000,
                  }
                }
              }}
              
              // Additional debugging callbacks
              onPlay={() => {
              }}
              onPause={() => {
              }}
              onSeek={(seconds) => {
              }}
              onEnded={() => {
              }}
            />
          )}
          <div
            className="video-overlay"
            onClick={togglePlay}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "transparent",
              cursor: "pointer",
            }}
          />          {!playerInfo.isPlaying && videoReady && (
            <button className="play-btn" onClick={togglePlay}>
              <svg
                className="controller-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                role="img"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                data-icon="PlayStandard"
                aria-hidden="true"
              >
                <path
                  d="M5 2.69127C5 1.93067 5.81547 1.44851 6.48192 1.81506L23.4069 11.1238C24.0977 11.5037 24.0977 12.4963 23.4069 12.8762L6.48192 22.1849C5.81546 22.5515 5 22.0693 5 21.3087V2.69127Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
          )}{" "}
        </div>
        {isFullscreen && (
          <button className="back-to-home-btn" onClick={handleFullScreen}>
            <svg
              width="30px"
              height="30px"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0" />

              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g id="SVGRepo_iconCarrier">
                <path
                  fill="#ebeaea"
                  d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                />

                <path
                  fill="#ebeaea"
                  d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                />
              </g>
            </svg>
          </button>
        )}
        {
          <div
            className="video-controller"
            style={{
              opacity: isMoving && playerInfo.isPlaying ? 1 : 0,
              visibility:
                isMoving && playerInfo.isPlaying ? "visible" : "hidden",
              transition:
                "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
            }}
          >
            <div className="video-progress">
              <div className="progress-bar">
                <div className="progress-bar-inner">
                  {/* <div className="playback-duration-bar"></div>
                <div className="installing-time-bar"></div>
                <button type="button" className="scrubber-btn"></button> */}
                  <input
                    type="range"
                    name="progress-bar-input"
                    id="progress-bar-input"
                    className="progress-bar-input"
                    min={0}
                    max={playerInfo.videoDuration}
                    value={playerInfo.playbackDuration}
                    onChange={(e) => {
                      setPlayerInfo({
                        ...playerInfo,
                        playbackDuration: e.target.value,
                      });
                      reactPlayerRef.current.seekTo(e.target.value);
                    }}
                    style={{
                      background: `linear-gradient(to right, #f02a2a ${
                        (playerInfo.playbackDuration /
                          playerInfo.videoDuration) *
                        100
                      }%, #8E8D8D ${
                        (playerInfo.playbackDuration /
                          playerInfo.videoDuration) *
                        100
                      }%)`,
                    }}
                  />
                </div>
              </div>
              <span className="playback-duration">
                {
                  // Format thời gian
                  `${Math.floor(
                    (playerInfo.videoDuration - playerInfo.playbackDuration) /
                      60
                  )
                    .toString()
                    .padStart(2, "0")} : ${Math.floor(
                    (playerInfo.videoDuration - playerInfo.playbackDuration) %
                      60
                  )
                    .toString()
                    .padStart(2, "0")}`
                }
              </span>
            </div>
            <div className="bottom-controller">
              {playerInfo.isPlaying ? (
                <button className="pause-btn" onClick={togglePlay}>
                  <svg
                    className="controller-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    data-icon="PauseStandard"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M4.5 3C4 3.22386 4 3.59549 4 4V20C4 20.4044 4.22386 20.7691 4.5 21H9.5C9.77614 21 10 20.7691 10 20V4C10 3.59549 9.77614 3 9.5 3H4.5ZM14.5 3C14 3.22386 14 3.59549 14 4V20C14 20.4044 14.2239 21 14.5 21H19.5C19.7761 21 20 20.7691 20 20V4C20 3.59549 19.7761 3 19.5 3H14.5Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </button>
              ) : (
                <button className="play-btn" onClick={togglePlay}>
                  <svg
                    className="controller-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    data-icon="PlayStandard"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 2.69127C5 1.93067 5.81547 1.44851 6.48192 1.81506L23.4069 11.1238C24.0977 11.5037 24.0977 12.4963 23.4069 12.8762L6.48192 22.1849C5.81546 22.5515 5 22.0693 5 21.3087V2.69127Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </button>
              )}
              <button
                className="seek-btn seek-backward"
                onClick={() => seekBackward(10)}
              >
                <svg
                  className="controller-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  data-icon="Back10Standard"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.0198 2.04817C13.3222 1.8214 15.6321 2.39998 17.5557 3.68532C19.4794 4.97066 20.8978 6.88324 21.5694 9.09717C22.241 11.3111 22.1242 13.6894 21.2388 15.8269C20.3534 17.9643 18.7543 19.7286 16.714 20.8192C14.6736 21.9098 12.3182 22.2592 10.0491 21.8079C7.77999 21.3565 5.73759 20.1323 4.26989 18.3439C2.80219 16.5555 2 14.3136 2 12L0 12C-2.74181e-06 14.7763 0.962627 17.4666 2.72387 19.6127C4.48511 21.7588 6.93599 23.2278 9.65891 23.7694C12.3818 24.3111 15.2083 23.8918 17.6568 22.5831C20.1052 21.2744 22.0241 19.1572 23.0866 16.5922C24.149 14.0273 24.2892 11.1733 23.4833 8.51661C22.6774 5.85989 20.9752 3.56479 18.6668 2.02238C16.3585 0.479973 13.5867 -0.214321 10.8238 0.0578004C8.71195 0.265799 6.70517 1.02858 5 2.2532V1H3V5C3 5.55228 3.44772 6 4 6H8V4H5.99999C7.45608 2.90793 9.19066 2.22833 11.0198 2.04817ZM2 4V7H5V9H1C0.447715 9 0 8.55228 0 8V4H2ZM14.125 16C13.5466 16 13.0389 15.8586 12.6018 15.5758C12.1713 15.2865 11.8385 14.8815 11.6031 14.3609C11.3677 13.8338 11.25 13.2135 11.25 12.5C11.25 11.7929 11.3677 11.1758 11.6031 10.6488C11.8385 10.1217 12.1713 9.71671 12.6018 9.43388C13.0389 9.14463 13.5466 9 14.125 9C14.7034 9 15.2077 9.14463 15.6382 9.43388C16.0753 9.71671 16.4116 10.1217 16.6469 10.6488C16.8823 11.1758 17 11.7929 17 12.5C17 13.2135 16.8823 13.8338 16.6469 14.3609C16.4116 14.8815 16.0753 15.2865 15.6382 15.5758C15.2077 15.8586 14.7034 16 14.125 16ZM14.125 14.6501C14.5151 14.6501 14.8211 14.4637 15.043 14.0909C15.2649 13.7117 15.3759 13.1814 15.3759 12.5C15.3759 11.8186 15.2649 11.2916 15.043 10.9187C14.8211 10.5395 14.5151 10.3499 14.125 10.3499C13.7349 10.3499 13.4289 10.5395 13.207 10.9187C12.9851 11.2916 12.8741 11.8186 12.8741 12.5C12.8741 13.1814 12.9851 13.7117 13.207 14.0909C13.4289 14.4637 13.7349 14.6501 14.125 14.6501ZM8.60395 15.8554V10.7163L7 11.1405V9.81956L10.1978 9.01928V15.8554H8.60395Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </button>
              <button
                className="seek-btn seek-forward"
                onClick={() => seekForward(10)}
              >
                <svg
                  className="controller-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  data-icon="Forward10Standard"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.4443 3.68532C8.36795 2.39998 10.6778 1.8214 12.9802 2.04817C14.8093 2.22833 16.5439 2.90793 18 4H16V6H20C20.5523 6 21 5.55229 21 5V1H19V2.2532C17.2948 1.02859 15.2881 0.2658 13.1762 0.057802C10.4133 -0.214319 7.64154 0.479975 5.33316 2.02238C3.02478 3.56479 1.32262 5.85989 0.516718 8.51661C-0.289188 11.1733 -0.148981 14.0273 0.913451 16.5922C1.97588 19.1572 3.8948 21.2744 6.34325 22.5831C8.79169 23.8918 11.6182 24.3111 14.3411 23.7694C17.064 23.2278 19.5149 21.7588 21.2761 19.6127C23.0374 17.4666 24 14.7763 24 12L22 12C22 14.3136 21.1978 16.5555 19.7301 18.3439C18.2624 20.1323 16.22 21.3565 13.9509 21.8079C11.6818 22.2592 9.32641 21.9098 7.28604 20.8192C5.24567 19.7286 3.64657 17.9643 2.76121 15.8269C1.87585 13.6894 1.75901 11.3111 2.4306 9.09718C3.10219 6.88324 4.52065 4.97067 6.4443 3.68532ZM22 4V7H19V9H23C23.5523 9 24 8.55229 24 8V4H22ZM12.6018 15.5758C13.0389 15.8586 13.5466 16 14.125 16C14.7034 16 15.2078 15.8586 15.6382 15.5758C16.0753 15.2865 16.4116 14.8815 16.6469 14.3609C16.8823 13.8338 17 13.2135 17 12.5C17 11.7929 16.8823 11.1759 16.6469 10.6488C16.4116 10.1217 16.0753 9.71671 15.6382 9.43389C15.2078 9.14463 14.7034 9 14.125 9C13.5466 9 13.0389 9.14463 12.6018 9.43389C12.1713 9.71671 11.8385 10.1217 11.6031 10.6488C11.3677 11.1759 11.25 11.7929 11.25 12.5C11.25 13.2135 11.3677 13.8338 11.6031 14.3609C11.8385 14.8815 12.1713 15.2865 12.6018 15.5758ZM15.043 14.0909C14.8211 14.4637 14.5151 14.6501 14.125 14.6501C13.7349 14.6501 13.429 14.4637 13.207 14.0909C12.9851 13.7117 12.8741 13.1814 12.8741 12.5C12.8741 11.8186 12.9851 11.2916 13.207 10.9187C13.429 10.5395 13.7349 10.3499 14.125 10.3499C14.5151 10.3499 14.8211 10.5395 15.043 10.9187C15.2649 11.2916 15.3759 11.8186 15.3759 12.5C15.3759 13.1814 15.2649 13.7117 15.043 14.0909ZM8.60395 10.7163V15.8554H10.1978V9.01929L7 9.81956V11.1405L8.60395 10.7163Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </button>
              <button className="sound-adjust mute-btn" onClick={handleMute}>
                {playerInfo.isMuted ? (
                  <svg
                    className="controller-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    data-icon="VolumeOffStandard"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M11 4.00003C11 3.59557 10.7564 3.23093 10.3827 3.07615C10.009 2.92137 9.57889 3.00692 9.29289 3.29292L4.58579 8.00003H1C0.447715 8.00003 0 8.44774 0 9.00003V15C0 15.5523 0.447715 16 1 16H4.58579L9.29289 20.7071C9.57889 20.9931 10.009 21.0787 10.3827 20.9239C10.7564 20.7691 11 20.4045 11 20V4.00003ZM5.70711 9.70714L9 6.41424V17.5858L5.70711 14.2929L5.41421 14H5H2V10H5H5.41421L5.70711 9.70714ZM15.2929 9.70714L17.5858 12L15.2929 14.2929L16.7071 15.7071L19 13.4142L21.2929 15.7071L22.7071 14.2929L20.4142 12L22.7071 9.70714L21.2929 8.29292L19 10.5858L16.7071 8.29292L15.2929 9.70714Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    data-icon="VolumeHighStandard"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M24 12C24 8.28693 22.525 4.72597 19.8995 2.10046L18.4853 3.51468C20.7357 5.76511 22 8.81736 22 12C22 15.1826 20.7357 18.2348 18.4853 20.4852L19.8995 21.8995C22.525 19.2739 24 15.713 24 12ZM11 3.99995C11 3.59549 10.7564 3.23085 10.3827 3.07607C10.009 2.92129 9.57889 3.00685 9.29289 3.29285L4.58579 7.99995H1C0.447715 7.99995 0 8.44767 0 8.99995V15C0 15.5522 0.447715 16 1 16H4.58579L9.29289 20.7071C9.57889 20.9931 10.009 21.0786 10.3827 20.9238C10.7564 20.7691 11 20.4044 11 20V3.99995ZM5.70711 9.70706L9 6.41417V17.5857L5.70711 14.2928L5.41421 14H5H2V9.99995H5H5.41421L5.70711 9.70706ZM16.0001 12C16.0001 10.4087 15.368 8.88254 14.2428 7.75732L12.8285 9.17154C13.5787 9.92168 14.0001 10.9391 14.0001 12C14.0001 13.0608 13.5787 14.0782 12.8285 14.8284L14.2428 16.2426C15.368 15.1174 16.0001 13.5913 16.0001 12ZM17.0709 4.92889C18.9462 6.80426 19.9998 9.3478 19.9998 12C19.9998 14.6521 18.9462 17.1957 17.0709 19.071L15.6567 17.6568C17.157 16.1565 17.9998 14.1217 17.9998 12C17.9998 9.87823 17.157 7.8434 15.6567 6.34311L17.0709 4.92889Z"
                      fill="currentColor"
                    ></path>
                </svg>
                )}

                <input
                  onClick={(e) => e.stopPropagation()}
                  type="range"
                  name="sound-adjust-bar"
                  id="sound-adjust-bar"
                  className="sound-adjust-bar"
                  min={0}
                  max={playerInfo.maxSoundLevel}
                  value={playerInfo.isMuted ? 0 : playerInfo.soundLevel}
                  onChange={(e) => {
                    setPlayerInfo({
                      ...playerInfo,
                      soundLevel: e.target.value,
                    });
                  }}
                  style={{
                    background: `linear-gradient(to right, #FFFFFF ${playerInfo.soundLevel}%, #8E8D8D ${playerInfo.soundLevel}%)`,
                  }}
                />
              </button>
              <p className="video-title">
                <span>Sát Thủ Về Vườn </span>
                <span>T1</span>
                <span>Sát Thủ Huyền Thoại</span>
              </p>
              <button className="next-episode-btn">
                <svg
                  className="controller-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  data-icon="NextEpisodeStandard"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M22 3H20V21H22V3ZM4.28615 3.61729C3.28674 3.00228 2 3.7213 2 4.89478V19.1052C2 20.2787 3.28674 20.9977 4.28615 20.3827L15.8321 13.2775C16.7839 12.6918 16.7839 11.3082 15.8321 10.7225L4.28615 3.61729ZM4 18.2104V5.78956L14.092 12L4 18.2104Z"
                    fill="currentColor"
                  ></path>
                </svg>

                <div className="preview-next-episode">
                  <h3 className="heading">Tập tiếp theo</h3>

                  <div className="general-info-next-episode">
                    <div className="static-image">
                      <button className="play-btn">
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
                              d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
                              fill="#1C274C"
                            />{" "}
                          </g>
                        </svg>
                      </button>
                      <img
                        src="https://occ-0-64-325.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABSr9Esq4vBmNfvLZ1EqSS86vJIMpG8MPwTPRkhMU69NvgzW0CIFxUTa7bkyvhKOgy8qpU6QWvc5HkrJzOlB8HxDoh1S88riAFnZ1Lx99JcxCgJjfOSIgbZQ1Baeoj3m-wWC_.jpg?r=063"
                        alt=""
                      />
                    </div>
                    <div className="next-episode-description">
                      <h3 className="episode-number-and-name">
                        Tập 2: Đối đầu Sunhee và Bacho
                      </h3>
                      <p className="episode-content">
                        Knowing how to write a paragraph is incredibly
                        important. It’s a basic aspect of writing, and it is
                        something that everyone should know how to do.
                      </p>
                    </div>
                  </div>
                </div>
              </button>
              <button className="show-list-episode-btn">
                <svg
                  className="controller-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  data-icon="EpisodesStandard"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8 5H22V13H24V5C24 3.89543 23.1046 3 22 3H8V5ZM18 9H4V7H18C19.1046 7 20 7.89543 20 9V17H18V9ZM0 13C0 11.8954 0.895431 11 2 11H14C15.1046 11 16 11.8954 16 13V19C16 20.1046 15.1046 21 14 21H2C0.895431 21 0 20.1046 0 19V13ZM14 19V13H2V19H14Z"
                    fill="currentColor"
                  ></path>
                </svg>

                <div className="list-episode-popup">
                  <div className="title">Sát Thủ Về Vườn</div>
                  <ul>
                    <li className="episode-item">
                      <div className="general-infor">
                        <h3 className="episode-number">1</h3>
                        <h3 className="episode-name">Sát Thủ Huyền Thoại</h3>
                        <span className="divider"></span>
                      </div>
                    </li>
                    <li className="episode-item current-episode">
                      <div className="general-infor">
                        <h3 className="episode-number">2</h3>
                        <h3 className="episode-name">
                          Đối đầu Sunhee và Bacho
                        </h3>
                        <span className="divider"></span>
                      </div>
                      <div className="specific-info">
                        <div className="static-image">
                          <img
                            src="https://occ-0-64-325.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABSr9Esq4vBmNfvLZ1EqSS86vJIMpG8MPwTPRkhMU69NvgzW0CIFxUTa7bkyvhKOgy8qpU6QWvc5HkrJzOlB8HxDoh1S88riAFnZ1Lx99JcxCgJjfOSIgbZQ1Baeoj3m-wWC_.jpg?r=063"
                            alt=""
                          />
                        </div>
                        <p className="description">
                          Knowing how to write a paragraph is incredibly
                          important. It’s a basic aspect of writing, and it is
                          something that everyone should know how to do. There
                          is a specific structure that you have to follow when
                          you’re writing a paragraph.
                        </p>
                      </div>
                    </li>
                    <li className="episode-item">
                      <div className="general-infor">
                        <h3 className="episode-number">3</h3>
                        <h3 className="episode-name">
                          Chào mừng đến Surgar Park
                        </h3>
                        <span className="divider"></span>
                      </div>
                    </li>
                    <li className="episode-item">
                      <div className="general-infor">
                        <h3 className="episode-number">4</h3>
                        <h3 className="episode-name">Boiled sừng sỏ</h3>
                        <span className="divider"></span>
                      </div>
                    </li>
                  </ul>
                </div>
              </button>
              <button className="choose-subtitle-btn">
                {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                role="img"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                data-icon="SubtitlesStandard"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1 3C1 2.44772 1.44772 2 2 2H22C22.5523 2 23 2.44772 23 3V17C23 17.5523 22.5523 18 22 18H19V21C19 21.3688 18.797 21.7077 18.4719 21.8817C18.1467 22.0557 17.7522 22.0366 17.4453 21.8321L11.6972 18H2C1.44772 18 1 17.5523 1 17V3ZM3 4V16H12H12.3028L12.5547 16.1679L17 19.1315V17V16H18H21V4H3ZM10 9L5 9V7L10 7V9ZM19 11H14V13H19V11ZM12 13L5 13V11L12 11V13ZM19 7H12V9H19V7Z"
                  fill="currentColor"
                ></path>
              </svg> */}

                <svg
                  className="controller-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  data-icon="SubtitlesStandard"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1 3C1 2.44772 1.44772 2 2 2H22C22.5523 2 23 2.44772 23 3V17C23 17.5523 22.5523 18 22 18H19V21C19 21.3688 18.797 21.7077 18.4719 21.8817C18.1467 22.0557 17.7522 22.0366 17.4453 21.8321L11.6972 18H2C1.44772 18 1 17.5523 1 17V3ZM3 4V16H12H12.3028L12.5547 16.1679L17 19.1315V17V16H18H21V4H3ZM10 9L5 9V7L10 7V9ZM19 11H14V13H19V11ZM12 13L5 13V11L12 11V13ZM19 7H12V9H19V7Z"
                    fill="currentColor"
                  ></path>
                </svg>

                <div className="list-subtitle-and-sound">
                  <div className="list-sound">
                    <h3 className="heading">Âm thanh</h3>
                    <div className="list-sound-container">
                      {/* <div className="language-item">Tiếng Hàn [Gốc]</div>
                    <div className="language-item">Tiếng Bồ Đào Nha</div>
                    <div className="language-item">Tiếng Tây Ban Nha</div>
                    <div className="language-item active">Tiếng Việt</div> */}

                      {playerInfo.listAudio.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className={`language-item ${
                              item.isChosen ? "active" : ""
                            }`}
                            onClick={() => {
                              const newListAudio = playerInfo.listAudio.map(
                                (audio) => {
                                  return {
                                    ...audio,
                                    isChosen: false,
                                  };
                                }
                              );
                              newListAudio[index].isChosen = true;
                              setPlayerInfo({
                                ...playerInfo,
                                listAudio: newListAudio,
                              });
                            }}
                          >
                            {item.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="list-subtitle">
                    <h3 className="heading">Phụ đề</h3>
                    <div className="list-subtitle-container">
                      {playerInfo.listSubtitle.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className={`language-item ${
                              item.isChosen ? "active" : ""
                            }`}
                            onClick={() => {
                              const newListSubtitle =
                                playerInfo.listSubtitle.map((subtitle) => {
                                  return {
                                    ...subtitle,
                                    isChosen: false,
                                  };
                                });
                              newListSubtitle[index].isChosen = true;
                              setPlayerInfo({
                                ...playerInfo,
                                listSubtitle: newListSubtitle,
                              });
                            }}
                          >
                            {item.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </button>
              <button className="speed-controller-btn">
                <div className="speed-controller-container">
                  <h3 className="heading">Tốc độ phát lại</h3>
                  <div className="speed-selection-bar-container">
                    <div
                      className="speed-selection-bar"
                      ref={speedSelectRef}
                      onClick={handleChangeSpeed}
                    >
                      <button
                        className="speed-item"
                        // onClick={(e) => {
                        //   handleChangeSpeed(e, 0.5);
                        // }}
                      >
                        <div className="speed-value">0.5x</div>
                      </button>
                      <button
                        className="speed-item"
                        // onClick={(e) => {
                        //   handleChangeSpeed(e, 0.75);
                        // }}
                      >
                        <div className="speed-value">0.75x</div>
                      </button>
                      <button
                        className="speed-item"
                        // onClick={(e) => {
                        //   handleChangeSpeed(e, 1);
                        // }}
                      >
                        <div className="speed-value">1x (Bình thường)</div>
                      </button>
                      <button
                        className="speed-item"
                        // onClick={(e) => {
                        //   handleChangeSpeed(e, 1.25);
                        // }}
                      >
                        <div className="speed-value">1.25x</div>
                      </button>
                      <button
                        className="speed-item"
                        // onClick={(e) => {
                        //   handleChangeSpeed(e, 1.5);
                        // }}
                      >
                        <div className="speed-value">1.5x</div>
                      </button>
                      <span
                        className="active-speed"
                        style={{
                          transform: `translate(${
                            currentSpeedTranslate - 10
                          }px, -50%)`,
                        }}
                      ></span>
                    </div>
                  </div>
                </div>
                <svg
                  className="controller-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  data-icon="InternetSpeedStandard"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M19.0569 6.27006C15.1546 2.20629 8.84535 2.20629 4.94312 6.27006C1.01896 10.3567 1.01896 16.9985 4.94312 21.0852L3.50053 22.4704C-1.16684 17.6098 -1.16684 9.7454 3.50053 4.88481C8.18984 0.0013696 15.8102 0.0013696 20.4995 4.88481C25.1668 9.7454 25.1668 17.6098 20.4995 22.4704L19.0569 21.0852C22.981 16.9985 22.981 10.3567 19.0569 6.27006ZM15 14.0001C15 15.6569 13.6569 17.0001 12 17.0001C10.3431 17.0001 9 15.6569 9 14.0001C9 12.3432 10.3431 11.0001 12 11.0001C12.4632 11.0001 12.9018 11.105 13.2934 11.2924L16.2929 8.29296L17.7071 9.70717L14.7076 12.7067C14.895 13.0983 15 13.5369 15 14.0001Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </button>{" "}
              <button className="full-screen-btn" onClick={handleFullScreen}>
                {isFullscreen ? (
                  <svg
                    className="controller-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    data-icon="FullscreenExitStandard"
                    aria-hidden="true"
                    data-uia="control-fullscreen-exit"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M18 7H20V3C20 1.89543 19.1046 1 18 1H14V3H18V7ZM6 7V3H10V1H6C4.89543 1 4 1.89543 4 3V7H6ZM18 17V21H14V23H18C19.1046 23 20 22.1046 20 21V17H18ZM6 17H4V21C4 22.1046 4.89543 23 6 23H10V21H6V17Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="controller-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    data-icon="FullscreenEnterStandard"
                    aria-hidden="true"
                    data-uia="control-fullscreen-enter"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0 5C0 3.89543 0.895431 3 2 3H9V5H2V9H0V5ZM22 5H15V3H22C23.1046 3 24 3.89543 24 5V9H22V5ZM0 19V15H2V19C2 20.1046 2.89543 21 4 21H9V19H4V15H0V19ZM22 19V15H24V19C24 20.1046 23.1046 21 22 21H15V19H22Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        }
      </div>      <div className="video-details">
        <div className="video-details-container">
          <div className="current-media-wrapper">
            <div className="current-media-inner">
              <div className="current-media-header">
                <Link className="media-parent-link" to={contentType === 'movie' ? `/movies/${contentData?.content?.slug}` : `/series/${contentData?.content?.slug}`}>
                  <h4 className="media-parent-name">
                    {contentData?.content?.title || "Loading..."}
                  </h4>
                </Link>
                {contentType === 'series' && episodeNumber && (
                  <>
                    <span className="divider"></span>
                    <span className="views">Episode {episodeNumber}</span>
                  </>
                )}
              </div>
              
              <h1 className="episode-name">
                {contentType === 'series' && episodeNumber 
                  ? `E${episodeNumber} - ${contentData?.content?.title || 'Episode Title'}`
                  : contentData?.content?.title || "Loading..."
                }
              </h1>
              
              <div className="media-tags">
                <span className="maturity-rating">
                  {contentData?.content?.age_rating || "14+"}
                </span>
                <div className="meta-tags">
                  {contentData?.content?.genres?.slice(0, 3).map((genre, index) => (
                    <span key={index} className="tag">{genre.name}</span>
                  )) || (
                    <>
                      <span className="tag">Action</span>
                      <span className="tag">Adventure</span>
                      <span className="tag">Fantasy</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="release-date">
                Released on {contentData?.content?.release_date 
                  ? new Date(contentData.content.release_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : "Mar 1, 2022"
                }
              </div>
              
              <p className="media-description">
                {contentData?.content?.description || 
                 "Loading description..."}
              </p>

              <div className="details-table">
                <div className="table-row">
                  <div className="table-column-name">Audio</div>
                  <div className="table-column-value">
                    {contentData?.content?.audio_languages?.join(', ') || "Japanese, English"}
                  </div>
                </div>
                <div className="table-row">
                  <div className="table-column-name">Subtitles</div>
                  <div className="table-column-value">
                    {contentData?.content?.subtitle_languages?.join(', ') || 
                     "English, Bahasa Indonesia, Bahasa Melayu, Deutsch, Español (América Latina), Español (España), Français, Português (Brasil), Tiếng Việt, Русский, العربية, 中文 (简体), 中文 (繁体), ไทย"}
                  </div>
                </div>
                <div className="table-row">
                  <div className="table-column-name">Content Advisory</div>
                  <div className="table-column-value">
                    {contentData?.content?.age_rating || "14+"}, {contentData?.content?.content_warnings || "Profanity, Violence"}
                  </div>
                </div>
                {contentType === 'movie' && contentData?.content?.duration && (
                  <div className="table-row">
                    <div className="table-column-name">Duration</div>
                    <div className="table-column-value">{contentData.content.duration} minutes</div>
                  </div>
                )}
                {contentType === 'series' && (
                  <div className="table-row">
                    <div className="table-column-name">Type</div>
                    <div className="table-column-value">Series</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="media-image-wrapper">
            <div className="media-image-container">
              <img 
                src={contentData?.content?.banner_img_url || contentData?.content?.background_image || 'https://via.placeholder.com/300x450'} 
                alt={contentData?.content?.title || 'Media poster'} 
                className="media-poster" 
              />
            </div>
          </div>
        </div>

        {/* Episode List for Series */}
        {contentType === 'series' && (
          <div className="episode-list-section">
            {episodesLoading ? (
              <div className="episodes-loading">
                <p>Loading episodes...</p>
              </div>
            ) : (              <EpisodeList 
                seriesData={contentData} 
                episodes={episodes}
                episodesLoading={episodesLoading}
                seriesSlug={contentData?.content?.slug}
                currentEpisode={episodeNumber ? parseInt(episodeNumber) : 1}
              />
            )}
          </div>
        )}        {/* Similar Content Section */}
        <div className="similar-content-section">
          {similarLoading ? (
            <div className="similar-loading">
              <p>Loading similar content...</p>
            </div>
          ) : similarContent.length > 0 ? (
            <MovieGallery 
              genre={contentType === 'movie' ? "Similar Movies" : "Similar Series"} 
              listMovie={similarContent}
              canExpand={false}
            />
          ) : (
            !similarLoading && (
              <div className="no-similar-content">
                <p>No similar content found</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchVideoPage;
