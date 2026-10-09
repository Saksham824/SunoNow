// ✅ MusicContext.jsx
import { createContext, useEffect, useState } from "react";

export const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    const handlePlaySong = (e) => {
      setCurrentSong(e.detail);
    };
    window.addEventListener("play-song", handlePlaySong);
    return () => window.removeEventListener("play-song", handlePlaySong);
  }, []);

  return (
    <MusicContext.Provider value={{ currentSong, setCurrentSong }}>
      {children}
    </MusicContext.Provider>
  );
}