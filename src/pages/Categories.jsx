import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const categories = [
  {
    name: "Hindi",
    icon: "🎶",
    number: "01",
    description: "From timeless classics to today's biggest hits.",
    mood: "The sounds of home",
    linear: "from-amber-400/20 via-orange-500/10 to-rose-500/20",
    accent: "text-amber-300",
    glow: "bg-orange-400/20",
    border: "group-hover:border-amber-300/40",
    iconBackground: "bg-amber-300/10 ring-amber-200/20",
  },
  {
    name: "English",
    icon: "🎤",
    number: "02",
    description: "Chart-toppers, indie gems, and everything between.",
    mood: "Your global playlist",
    linear: "from-sky-400/20 via-blue-500/10 to-violet-500/20",
    accent: "text-sky-300",
    glow: "bg-sky-400/20",
    border: "group-hover:border-sky-300/40",
    iconBackground: "bg-sky-300/10 ring-sky-200/20",
  },
  {
    name: "Punjabi",
    icon: "🥁",
    number: "03",
    description: "Big beats and bold hooks made to move you.",
    mood: "Feel every beat",
    linear: "from-fuchsia-400/20 via-pink-500/10 to-rose-500/20",
    accent: "text-fuchsia-300",
    glow: "bg-fuchsia-400/20",
    border: "group-hover:border-fuchsia-300/40",
    iconBackground: "bg-fuchsia-300/10 ring-fuchsia-200/20",
  },
];

export default function Categories() {
  const navigate = useNavigate();
  const [loadingCategory, setLoadingCategory] = useState("");
  const [error, setError] = useState("");

  const handleClick = async (category) => {
    setLoadingCategory(category);
    setError("");

    try {
      const res = await axios.get(
        `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(category)}`
      );
      const songs = res.data.data.results.slice(0, 50);

      if (songs.length) {
        navigate(`/category/${category}`, { state: { songs } });
      } else {
        setError("No songs found for this category. Try another one.");
      }
    } catch (err) {
      console.error("Category fetch failed", err);
      setError("We couldn't load this category. Please try again.");
    } finally {
      setLoadingCategory("");
    }
  };

  return (
    <main className="relative isolate mx-auto max-w-6xl overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-64 -z-10 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl"
      />

      <header className="mb-10 max-w-2xl sm:mb-14">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-gray-300 shadow-lg shadow-black/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
          YOUR NEXT FAVORITE STARTS HERE
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
          Find your{" "}
          <span className="bg-linear-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            sound.
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
          Pick a category, turn it up, and let the music take it from here.
        </p>
      </header>

      <section aria-label="Music categories">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
            Explore genres
          </h2>
          <span className="text-xs text-gray-500">03 collections</span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const isLoading = loadingCategory === category.name;

            return (
              <button
                key={category.name}
                type="button"
                onClick={() => handleClick(category.name)}
                disabled={Boolean(loadingCategory)}
                aria-label={`Explore ${category.name} songs`}
                aria-busy={isLoading}
                className={`group relative min-h-72 overflow-hidden rounded-3xl border border-white/8 bg-linear-to-br ${category.linear} p-px text-left shadow-2xl shadow-black/20 transition duration-500 ease-out hover:-translate-y-1.5 hover:shadow-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-4 focus-visible:ring-offset-gray-950 disabled:cursor-wait disabled:opacity-75 motion-reduce:transform-none motion-reduce:transition-none ${category.border}`}
              >
                <span className="absolute inset-0 rounded-3xl bg-gray-900/90 transition-colors duration-500 group-hover:bg-gray-900/75" />
                <span
                  aria-hidden="true"
                  className={`absolute -right-14 -top-16 h-48 w-48 rounded-full ${category.glow} opacity-50 blur-3xl transition duration-700 group-hover:scale-150 group-hover:opacity-80 motion-reduce:transition-none`}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-linear(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_55%)] opacity-70"
                />

                <span className="relative flex h-full min-h-72 flex-col p-6 sm:p-7">
                  <span className="flex items-start justify-between">
                    <span className={`text-xs font-bold tracking-[0.22em] ${category.accent}`}>
                      COLLECTION {category.number}
                    </span>
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ring-1 backdrop-blur-sm transition duration-500 group-hover:rotate-6 group-hover:scale-110 ${category.iconBackground} motion-reduce:transition-none`}
                      aria-hidden="true"
                    >
                      {category.icon}
                    </span>
                  </span>

                  <span className="mt-auto">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                      {category.mood}
                    </span>
                    <span className="block text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      {category.name}
                    </span>
                    <span className="mt-2 block max-w-xs text-sm leading-6 text-gray-400">
                      {category.description}
                    </span>
                  </span>

                  <span className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className={`text-sm font-semibold ${category.accent}`}>
                      {isLoading ? "Finding your songs..." : "Explore collection"}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-lg text-white transition duration-300 group-hover:translate-x-1 group-hover:border-white/20 group-hover:bg-white/10 ${isLoading ? "animate-pulse" : ""}`}
                    >
                      {isLoading ? "♪" : "→"}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {error && (
          <p role="alert" className="mt-5 text-sm text-rose-300">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
