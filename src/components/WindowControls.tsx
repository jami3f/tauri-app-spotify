import {
  PhysicalPosition,
  appWindow,
  currentMonitor,
} from "@tauri-apps/api/window";
import southEast from "../assets/south-east.svg";
import close from "../assets/close.svg";
import minimise from "../assets/minimise.svg";
export default function WindowControls() {
  async function resetPosition() {
    const monitor = (await currentMonitor())!;
    const monitorSize = monitor.size;
    const windowSize = await appWindow.outerSize();
    const scaleFactor = monitor.scaleFactor;
    const x = monitorSize.width - windowSize.width;
    const y = monitorSize.height - windowSize.height - 48 * scaleFactor;
    appWindow.setPosition(new PhysicalPosition(x, y));
  }

  return (
    <div
      data-tauri-drag-region
      className="absolute w-screen h-6 top-0 rounded-t-xl flex justify-end"
    >
      <button
        className="relative px-2 hover:bg-white hover:bg-opacity-10 transition-colors cursor-default"
        type="button"
      >
        <img alt="minimise" src={minimise} className="h-full" />
      </button>
      <button
        className="relative px-2 hover:bg-white hover:bg-opacity-10 transition-colors cursor-default"
        type="button"
        title="Reset Position"
        onClick={() => resetPosition()}
      >
        <img alt="reset position arrow" src={southEast} className="h-full" />
      </button>

      <button
        className="relative px-2 hover:bg-red-600 transition-colors cursor-default rounded-tr-xl"
        type="button"
        onClick={async () => await appWindow.close()}
      >
        <img alt="close" src={close} className="h-full" />
      </button>
    </div>
  );
}
