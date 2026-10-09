import { useEffect, useState } from "react";
import axios from "axios";

function PlayIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5.7c0-.8.9-1.3 1.6-.9l10.1 6.3a1 1 0 0 1 0 1.7L9.6 19.1a1.1 1.1 0 0 1-1.6-.9V5.7Z" />
    </svg>
  );
}

function MediaCard({ item, type, onPlay }) {
  const isAlbum = type === "album";
  const title = item.title || item.name || "Untitled";
  const subtitle = isAlbum
    ? item.artist || "Album"
    : item.primaryArtists || item.artist || "Unknown artist";
  const image =
    item.image?.[2]?.url ||
    item.image?.[1]?.url ||
    item.image?.[0]?.url ||
    "/fallback.jpg";

  return (
    <button
      type="button"
      onClick={() => onPlay(item)}
      className="group relative flex min-w-0 flex-col rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 text-left transition duration-300 hover:-translate-y-1 hover:border-emerald-300/25 hover:bg-white/[0.07] hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      aria-label={`Play ${isAlbum ? "album" : "song"}: ${title}`}
    >
      <span className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-800">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        <span className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
        <span className="absolute bottom-3 right-3 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-emerald-300 text-gray-950 opacity-0 shadow-[0_0_28px_rgba(110,231,183,0.38)] transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <PlayIcon />
        </span>
      </span>
      <span className="mt-4 block truncate text-sm font-semibold text-white sm:text-base">
        {title}
      </span>
      <span className="mt-1 block truncate text-xs text-gray-400 sm:text-sm">
        {subtitle}
      </span>
    </button>
  );
}

