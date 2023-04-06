import { tauri } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
const { invoke } = tauri;

export default function Unauthenticated(props: { setLoggedIn: Function }) {
  let authWindow: Window | null;
  async function handleClick() {
    async function generateParams(window: Window) {
      const clientId: string = await invoke("get_client_id");
      const port: number | string = await invoke("start_server");
      const scope = "streaming user-read-private user-read-email user-read-currently-playing user-read-playback-state user-modify-playback-state user-read-recently-played";
      let params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: `http://localhost:${port}`,
        scope: scope,
      });
      return params;
    }
    const params = await generateParams(window);
    authWindow = open(
      `https://accounts.spotify.com/authorize?${params.toString()}`,
      "_blank",
      "width=600,height=800"
    );
  }

  useEffect(() => {
    listen("redirect_uri", (event: any) => {
        localStorage.setItem("authenticated", "true");
        localStorage.setItem("token", event.payload[0])
        localStorage.setItem("refresh_token", event.payload[1])
    //   authWindow?.close();
      props.setLoggedIn(true);
    });
  }, []);

  return (
      <button type="button" onClick={handleClick} className="rounded-md bg-green-300 p-2 hover:bg-blue-300 transition-colors">
        Authenticate
      </button>
  );
}
