import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCompactDisc, FaMusic, FaPlay } from "react-icons/fa";
import "./SongList.css";

export default function SongList() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://saavn.sumit.co/api/albums?id=${id}`)
      .then((res) => {
        setAlbum(res.data.data);
      })
      .catch((err) => console.error("Album load failed", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="song-list-page">
        <div className="song-list-loading" role="status" aria-label="Loading album">
          <span className="song-list-loader">
            <FaCompactDisc />
          </span>
          <p>Finding your next favorite...</p>
          <div className="song-list-skeleton" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!album) {
    return (
      <main className="song-list-page">
        <div className="song-list-empty">
          <FaMusic aria-hidden="true" />
          <h1>Album not found</h1>
          <p>We couldn’t find this album. Try choosing another one.</p>
        </div>
      </main>
    );
  }

  const songs = album.songs || [];
  const albumImage = album.image?.[2]?.url || album.image?.[0]?.url || "/fallback.jpg";
  const artists = album.artists?.primary || [];

  return (
    <main className="song-list-page">
      <div className="song-list-shell">
        <section className="album-hero" aria-labelledby="album-title">
          <div
            className="album-hero-backdrop"
            style={{ backgroundImage: `url("${albumImage}")` }}
            aria-hidden="true"
          />
          <div className="album-hero-content">
            <div className="album-cover-wrap">
              <img
                className="album-cover"
                src={albumImage}
                alt={`${album.name} cover`}
                loading="lazy"
              />
              <span className="album-cover-badge" aria-hidden="true">
                <FaCompactDisc />
              </span>
            </div>

            <div className="album-details">
              <span className="album-eyebrow">ALBUM COLLECTION</span>
              <h1 id="album-title">{album.name}</h1>
              <p className="album-description">
                {album.description || "A collection made for the moments that matter."}
              </p>
              {artists.length > 0 && (
                <div className="album-artists" aria-label="Album artists">
                  {artists.map((artist) => (
                    <span className="album-artist-chip" key={artist.id || artist.name}>
                      {artist.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="album-meta">
                {album.year && <span>{album.year}</span>}
                <span>{songs.length} {songs.length === 1 ? "track" : "tracks"}</span>
                {album.language && <span>{album.language}</span>}
              </div>
            </div>
          </div>
          <div className="album-hero-glow" aria-hidden="true" />
        </section>

        <section className="track-section" aria-labelledby="track-heading">
          <div className="track-heading-row">
            <div>
              <span className="track-kicker">THE PLAYLIST</span>
              <h2 id="track-heading">Tracklist</h2>
            </div>
            <span className="track-count">{String(songs.length).padStart(2, "0")} SONGS</span>
          </div>

          {songs.length ? (
            <div className="track-list">
              {songs.map((song, index) => {
                let audioURL = song.downloadUrl?.[4]?.url;
                if (!audioURL && song.downloadUrl?.length) {
                  audioURL = song.downloadUrl.at(-1)?.url;
                }
                const isPlayable = audioURL && !audioURL.endsWith(".com");
                const songArtists =
                  song.artists?.primary?.map((artist) => artist.name).join(", ") ||
                  "Unknown artist";
                const songImage = song.image?.[1]?.url || song.image?.[0]?.url || "/fallback.jpg";

                return (
                  <button
                    className={`track-row${isPlayable ? "" : " track-row-unavailable"}`}
                    key={song.id || `${song.name}-${index}`}
                    type="button"
                    disabled={!isPlayable}
                    onClick={() => {
                      const playableSong = {
                        name: song.name,
                        primaryArtists: songArtists,
                        url: audioURL,
                        image: songImage,
                      };
                      window.dispatchEvent(
                        new CustomEvent("play-song", { detail: playableSong }),
                      );
                    }}
                    aria-label={
                      isPlayable
                        ? `Play ${song.name} by ${songArtists}`
                        : `${song.name} is unavailable`
                    }
                  >
                    <span className="track-index" aria-hidden="true">
                      <span className="track-number">{String(index + 1).padStart(2, "0")}</span>
                      <FaPlay className="track-play-icon" />
                    </span>
                    <img
                      className="track-art"
                      src={songImage}
                      alt=""
                      loading="lazy"
                    />
                    <span className="track-copy">
                      <span className="track-name">{song.name}</span>
                      <span className="track-artist">{songArtists}</span>
                    </span>
                    {song.duration && (
                      <span className="track-duration">
                        {Math.floor(song.duration / 60)}:
                        {String(song.duration % 60).padStart(2, "0")}
                      </span>
                    )}
                    {!isPlayable && <span className="track-unavailable">Unavailable</span>}
                    <span className="track-action" aria-hidden="true">
                      <FaPlay />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="song-list-empty song-list-empty-inline">
              <FaMusic aria-hidden="true" />
              <h3>No tracks yet</h3>
              <p>There are no songs available in this album right now.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
