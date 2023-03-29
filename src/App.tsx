import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { tauri } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";
const { invoke } = tauri;
import "./styles.css";

interface buttonProps {
  content: string;
  onClick: () => void;
  shape: "circle" | "square" | "none";
}

function Button(props: any) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`w-20 h-20 ${
        props.shape == "circle"
          ? "rounded-full"
          : props.shape == "square"
          ? "rounded-none"
          : "rounded-md"
      } bg-blue-500`}
    >
      {" "}
      {props.content}{" "}
    </button>
  );
}

async function generateParams(window: Window) {
  const randomText: string = await invoke("generate_random_text");
  const clientId: string = await invoke("get_client_id");
  localStorage.setItem("code_verifier", randomText);
  const encoder = new TextEncoder();
  const code = await window.crypto.subtle.digest(
    "SHA-256",
    encoder.encode(randomText)
  );
  const codeChallenge = window
    .btoa(String.fromCharCode(...new Uint8Array(code)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  console.log(codeChallenge);
  const port: number | string = await invoke("start_server");
  const scope = "streaming user-read-private user-read-email";
  let params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `http://localhost:${port}`,
    scope: scope,
  });
  return params;
}

function App() {
  let authWindow: Window | null;
  const [text, setText] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    (async () => await invoke("setup"))();
    console.log("setup");
    listen("redirect_uri", (event: any) => {
      console.log(authWindow);
      if (event.payload == "success") setLoggedIn(true);
      authWindow?.close();
    });
  }, []);

  async function handleClick() {
    const params = await generateParams(window);
    authWindow = open(
      `https://accounts.spotify.com/authorize?${params.toString()}`,
      "_blank",
      "width=600,height=800"
    );
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-white rounded-xl">
      <div className="absolute w-screen h-6 top-0 rounded-t-xl flex justify-end bg-gray-50">
        <button className="relative px-2 hover:bg-gray-400 transition-colors cursor-default" type="button">-</button>
        <button className="relative px-2 hover:bg-red-600 transition-colors cursor-default rounded-tr-xl" type="button">x</button>
      </div>
      {loggedIn ? (
        <div>Logged in</div>
      ) : (
        <Button onClick={handleClick} content="Authorize" shape="none" />
      )}
      {text}
    </div>
  );
}

export default App;
