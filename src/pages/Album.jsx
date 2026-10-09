import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FiClock, FiDisc, FiMusic, FiPlay } from "react-icons/fi";
import "./Album.css";

const getImage = (images, preferredSize = 2) =>
  images?.[preferredSize]?.url || images?.at(-1)?.url || images?.[0]?.url;

const getArtists = (artists) => {
  if (Array.isArray(artists)) return artists.map((artist) => artist.name).filter(Boolean).join(", ");
  return artists || "Unknown artist";
};

const formatDuration = (duration) => {
  const seconds = Number(duration);
  if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

export default function Album() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playingId, setPlayingId] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchAlbum = async () => {
      setLoading(true);
      setError("");
      setAlbum(null);
      setSongs([]);

      try {
        const res = await axios.get(`https://saavn.sumit.co/api/albums?id=${id}`, {
          signal: controller.signal,
        });
        const albumData = res.data?.data;
        setAlbum(albumData || null);
        setSongs(albumData?.songs || []);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error fetching album", err);
          setError("We couldn't load this album. Please try again in a moment.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchAlbum();
    return () => controller.abort();
  }, [id]);

  const handlePlay = async (song) => {
    setPlayingId(song.id);
    setError("");

    try {
      const res = await axios.get(`https://saavn.sumit.co/api/songs?ids=${song.id}`);
      const fullSong = res.data?.data?.[0];
      const audioURL = fullSong?.downloadUrl?.at(-1)?.url;

      if (!audioURL || audioURL.endsWith(".com")) {
        setError(`No playable audio was found for "${song.name}".`);
        return;
      }

      window.dispatchEvent(
        new CustomEvent("play-song", {
          detail: {
            name: fullSong.name,
            primaryArtists: fullSong.artists?.primary?.map((artist) => artist.name).join(", "),
            url: audioURL,
            image: getImage(fullSong.image, 1),
          },
        }),
      );
    } catch (err) {
      console.error("Play failed", err);
      setError("Couldn't start playback. Please try again.");
    } finally {
      setPlayingId("");
    }
  };

  const albumImage = getImage(album?.image);
  const albumArtists = getArtists(album?.artists?.primary || album?.artist);
  const releaseYear = album?.year || album?.releaseDate?.slice(0, 4);

  return (
    <main className="album-page">
      {loading ? (
        <div className="album-loading" role="status" aria-label="Loading album">
          <div className="album-loading-cover" />
          <div className="album-loading-lines">
            <span />
            <span />
            <span />
          </div>
          <p>Finding your next favorite...</p>
        </div>
      ) : error && !album ? (
        <section className="album-message">
          <FiDisc aria-hidden="true" />
          <h1>Album unavailable</h1>
          <p>{error}</p>
        </section>
      ) : !album ? (
        <section className="album-message">
          <FiDisc aria-hidden="true" />
          <h1>Album not found</h1>
          <p>We couldn't find the album you were looking for.</p>
        </section>
      ) : (
        <>
          <section className="album-hero">
            {albumImage && (
              <div
                className="album-hero-backdrop"
                style={{ backgroundImage: `url("${albumImage}")` }}
                aria-hidden="true"
              />
            )}
            <div className="album-hero-content">
              <div className="album-cover-wrap">
                {albumImage ? (
                  <img className="album-cover" src={albumImage} alt={`${album.name} album cover`} />
                ) : (
                  <div className="album-cover album-cover-fallback">
                    <FiMusic aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="album-details">
                <span className="album-eyebrow">ALBUM</span>
                <h1>{album.name || "Untitled album"}</h1>
                <p className="album-artist">{albumArtists}</p>
                <div className="album-meta">
                  {releaseYear && <span>{releaseYear}</span>}
                  {releaseYear && songs.length > 0 && <i aria-hidden="true" />}
                  <span>{songs.length} {songs.length === 1 ? "song" : "songs"}</span>
                  {album.language && <><i aria-hidden="true" /><span>{album.language}</span></>}
                </div>
                <button
                  className="album-play-button"
                  type="button"
                  onClick={() => songs[0] && handlePlay(songs[0])}
                  disabled={!songs.length || Boolean(playingId)}
                >
                  <FiPlay aria-hidden="true" />
                  Play album
                </button>
              </div>
            </div>
          </section>

          <section className="album-tracks-section" aria-labelledby="album-tracks-heading">
            <div className="album-section-heading">
              <div>
                <span className="album-eyebrow">THE COLLECTION</span>
                <h2 id="album-tracks-heading">Tracklist</h2>
              </div>
              <span className="album-track-count">{songs.length} TRACKS</span>
            </div>

            {error && <p className="album-inline-error" role="alert">{error}</p>}

            {songs.length ? (
              <div className="album-track-list">
                <div className="album-track-columns" aria-hidden="true">
                  <span>#</span>
                  <span>TRACK</span>
                  <FiClock />
                </div>
                {songs.map((song, index) => {
                  const songImage = getImage(song.image);
                  const isPlaying = playingId === song.id;

                  return (
                    <button
                      className={`album-track${isPlaying ? " is-playing" : ""}`}
                      key={song.id}
                      type="button"
                      onClick={() => handlePlay(song)}
                      disabled={Boolean(playingId)}
                      aria-label={`Play ${song.name}`}
                    >
                      <span className="album-track-number">{isPlaying ? <FiMusic /> : String(index + 1).padStart(2, "0")}</span>
                      <span className="album-track-art">
                        {songImage ? <img src={songImage} alt="" loading="lazy" /> : <FiMusic aria-hidden="true" />}
                        <span className="album-track-overlay"><FiPlay aria-hidden="true" /></span>
                      </span>
                      <span className="album-track-copy">
                        <span className="album-track-title">{song.name}</span>
                        <span className="album-track-artist">{getArtists(song.artists?.primary || song.primaryArtists)}</span>
                      </span>
                      <span className="album-track-duration">{formatDuration(song.duration)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="album-empty">
                <FiMusic aria-hidden="true" />
                <p>This album doesn&apos;t have any tracks yet.</p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
