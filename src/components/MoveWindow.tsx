import { P } from "@tauri-apps/api/event-2a9960e7";
import {
  PhysicalPosition,
  appWindow,
  currentMonitor,
} from "@tauri-apps/api/window";
import { useState } from "react";
import leftUpArrow from "../assets/left-up-arrow.svg";

interface Position {
  topLeft: PhysicalPosition;
  topRight: PhysicalPosition;
  bottomLeft: PhysicalPosition;
  bottomRight: PhysicalPosition;
}

export default function MoveWindow() {
  const [positions, setPositions] = useState<Position | undefined>();
  const [currentPos, setCurrentPos] = useState<PhysicalPosition | undefined>();
  useState(() => {
    async function getPositions() {
      const monitorSize = (await currentMonitor())!.size;
      const windowSize = await appWindow.outerSize();
      setPositions(() => ({
        topLeft: new PhysicalPosition(0, 0),
        topRight: new PhysicalPosition(monitorSize.width - windowSize.width, 0),
        bottomLeft: new PhysicalPosition(0, monitorSize.height - windowSize.height),
        bottomRight: new PhysicalPosition(
          monitorSize.width - windowSize.width,
          monitorSize.height - windowSize.height
        ),
      }));
      setCurrentPos(positions?.topLeft);
    }
    getPositions();
  });

  return (
    <button
      className="absolute top-2 left-2 w-10 h-10 "
      onClick={() => {
        let newPos;
        if (currentPos == positions?.topLeft) newPos = positions?.bottomRight;
        else newPos = positions?.topLeft;
        appWindow.setPosition(newPos!);
        setCurrentPos(newPos);
      }}
    >
      <img
        src={leftUpArrow}
        alt="left up arrow"
        className={currentPos == positions?.topLeft ? "rotate-180" : ""}
      />
    </button>
  );
}
