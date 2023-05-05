import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { tauri } from "@tauri-apps/api";
const { invoke } = tauri;
import Unauthenticated from "./Unauthenticated";
import WindowControls from "./components/WindowControls";
import "./styles.css";
import albumCover from "./assets/thedream.jpg";

const offline = false;

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

const testSong: songsJSON = {
  name: "Bane",
  album: {
    name: "The Dream",
    images: [
      {
        url: albumCover,
      },
    ],
  },
  artists: [{ name: "Alt-J" }],
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<songsJSON>();
  useEffect(() => {
    (async () => {
      await invoke("setup");
    })();
    if (offline) return setNowPlaying(testSong);
    if (localStorage.getItem("authenticated") == "true") setLoggedIn(true);
    getRecentlyPlayed();
    const interval = setInterval(() => {
      getRecentlyPlayed();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  async function getRecentlyPlayed() {
    const maxRetries = 3;
    let retries = 0;
    let res = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    while (!res.ok && retries <= maxRetries) {
      const refreshToken = localStorage.getItem("refresh_token");
      console.log(refreshToken);
      const newToken: string = await invoke("get_new_token", {
        refreshToken: refreshToken,
      });
      localStorage.setItem("token", newToken);
      retries += 1;
      if (retries == maxRetries) {
        localStorage.setItem("authenticated", "false");
        return setLoggedIn(false);
      }
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

  function getImageDarkness() {
    const img = new Image();
    img.src = nowPlaying!.album.images[0]?.url;
    
  }

  return (
    <>
      <div className="bg-white rounded-xl w-screen h-screen relative flex flex-col justify-center items-center z-0 overflow-hidden">
        <img
          src={nowPlaying?.album.images[0]?.url}
          alt="background-image"
          className="object-cover blur-md w-screen h-screen absolute left-0 top-0 opacity-80 -z-10 rounded-xl"
        />
        <WindowControls />
        {loggedIn ? (
          <div className="w-screen h-screen flex flex-col justify-center items-center text-center">
            {nowPlaying?.album && (
              <img
                src={nowPlaying?.album.images[0]?.url}
                alt="background-image"
                className="w-32 object-cover"
              />
            )}
            <div>{nowPlaying?.name}</div>
            <div>{nowPlaying?.artists.map((a) => a.name).join(",")}</div>
          </div>
        ) : (
          <Unauthenticated setLoggedIn={setLoggedIn} />
        )}
      </div>
    </>
  );
}

export default App;
