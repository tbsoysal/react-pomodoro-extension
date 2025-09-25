import type React from "react"
import Controlls from "./Controlls";
import TabMenu from "./TabMenu";
import Timer from "./Timer";

type Modes = {
  focus: number,
  short_break: number,
  long_break: number
}

type Props = {
  isDarkMode: boolean,
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>,
  currMode: keyof Modes,
  setCurrMode: React.Dispatch<React.SetStateAction<keyof Modes>>,
  remaining: number,
  progress: number,
  circumference: number,
  status: "running" | "stopped" | "paused",
  startTime: () => void
  stopTime: () => void
  resetTime: () => void
}

const CircularTimerView = (props: Props) => {
  return (
    <div className={`w-[380px] h-[336px] p-5 ${props.isDarkMode ? 'bg-[#0D0402]' : 'bg-white'} `} >
      <TabMenu currMode={props.currMode} setCurrMode={props.setCurrMode} />
      <Timer remaining={props.remaining} progress={props.progress} circumference={props.circumference} isDarkMode={props.isDarkMode} />
      <Controlls status={props.status} startTime={props.startTime} resetTime={props.resetTime} stopTime={props.stopTime} isDarkMode={props.isDarkMode} setIsDarkMode={props.setIsDarkMode} />
    </div >
  )
}

export default CircularTimerView
