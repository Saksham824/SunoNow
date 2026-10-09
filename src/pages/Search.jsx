import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Search.css";

const getImageUrl = (image) => {
  if (Array.isArray(image)) {
    return image[2]?.url || image[1]?.url || image[0]?.url || "";
  }

  return image || "";
};

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ songs: [], albums: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event?.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm || loading) return;

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const [searchResponse, artistResponse] = await Promise.all([
        axios.get("https://saavn.sumit.co/api/search", {
          params: { query: searchTerm },
        }),
        axios.get("https://saavn.sumit.co/api/search/artists", {
          params: { query: searchTerm },
        }),
      ]);
      const data = searchResponse.data?.data;

      setResults({
        songs: data?.songs?.results || [],
        albums: data?.albums?.results || [],
        artists: artistResponse.data?.data?.results || [],
      });
    } catch (err) {
      console.error("Search failed", err);
      setResults({ songs: [], albums: [], artists: [] });
      setError("We couldn’t load your results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (song) => {
    try {
      const songLink = song.perma_url || song.permaUrl;
      const params = songLink ? { link: songLink } : { ids: song.id };

      if (!songLink && !song.id) {
        window.alert("No valid song reference found.");
        return;
      }

      const response = await axios.get("https://saavn.sumit.co/api/songs", {
        params,
      });
      const fullSong = response.data?.data?.[0];

      if (!fullSong) {
        window.alert("Song details not found.");
        return;
      }

      const audioURL =
        fullSong.downloadUrl?.[4]?.url ||
        fullSong.downloadUrl?.at(-1)?.url;

      if (!audioURL || audioURL.endsWith(".com")) {
        window.alert("No playable audio for this song.");
        return;
      }

      const playableSong = {
        name: fullSong.name,
        primaryArtists: fullSong.artists?.primary?.map((artist) => artist.name).join(", "),
        url: audioURL,
        image: getImageUrl(fullSong.image),
      };

      window.dispatchEvent(new CustomEvent("play-song", { detail: playableSong }));
    } catch (err) {
      console.error("Failed to load song", err);
      window.alert("Couldn’t load this song. Please try again.");
    }
  };

  const totalResults =
    results.songs.length + results.albums.length + results.artists.length;

  return (
    <main className="search-page">
      <div className="search-ambient search-ambient-one" aria-hidden="true" />
      <div className="search-ambient search-ambient-two" aria-hidden="true" />

      <div className="search-content">
        <section className="search-hero">
          <div className="search-eyebrow">
            <span className="search-eyebrow-dot" />
            YOUR NEXT FAVORITE STARTS HERE
          </div>
          <h1>
            Find your
            <span> sound.</span>
          </h1>
          <p className="search-subtitle">
            Search across songs, albums, and artists to find the music you love.
          </p>

          <form className="search-form" onSubmit={handleSearch}>
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              type="search"
              placeholder="What do you want to listen to?"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search songs, albums, and artists"
            />
            <button type="submit" disabled={loading || !query.trim()}>
              {loading ? (
                <span className="search-button-loader" aria-label="Searching" />
              ) : (
                "Search"
              )}
            </button>
          </form>

          {!hasSearched && (
            <div className="search-hint">
              <span aria-hidden="true">↵</span> Press Enter to explore
            </div>
          )}
        </section>

        {loading && (
          <div className="search-status" role="status">
            <span className="search-spinner" />
            Finding something good for you…
          </div>
        )}

        {error && (
          <div className="search-message search-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={handleSearch}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && hasSearched && totalResults === 0 && (
          <div className="search-message search-empty">
            <span className="search-empty-icon" aria-hidden="true">♪</span>
            <h2>No matches just yet</h2>
            <p>Try another title, artist, or album name.</p>
          </div>
        )}

        {!loading && totalResults > 0 && (
          <div className="search-results">
            <div className="search-results-heading">
              <div>
                <span className="search-results-kicker">SEARCH RESULTS</span>
                <h2>Here’s what we found</h2>
              </div>
              <span className="search-result-count">
                {totalResults} {totalResults === 1 ? "result" : "results"}
              </span>
            </div>

            {results.songs.length > 0 && (
              <section className="search-section">
                <div className="search-section-heading">
                  <h3>Songs</h3>
                  <span>{results.songs.length}</span>
                </div>
                <div className="search-grid">
                  {results.songs.map((song) => (
                    <button
                      type="button"
                      className="search-card search-song-card"
                      key={song.id}
                      onClick={() => handlePlay(song)}
                      aria-label={`Play ${song.title || song.name}`}
                    >
                      <span className="search-card-art">
                        <img
                          src={getImageUrl(song.image)}
                          alt=""
                          loading="lazy"
                        />
                        <span className="search-play-button" aria-hidden="true">
                          ▶
                        </span>
                      </span>
                      <span className="search-card-title">
                        {song.title || song.name}
                      </span>
                      <span className="search-card-subtitle">
                        {song.primaryArtists || "Unknown artist"}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {results.albums.length > 0 && (
              <section className="search-section">
                <div className="search-section-heading">
                  <h3>Albums</h3>
                  <span>{results.albums.length}</span>
                </div>
                <div className="search-grid">
                  {results.albums.map((album) => (
                    <Link
                      to={`/songs/${album.id}`}
                      className="search-card search-link-card"
                      key={album.id}
                    >
                      <span className="search-card-art">
                        <img
                          src={getImageUrl(album.image)}
                          alt=""
                          loading="lazy"
                        />
                        <span className="search-card-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </span>
                      <span className="search-card-title">
                        {album.title || album.name}
                      </span>
                      <span className="search-card-subtitle">
                        {album.artist || album.primaryArtists || "Album"}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.artists.length > 0 && (
              <section className="search-section">
                <div className="search-section-heading">
                  <h3>Artists</h3>
                  <span>{results.artists.length}</span>
                </div>
                <div className="search-grid search-artist-grid">
                  {results.artists.map((artist) => (
                    <Link
                      to={`/artist/${artist.id}`}
                      className="search-card search-artist-card"
                      key={artist.id}
                    >
                      <span className="search-artist-image">
                        <img
                          src={getImageUrl(artist.image)}
                          alt=""
                          loading="lazy"
                        />
                      </span>
                      <span className="search-card-title">{artist.name}</span>
                      <span className="search-card-subtitle">Artist</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
