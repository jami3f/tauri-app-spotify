import { appWindow } from "@tauri-apps/api/window";
export default function WindowControls() {
  return (
    <div className="absolute w-screen h-6 top-0 rounded-t-xl flex justify-end">
      <button
        className="relative px-2 hover:bg-gray-400 transition-colors cursor-default"
        type="button"
      >
        -
      </button>
      <button
        className="relative px-2 hover:bg-red-600 transition-colors cursor-default rounded-tr-xl"
        type="button"
        onClick={async () => await appWindow.close()}
      >
        x
      </button>
    </div>
  );
}
