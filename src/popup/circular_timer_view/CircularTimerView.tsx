/**
 * Circular Timer View Component
 * 
 * Displays the timer in a circular/radial format with progress ring.
 */

import Controlls from "./Controlls";
import TabMenu from "./TabMenu";
import Timer from "./Timer";
import type { Modes, TimerStatus } from "../../types";

/**
 * Component props interface
 */
interface CircularTimerViewProps {
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
    <div className={`w-[380px] h-[336px] p-5 bg-[#0D0402]`}>
      {/* Mode selection tabs */}
      <TabMenu currMode={props.currMode} setCurrMode={props.setCurrMode} />
      
      {/* Circular timer display */}
      <Timer 
        remaining={props.remaining} 
        progress={props.progress} 
        circumference={props.circumference} 
      />
      
      {/* Control buttons */}
      <Controlls 
        status={props.status} 
        startTime={props.startTime} 
        resetTime={props.resetTime} 
        stopTime={props.stopTime} 
      />
    </div>
  )
}

export default CircularTimerView
