import { useContext, useEffect, useRef, useState } from "react";
import { FaPause, FaPlay, FaVolumeUp } from "react-icons/fa";
import { MusicContext } from "../context/MusicPlayerContext";
import "./MusicPlayer.css";

export default function MusicPlayer() {
  const { currentSong } = useContext(MusicContext);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    audio.load();
    audio.play().catch(() => setIsPlaying(false));
  }, [currentSong]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  };

  const handleSeek = (event) => {
    const time = Number(event.target.value);
    if (!audioRef.current) return;

    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolume = (event) => {
    const nextVolume = Number(event.target.value);
    if (audioRef.current) audioRef.current.volume = nextVolume;
    setVolume(nextVolume);
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumeLevel = volume * 100;

  return (
    <section className="music-player" aria-label="Music player">
      <div className="music-player__glow" aria-hidden="true" />

      <div className="music-player__song">
        <div className={`music-player__art ${isPlaying ? "is-playing" : ""}`}>
          {currentSong.image ? (
            <img
              className="music-player__image"
              src={currentSong.image}
              alt=""
              loading="lazy"
            />
          ) : (
            <div className="music-player__art-placeholder" aria-hidden="true">
              <FaPlay />
            </div>
          )}
          <span className="music-player__art-shine" aria-hidden="true" />
        </div>

        <div className="music-player__song-info">
          <span className="music-player__eyebrow">
            <span className={`music-player__status ${isPlaying ? "is-playing" : ""}`} />
            {isPlaying ? "Now playing" : "Ready to play"}
          </span>
          <p className="music-player__title" title={currentSong.name}>
            {currentSong.name}
          </p>
          <p className="music-player__artist" title={currentSong.primaryArtists}>
            {currentSong.primaryArtists}
          </p>
        </div>
      </div>

      <div className="music-player__main">
        <div className="music-player__controls">
          <button
            className="music-player__play-button"
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FaPause /> : <FaPlay className="music-player__play-icon" />}
          </button>
        </div>

        <div className="music-player__timeline">
          <span className="music-player__time">{formatTime(currentTime)}</span>
          <input
            className="music-player__range music-player__range--progress"
            type="range"
            min={0}
            max={duration || 0}
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            style={{ "--range-progress": `${progress}%` }}
            aria-label="Seek through track"
          />
          <span className="music-player__time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="music-player__volume">
        <FaVolumeUp aria-hidden="true" />
        <input
          className="music-player__range music-player__range--volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolume}
          style={{ "--range-progress": `${volumeLevel}%` }}
          aria-label="Volume"
        />
      </div>

      <audio
        ref={audioRef}
        src={currentSong.url}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </section>
  );
}
