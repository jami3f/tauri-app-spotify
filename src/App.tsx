import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { tauri } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";
const { invoke } = tauri;
import Unauthenticated from "./Unauthenticated";
import "./styles.css";

interface songsJSON {
  name: string;
  album: {
    name: string;
    images: {
      url: string;
    }[];
  };
  artists: {
    name: string;
  }[];
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<songsJSON>();
  useEffect(() => {
    (async () => await invoke("setup"))();
    if (localStorage.getItem("authenticated") == "true") setLoggedIn(true);
  }, []);

  async function getRecentlyPlayed() {
    const res = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    if (res.status == 204)
      return setNowPlaying({
        name: "Nothing Playing",
        album: { name: "Nothing Playing", images: [{ url: "" }] },
        artists: [{ name: "Nothing Playing" }],
      });
    const data = await res.json();
    const song: songsJSON = data.item;
    setNowPlaying(song);
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-white rounded-xl">
      <div className="absolute w-screen h-6 top-0 rounded-t-xl flex justify-end bg-gray-50">
        <button className="relative px-2 hover:bg-gray-400 transition-colors cursor-default" type="button">-</button>
        <button className="relative px-2 hover:bg-red-600 transition-colors cursor-default rounded-tr-xl" type="button">x</button>
      </div>
      {loggedIn ? (
        <>
          {nowPlaying?.album && (
            <div className="flex flex-row">
              <img
                src={nowPlaying?.album.images[0]?.url}
                alt="background-image"
                className="w-32 object-cover"
              />
            </div>
          )}
          <div>{nowPlaying?.name}</div>
          <div>{nowPlaying?.artists.map((a) => a.name).join(",")}</div>
          <div>
            <button
              onClick={getRecentlyPlayed}
              type="button"
              className="bg-green-300 rounded-md p-2 hover:bg-blue-300 transition-colors"
            >
              Get Now Playing
            </button>
          </div>
        </>
      ) : (
        <Unauthenticated setLoggedIn={setLoggedIn} />
      )}
      <img
        src={nowPlaying?.album.images[0]?.url}
        alt="background-image"
        className="object-cover -z-10 blur-xl w-screen h-screen absolute left-0 top-0 opacity-80"
        z-index="-1"
      />
    </div>
  );
}

export default App;
