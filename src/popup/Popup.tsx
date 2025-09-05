import { useEffect, useRef, useState } from "react";
import Controlls from "./Controlls";
import TabMenu from "./TabMenu";
import Timer from "./Timer";

const Popup = () => {
  type Modes = {
    focus: number,
    short_break: number,
    long_break: number
  }
  type Time = {
    minutes: number,
    seconds: number
  }

  const [currMode, setCurrMode] = useState<keyof Modes>("focus");
  const [currTime, setCurrTime] = useState<Time>({ minutes: 0, seconds: 0 })
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const ring = document.querySelector<SVGCircleElement>(".progressCircle");
  const [modes, setModes] = useState<Modes>({
    "focus": 25,
    "short_break": 5,
    "long_break": 30
  })

  const startTime = () => {
    setIsStarted(true);
    if (ring) {
      ring.style.animationDuration = `${currTime.minutes * 60}s`;
      ring.style.animationPlayState = "running";
    }
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      decreaseTime();
    }, 1000);
  };

  const stopTime = () => {
    setIsStarted(false);
    if (ring)
      ring.style.animationPlayState = "paused";
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTime = () => {
    stopTime();
    setCurrTime({ minutes: modes[currMode], seconds: 0 });
  }

  const decreaseTime = () => {
    setCurrTime(prev => {
      let { minutes, seconds } = prev;
      if (seconds === 0) {
        if (minutes === 0) {
          stopTime();
          return prev;
        }
        minutes -= 1;
        seconds = 59;
      }
      else {
        seconds -= 1;
      }
      return { minutes, seconds };
    })
  }

  useEffect(() => {
    setModes(prev => prev);
    stopTime();
    const duration = modes[currMode];
    setCurrTime({ minutes: duration, seconds: 0 })
  }, [currMode])


  return (
    <div className="w-[380px] h-[336px] p-5 bg-[#0D0402]">
      <TabMenu currMode={currMode} setCurrMode={setCurrMode} />
      <Timer currTime={currTime} />
      <Controlls startTime={startTime} stopTime={stopTime} resetTime={resetTime} isStarted={isStarted} />
    </div>
  )
}

export default Popup;