function LoadingCards() {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5"
      aria-label="Loading music"
      role="status"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-white/6 bg-white/3 p-3"
        >
          <div className="aspect-square rounded-xl bg-white/[7" />
          <div className="mt-4 h-4 w-3/4 rounded bg-white/8" />
          <div className="mt-2 h-3 w-1/2 rounded bg-white/5" />
        </div>
      ))}
      <span className="sr-only">Loading music recommendations...</span>
    </div>
  );
}

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const fetchRandomData = async () => {
      try {
        const [songRes, albumRes] = await Promise.all([
          axios.get("https://saavn.sumit.co/api/search/songs?query=punjabi"),
          axios.get("https://saavn.sumit.co/api/search/albums?query=punjabi"),
        ]);
        setSongs(songRes.data.data.results.slice(0, 20));
        setAlbums(albumRes.data.data.results.slice(0, 20));
      } catch (err) {
        console.error("Home data fetch failed", err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomData();
  }, []);

  const handlePlaySong = async (song) => {
    try {
      if (!song.id) {
        alert("No valid song ID found.");
        return;
      }
      const res = await axios.get(`https://saavn.sumit.co/api/songs?ids=${song.id}`);
      const fullSong = res.data.data?.[0];

      if (!fullSong) {
        alert("Song not found.");
        return;
      }

      let audioURL = fullSong.downloadUrl?.[4]?.url;
      if (!audioURL && fullSong.downloadUrl?.length) {
        audioURL = fullSong.downloadUrl.at(-1).url;
      }

      if (!audioURL || audioURL.endsWith(".com")) {
        alert("No playable audio for this song.");
        return;
      }

      const playableSong = {
        name: fullSong.name,
        primaryArtists: fullSong.artists?.primary?.map((artist) => artist.name).join(", ") || "",
        url: audioURL,
        image: fullSong.image?.[1]?.url || fullSong.image?.[0]?.url,
      };

      window.dispatchEvent(new CustomEvent("play-song", { detail: playableSong }));
    } catch (err) {
      console.error("Failed to play song", err);
    }
  };

  const handlePlayAlbum = async (album) => {
    try {
      const res = await axios.get(`https://saavn.sumit.co/api/albums?id=${album.id}`);
      const albumData = res.data.data;

      if (!albumData?.songs?.length) {
        alert("No songs found in album.");
        return;
      }

      const firstSong = albumData.songs[0];
      let audioURL = firstSong.downloadUrl?.[4]?.url;
      if (!audioURL && firstSong.downloadUrl?.length) {
        audioURL = firstSong.downloadUrl.at(-1).url;
      }

      if (!audioURL || audioURL.endsWith(".com")) {
        alert("No playable audio in album.");
        return;
      }

      const playableSong = {
        name: firstSong.name,
        primaryArtists: firstSong.artists?.primary?.map((artist) => artist.name).join(", ") || "",
        url: audioURL,
        image: firstSong.image?.[1]?.url || firstSong.image?.[0]?.url,
      };

      window.dispatchEvent(new CustomEvent("play-song", { detail: playableSong }));
    } catch (err) {
      console.error("Failed to play album", err);
    }
  };

  return (
    <main className="relative mx-auto max-w-7xl overflow-hidden px-1 pb-16 pt-4 sm:px-2 sm:pt-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-emerald-400/9 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-136 h-96 w-96 rounded-full bg-cyan-500/6 blur-[110px]"
      />

      <section className="relative isolate overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-[#12382e] via-[#102a27] to-[#111827] px-6 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-28 h-72 w-72 rounded-full border border-emerald-100/10 sm:right-10 sm:top-1/2 sm:h-104 sm:w-104 sm:-translate-y-1/2"
        />
        <div
          aria-hidden="true"
          className="absolute right-6 top-1/2 hidden h-56 w-56 -translate-y-1/2 rounded-full border border-emerald-100/[0.07] sm:block"
        />
        <div className="absolute right-12 top-1/2 hidden h-44 w-44 -translate-y-1/2 rotate-12 rounded-4xl border border-emerald-100/10 bg-linear-to-br from-white/9 to-white/1 shadow-2xl backdrop-blur-sm sm:block lg:right-24">
          <div className="absolute inset-3 overflow-hidden rounded-[1.4rem] bg-linear-to-br from-emerald-200/20 via-teal-500/20 to-gray-950/70">
            <div className="absolute inset-0 grid place-items-center text-7xl text-emerald-100/80">♫</div>
          </div>
        </div>

        <div className="relative max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-100/8 px-3.5 py-1.5 text-xs font-medium tracking-wide text-emerald-100">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            YOUR DAILY DOSE OF MUSIC
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find your next
            <span className="mt-1 block bg-linear-to-r from-emerald-200 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              favorite sound.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-gray-300 sm:text-base">
            A fresh mix of Punjabi hits and albums, picked for your next
            soundtrack. Press play and let the good stuff find you.
          </p>
          <a
            href="#trending-songs"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-gray-950 shadow-[0_8px_30px_rgba(110,231,183,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200 hover:shadow-[0_12px_36px_rgba(110,231,183,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#12382e]"
          >
            Explore the mix
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </a>
        </div>
        <div aria-hidden="true" className="absolute bottom-8 right-10 hidden items-end gap-1 sm:flex">
          {[16, 28, 20, 38, 24, 34, 18, 30, 14, 26, 36, 21, 31, 17, 25].map((height, index) => (
            <span
              key={index}
              className="w-1.5 rounded-full bg-emerald-200/60"
              style={{ height: `${height}px`, animation: `pulse 1.2s ease-in-out ${index * 0.08}s infinite alternate` }}
            />
          ))}
        </div>
      </section>

      <div className="relative mt-12 space-y-14 sm:mt-16">
        <section id="trending-songs" className="scroll-mt-28">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
                Handpicked for you
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                <span className="mr-2 text-emerald-300">♪</span>Made for your playlist
              </h2>
            </div>
            {!loading && songs.length > 0 && (
              <span className="hidden rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-gray-400 sm:inline-flex">
                {songs.length} tracks
              </span>
            )}
          </div>
          {loading ? (
            <LoadingCards />
          ) : songs.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
              {songs.map((song) => (
                <MediaCard key={song.id} item={song} type="song" onPlay={handlePlaySong} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-white/8 bg-white/3 px-5 py-8 text-sm text-gray-400">
              {loadError ? "Music recommendations couldn't load right now. Please try again in a moment." : "No songs found right now."}
            </p>
          )}
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300/80">
                The full experience
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                <span className="mr-2 text-violet-300">◉</span>Albums worth a listen
              </h2>
            </div>
            {!loading && albums.length > 0 && (
              <span className="hidden rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-gray-400 sm:inline-flex">
                {albums.length} albums
              </span>
            )}
          </div>
          {loading ? (
            <LoadingCards />
          ) : albums.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
              {albums.map((album) => (
                <MediaCard key={album.id} item={album} type="album" onPlay={handlePlayAlbum} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-white/8 bg-white/3 px-5 py-8 text-sm text-gray-400">
              {loadError ? "Albums couldn't load right now. Please try again in a moment." : "No albums found right now."}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
