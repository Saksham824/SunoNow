import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/search", label: "Search" },
];

const desktopLinkClass = ({ isActive }) =>
  `relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-white/10 text-white"
      : "text-gray-400 hover:bg-white/5 hover:text-white"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
    isActive
      ? "bg-emerald-400/10 text-emerald-300"
      : "text-gray-300 hover:bg-white/5 hover:text-white"
  }`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-gray-950/80 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex h-18 items-center justify-between">
          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className="group inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="SunoNow home"
          >
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-linear-to-br from-emerald-300 to-green-600 text-gray-950 shadow-[0_0_24px_rgba(52,211,153,0.24)] transition duration-300 group-hover:scale-105 group-hover:shadow-[0_0_32px_rgba(52,211,153,0.4)]">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 18V5l12-2v13"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <circle cx="6" cy="18" r="3" fill="currentColor" />
                <circle cx="18" cy="16" r="3" fill="currentColor" />
              </svg>
            </span>
            <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Suno<span className="text-emerald-400">Now</span>
              <span className="ml-2 hidden align-middle text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 sm:inline">
                Your sound, your world
              </span>
            </span>
          </NavLink>

          <div className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/3 p-1 md:flex">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} className={desktopLinkClass}>
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-gray-300 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  d="m6 6 12 12M18 6 6 18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              )}
            </svg>
          </button>
        </div>

        <div
          id="mobile-navigation"
          aria-hidden={!menuOpen}
          inert={!menuOpen}
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden ${
            menuOpen
              ? "grid-rows-[1fr] pb-4 opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-1 rounded-2xl border border-white/8 bg-white/3 p-2">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
