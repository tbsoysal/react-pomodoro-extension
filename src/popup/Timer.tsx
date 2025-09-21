type Props = {
  circumference: number;
  isDarkMode: boolean;
  progress: number;
  remaining: number;
}

const Timer = ({ remaining, progress, circumference, isDarkMode }: Props) => {
  return (
    <div className="relative flex justify-center items-center m-5">
      <svg width="160" height="160">
        <circle stroke="#1D1A19" strokeWidth="16" fill="transparent" r="72" cx="80" cy="80" />
        <circle className="progressCircle transition-[stroke-dashoffset] duration-1000 ease-linear"
          stroke="#F02900"
          strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * progress}
          transform="rotate(-90 80 80)"
          fill="transparent"
          r="72"
          cx="80"
          cy="80" />
      </svg>
      <div className={`absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#F02900]'}`}>
        {Math.floor((remaining / 1000) / 60).toString().padStart(2, "0")}:
        {Math.floor((remaining / 1000) % 60).toString().padStart(2, "0")}
      </div>
    </div>
  )
}

export default Timer
