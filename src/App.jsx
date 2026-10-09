import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Search from "./pages/Search";
import SongList from "./pages/SongList";
import MusicPlayer from "./components/MusicPlayer";
import CategorySongs from "./pages/CategorySongs";
import Artist from "./pages/Artist";
import Album from "./pages/Album";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/search" element={<Search />} />
            <Route path="/songs/:id" element={<SongList />} />
            <Route path="/category/:name" element={<CategorySongs />} />
             <Route path="/artist/:id" element={<Artist />} />
             <Route path="/album/:id" element={<Album />} />
          </Routes>
        </div>
        <MusicPlayer />
      </div>
    </Router>
  );
}