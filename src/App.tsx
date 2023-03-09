import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { tauri } from "@tauri-apps/api";
const { invoke } = tauri;
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const print = async () => {
    const result_string: string = await invoke("get_request");
    setText(result_string);
  };

  useEffect(() => {
    print();
  }, []);

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>
      {text}
    </div>
  );
}

export default App;
