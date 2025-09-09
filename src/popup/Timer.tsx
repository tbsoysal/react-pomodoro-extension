type Time = {
  minutes: number,
  seconds: number
}

type Props = {
  currentTime: Time;
  offset: number;
  circumference: number;
  isDarkMode: boolean;
}

const Timer = ({ currentTime, offset, circumference, isDarkMode }: Props) => {
  return (
    <div className="relative flex justify-center items-center m-5">
      <svg width="160" height="160">
        <circle stroke="#1D1A19" strokeWidth="16" fill="transparent" r="72" cx="80" cy="80" />
        <circle className="progressCircle"
          stroke="#F02900"
          strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          fill="transparent"
          r="72"
          cx="80"
          cy="80" />
      </svg>
      <div className={`absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#F02900]'}`}>
        {currentTime.minutes.toString().padStart(2, "0")}:
        {currentTime.seconds.toString().padStart(2, "0")}
      </div>
    </div>
  )
}

export default Timer
