import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FiDisc, FiHeadphones, FiMusic, FiPlay, FiRadio } from "react-icons/fi";
import "./Artist.css";

const getImage = (images, preferredSize = 2) =>
  images?.[preferredSize]?.url || images?.at(-1)?.url || images?.[0]?.url || "";

const getArtists = (artists) => {
  if (Array.isArray(artists)) {
    return artists.map((artist) => artist.name).filter(Boolean).join(", ");
  }
  return artists || "Unknown artist";
};

export default function Artist() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumSongs, setAlbumSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [error, setError] = useState("");
  const [albumError, setAlbumError] = useState("");
  const [playingId, setPlayingId] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchArtist = async () => {
      setLoading(true);
      setError("");
      setArtist(null);
      setSongs([]);
      setAlbums([]);
      setSelectedAlbum(null);
      setAlbumSongs([]);

      try {
        const res = await axios.get(`https://saavn.sumit.co/api/artists?id=${id}`, {
          signal: controller.signal,
        });
        const artistData = res.data?.data;
        if (!artistData) throw new Error("Artist data was missing from the response.");

        setArtist(artistData);
        setSongs(artistData.topSongs || []);
        setAlbums(artistData.topAlbums || []);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error fetching artist", err);
          setError("We couldn't load this artist. Please try again in a moment.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchArtist();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!selectedAlbum) return undefined;

    const controller = new AbortController();
    const fetchAlbumSongs = async () => {
      setAlbumSongs([]);
      setAlbumError("");
      setAlbumLoading(true);

      try {
        const res = await axios.get(`https://saavn.sumit.co/api/albums?id=${selectedAlbum.id}`, {
          signal: controller.signal,
        });
        setAlbumSongs(res.data?.data?.songs || []);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error fetching album songs", err);
          setAlbumError("Couldn't load this album's tracks. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setAlbumLoading(false);
      }
    };

    fetchAlbumSongs();
    return () => controller.abort();
  }, [selectedAlbum]);

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
            primaryArtists: getArtists(fullSong.artists?.primary),
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

  if (loading) {
    return (
      <main className="artist-page">
        <section className="artist-loading" role="status" aria-label="Loading artist">
          <div className="artist-loading-cover" />
          <div className="artist-loading-copy">
            <span />
            <span />
            <span />
          </div>
          <p>Finding the perfect soundtrack...</p>
        </section>
      </main>
    );
  }

  if (error && !artist) {
    return (
      <main className="artist-page">
        <section className="artist-message">
          <FiRadio aria-hidden="true" />
          <h1>Artist unavailable</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!artist) return null;

  const artistName = artist.name || artist.artistName || "Unknown artist";
  const artistImage = getImage(artist.image, 2);

  return (
    <main className="artist-page">
      <section className="artist-hero">
        {artistImage && (
          <div
            className="artist-hero-backdrop"
            style={{ backgroundImage: `url("${artistImage}")` }}
            aria-hidden="true"
          />
        )}
        <div className="artist-hero-content">
          <div className="artist-portrait-wrap">
            {artistImage ? (
              <img className="artist-portrait" src={artistImage} alt={`${artistName}`} />
            ) : (
              <div className="artist-portrait artist-portrait-fallback">
                <FiMusic aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="artist-details">
            <span className="artist-eyebrow"><FiRadio aria-hidden="true" /> ARTIST</span>
            <h1>{artistName}</h1>
            <p className="artist-description">
              {artist.followerCount ? `${Number(artist.followerCount).toLocaleString()} followers` : "Your next favorite starts here."}
            </p>
            <div className="artist-meta">
              <span>{songs.length} {songs.length === 1 ? "song" : "songs"}</span>
              <i aria-hidden="true" />
              <span>{albums.length} {albums.length === 1 ? "album" : "albums"}</span>
            </div>
            {songs[0] && (
              <button
                className="artist-play-button"
                type="button"
                onClick={() => handlePlay(songs[0])}
                disabled={Boolean(playingId)}
              >
                <FiPlay aria-hidden="true" />
                {playingId === songs[0].id ? "Starting..." : "Play top song"}
              </button>
            )}
          </div>
        </div>
      </section>

      {error && <p className="artist-inline-error" role="alert">{error}</p>}

      <section className="artist-section" aria-labelledby="artist-songs-heading">
        <div className="artist-section-heading">
          <div>
            <span className="artist-section-kicker">ON REPEAT</span>
            <h2 id="artist-songs-heading">Popular songs</h2>
          </div>
          <span className="artist-count">{songs.length} TRACKS</span>
        </div>
        {songs.length ? (
          <div className="artist-card-grid">
            {songs.map((song, index) => (
              <button
                className="artist-media-card"
                key={song.id}
                type="button"
                onClick={() => handlePlay(song)}
                aria-label={`Play ${song.name}`}
              >
                <span className="artist-card-art">
                  {getImage(song.image) ? (
                    <img src={getImage(song.image)} alt="" loading="lazy" />
                  ) : (
                    <FiMusic aria-hidden="true" />
                  )}
                  <span className="artist-card-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="artist-card-play"><FiPlay aria-hidden="true" /></span>
                </span>
                <span className="artist-card-title">{song.name || "Untitled song"}</span>
                <span className="artist-card-subtitle">{song.primaryArtists || artistName}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="artist-empty">No popular songs are available right now.</p>
        )}
      </section>

      <section className="artist-section artist-albums-section" aria-labelledby="artist-albums-heading">
        <div className="artist-section-heading">
          <div>
            <span className="artist-section-kicker">EXPLORE THE CATALOG</span>
            <h2 id="artist-albums-heading">Albums & singles</h2>
          </div>
          <span className="artist-count">{albums.length} RELEASES</span>
        </div>
        {albums.length ? (
          <div className="artist-card-grid">
            {albums.map((album) => (
              <button
                className={`artist-media-card artist-album-card${selectedAlbum?.id === album.id ? " is-selected" : ""}`}
                key={album.id}
                type="button"
                onClick={() => setSelectedAlbum(album)}
                aria-pressed={selectedAlbum?.id === album.id}
              >
                <span className="artist-card-art">
                  {getImage(album.image) ? (
                    <img src={getImage(album.image)} alt="" loading="lazy" />
                  ) : (
                    <FiDisc aria-hidden="true" />
                  )}
                  <span className="artist-card-play"><FiHeadphones aria-hidden="true" /></span>
                </span>
                <span className="artist-card-title">{album.name || "Untitled release"}</span>
                <span className="artist-card-subtitle">{album.year || album.artist || "View tracklist"}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="artist-empty">No releases are available right now.</p>
        )}
      </section>

      {selectedAlbum && (
        <section className="artist-track-section" aria-labelledby="artist-track-heading">
          <div className="artist-section-heading">
            <div>
              <span className="artist-section-kicker">ALBUM TRACKLIST</span>
              <h2 id="artist-track-heading">{selectedAlbum.name}</h2>
            </div>
            {!albumLoading && !albumError && (
              <span className="artist-count">{albumSongs.length} TRACKS</span>
            )}
          </div>
          {albumLoading ? (
            <div className="artist-track-loading" role="status">
              <span />
              <span />
              <span />
              <span className="sr-only">Loading album tracks...</span>
            </div>
          ) : albumError ? (
            <p className="artist-inline-error" role="alert">{albumError}</p>
          ) : albumSongs.length ? (
            <div className="artist-track-list">
              {albumSongs.map((song, index) => (
                <button
                  className="artist-track"
                  key={song.id}
                  type="button"
                  onClick={() => handlePlay(song)}
                >
                  <span className="artist-track-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="artist-track-cover">
                    {getImage(song.image) ? <img src={getImage(song.image, 1)} alt="" /> : <FiMusic aria-hidden="true" />}
                  </span>
                  <span className="artist-track-info">
                    <span>{song.name || "Untitled song"}</span>
                    <small>{song.primaryArtists || artistName}</small>
                  </span>
                  <FiPlay className="artist-track-play" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : (
            <p className="artist-empty">This release doesn't have any tracks to show.</p>
          )}
        </section>
      )}
    </main>
  );
}
