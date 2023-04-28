import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { tauri } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";
const { invoke } = tauri;
import Unauthenticated from "./Unauthenticated";
import WindowControls from "./components/WindowControls";
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
    getRecentlyPlayed();
    const interval = setInterval(() => {
      getRecentlyPlayed();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  async function getRecentlyPlayed() {
    const res = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    if (!res.ok) {
      const refreshToken = localStorage.getItem("refresh_token");
      const newToken: string = await invoke("refresh_token", {
        refresh_token: refreshToken,
      });
      localStorage.setItem("token", newToken);
    }
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
    <>
      <div className="bg-white rounded-xl w-screen h-screen relative flex flex-col justify-center items-center -z-20">
        <img
          src={nowPlaying?.album.images[0]?.url}
          alt="background-image"
          className="object-cover blur-xl w-screen h-screen absolute left-0 top-0 opacity-80 -z-10 rounded-xl"
        />
        <WindowControls />
        {loggedIn ? (
          <div className="w-screen h-screen flex flex-col justify-center items-center text-center">
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
            {/* <button
              onClick={getRecentlyPlayed}
              type="button"
              className="bg-green-300 rounded-md p-2 hover:bg-blue-300 transition-colors"
            >
              Get Now Playing
            </button> */}
          </div>
        ) : (
          <Unauthenticated setLoggedIn={setLoggedIn} />
        )}
      </div>
    </>
  );
}

export default App;
