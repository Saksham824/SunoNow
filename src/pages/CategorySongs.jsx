import { useLocation } from "react-router-dom";

export default function CategorySongs() {
  const location = useLocation();
  const songs = location.state?.songs ?? [];

  if (!songs.length) {
    return (
      <main className="relative isolate mx-auto flex min-h-[65vh] max-w-6xl items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-gray-900/70 px-6 py-12 text-center shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-10">
          <div
            aria-hidden="true"
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-300/10 text-3xl ring-1 ring-emerald-200/15"
          >
            ♪
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
            A little too quiet
          </p>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            No songs just yet
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
            There aren&apos;t any tracks in this collection right now. Try
            exploring another sound.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="relative isolate mx-auto max-w-6xl overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-72 -z-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <header className="mb-9 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-gray-300 shadow-lg shadow-black/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            YOUR PERSONAL SOUNDTRACK
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Find your{" "}
            <span className="bg-linear-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              rhythm.
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            A collection of tracks picked for your next favorite moment.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-gray-300 shadow-lg shadow-black/10 backdrop-blur-sm">
          <span aria-hidden="true" className="text-emerald-300">
            ♫
          </span>
          <span>
            <span className="font-bold text-white">{songs.length}</span>{" "}
            {songs.length === 1 ? "track" : "tracks"}
          </span>
        </div>
      </header>

      <section aria-label="Songs in this collection">
        <div className="mb-5 flex items-center justify-between border-b border-white/8 pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            The collection
          </h2>
          <span className="text-xs text-gray-500">Pick a track to play</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {songs.map((song, index) => {
            const audioURL =
              song.downloadUrl?.[4]?.url ||
              song.downloadUrl?.at(-1)?.url;
            const isPlayable = audioURL && !audioURL.endsWith(".com");
            const title = song.name || song.title || "Untitled track";
            const artists =
              song.artists?.primary?.map((artist) => artist.name).join(", ") ||
              song.primaryArtists ||
              "Unknown artist";
            const image =
              song.image?.[1]?.url ||
              song.image?.[0]?.url ||
              song.image?.[2]?.url ||
              "/fallback.jpg";

            return (
              <button
                key={song.id || `${title}-${index}`}
                type="button"
                aria-disabled={!isPlayable}
                aria-label={`${isPlayable ? "Play" : "Unavailable"}: ${title} by ${artists}`}
                className={`group relative flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl border bg-gray-900/70 p-3 text-left shadow-xl shadow-black/10 backdrop-blur-sm transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 motion-reduce:transition-none sm:gap-5 sm:p-4 ${
                  isPlayable
                    ? "border-white/8 hover:-translate-y-1 hover:border-emerald-300/30 hover:bg-gray-900 hover:shadow-2xl hover:shadow-emerald-950/30"
                    : "cursor-not-allowed border-white/5 opacity-65"
                }`}
                onClick={() => {
                  if (!isPlayable) {
                    alert("No playable audio for this song.");
                    return;
                  }
                  const playableSong = {
                    name: title,
                    primaryArtists: artists,
                    url: audioURL,
                    image,
                  };
                  window.dispatchEvent(
                    new CustomEvent("play-song", { detail: playableSong })
                  );
                }}
              >
                {isPlayable && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-emerald-400/10 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                  />
                )}

                <span className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-gray-800 shadow-lg sm:h-20 sm:w-20">
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110 motion-reduce:transition-none"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-white/5" />
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 flex items-center justify-center text-xl text-white transition duration-300 ${
                      isPlayable
                        ? "bg-black/15 opacity-0 group-hover:bg-black/35 group-hover:opacity-100"
                        : "bg-black/25 text-gray-300"
                    }`}
                  >
                    {isPlayable ? "▶" : "♪"}
                  </span>
                </span>

                <span className="relative min-w-0 flex-1">
                  <span className="mb-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[0.16em] text-gray-500">
                      TRACK {String(index + 1).padStart(2, "0")}
                    </span>
                    {!isPlayable && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                        Unavailable
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-base font-bold text-white transition-colors group-hover:text-emerald-100 sm:text-lg">
                    {title}
                  </span>
                  <span className="mt-1 block truncate text-sm text-gray-400">
                    {artists}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition duration-300 motion-reduce:transition-none ${
                    isPlayable
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200 group-hover:scale-110 group-hover:border-emerald-200/40 group-hover:bg-emerald-300/20"
                      : "border-white/8 bg-white/4 text-gray-500"
                  }`}
                >
                  {isPlayable ? "▶" : "–"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
