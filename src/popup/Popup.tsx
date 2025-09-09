import { useEffect, useState } from "react";
import Controlls from "./Controlls";
import TabMenu from "./TabMenu";
import Timer from "./Timer";
import { useCircleTimer } from "./useCircleTimer";

const Popup = () => {
  type Modes = {
    focus: number,
    short_break: number,
    long_break: number
  }

  const [currMode, setCurrMode] = useState<keyof Modes>("focus");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [modes, setModes] = useState<Modes>({
    "focus": 25,
    "short_break": 5,
    "long_break": 30
  })

  const duration = modes[currMode] * 60 * 1000; // convert minutes → ms
  const {
    offset,
    circumference,
    start,
    pause,
    reset,
    isRunning,
    currentTime
  } = useCircleTimer(duration);

  const startTime = () => start();

  const stopTime = () => pause();

  const resetTime = () => reset();

  useEffect(() => {
    setModes(prev => prev);
    stopTime();
    reset();
  }, [currMode])


  return (
    <div className={`w-[380px] h-[336px] p-5 ${isDarkMode ? 'bg-[#0D0402]' : 'bg-white'} `} >
      <TabMenu currMode={currMode} setCurrMode={setCurrMode} />
      <Timer currentTime={currentTime} circumference={circumference} offset={offset} isDarkMode={isDarkMode} />
      <Controlls startTime={startTime} stopTime={stopTime} resetTime={resetTime} isRunning={isRunning} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </div >
  )
}

export default Popup;
