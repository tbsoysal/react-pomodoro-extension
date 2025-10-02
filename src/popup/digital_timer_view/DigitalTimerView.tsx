/**
 * Digital Timer View Component
 * 
 * Displays the timer in a digital/numeric format with retro LED-style numbers.
 */

import Controlls from "./Controlls";
import TabMenu from "./TabMenu";
import Timer from "./Timer";
import type { Modes, TimerStatus } from "../../types";

/**
 * Component props interface
 */
interface DigitalTimerViewProps {
  currMode: keyof Modes;
  setCurrMode: (mode: keyof Modes) => void;
  remaining: number;
  status: TimerStatus;
  startTime: () => void;
  stopTime: () => void;
  resetTime: () => void;
}

const DigitalTimerView = (props: DigitalTimerViewProps) => {
  return (
    <div className={`w-[380px] h-[336px] p-5 bg-[#0D0402]`}>
      {/* Mode selection tabs */}
      <TabMenu currMode={props.currMode} setCurrMode={props.setCurrMode} />
      
      {/* Digital timer display with controls */}
      <Timer 
        status={props.status} 
        resetTime={props.resetTime} 
        startTime={props.startTime} 
        stopTime={props.stopTime} 
        remaining={props.remaining} 
      />
      
      {/* Controls */}
      <Controlls />
    </div>
  )
}

export default DigitalTimerView
