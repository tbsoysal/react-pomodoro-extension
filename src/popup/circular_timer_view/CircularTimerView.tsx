/**
 * Circular Timer View Component
 * 
 * Displays the timer in a circular/radial format with progress ring.
 */

import type React from "react"
import Controlls from "./Controlls";
import TabMenu from "./TabMenu";
import Timer from "./Timer";
import type { Modes, TimerStatus } from "../../types";

/**
 * Component props interface
 */
interface CircularTimerViewProps {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  currMode: keyof Modes;
  setCurrMode: (mode: keyof Modes) => void;
  remaining: number;
  progress: number;
  circumference: number;
  status: TimerStatus;
  startTime: () => void;
  stopTime: () => void;
  resetTime: () => void;
}

const CircularTimerView = (props: CircularTimerViewProps) => {
  return (
    <div className={`w-[380px] h-[336px] p-5 ${props.isDarkMode ? 'bg-[#0D0402]' : 'bg-white'} `}>
      {/* Mode selection tabs */}
      <TabMenu currMode={props.currMode} setCurrMode={props.setCurrMode} />
      
      {/* Circular timer display */}
      <Timer 
        remaining={props.remaining} 
        progress={props.progress} 
        circumference={props.circumference} 
        isDarkMode={props.isDarkMode} 
      />
      
      {/* Control buttons */}
      <Controlls 
        status={props.status} 
        startTime={props.startTime} 
        resetTime={props.resetTime} 
        stopTime={props.stopTime} 
        isDarkMode={props.isDarkMode} 
        setIsDarkMode={props.setIsDarkMode} 
      />
    </div>
  )
}

export default CircularTimerView
