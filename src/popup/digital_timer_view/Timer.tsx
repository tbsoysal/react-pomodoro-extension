type Props = {
  remaining: number;
  status: "running" | "stopped" | "paused";
  stopTime: () => void;
  startTime: () => void;
  resetTime: () => void;
}

const Timer = ({ remaining, status, stopTime, startTime, resetTime }: Props) => {

  const toggleTime = () => {
    if (status === "running") {
      stopTime();
    }
    else {
      startTime();
    }
  }

  return (
    <div className="relative h-[164px] flex justify-between items-center my-5">
      <div className={`text-6xl font-semibold inline-block w-[66px] text-white`}>
        <div className="flex items-baseline gap-1 font-medium">
          <p className="leading-[72px] text-center flex-none">
            {Math.floor((remaining) / 60).toString().padStart(2, "0")}
          </p>
          <span className="text-2xl text-[#6C6461] inline-block w-max flex-none">min</span>
        </div>
        <div className="flex items-baseline gap-1 font-medium">
          <p className="leading-[72px] text-center flex-none">
            {Math.floor((remaining) % 60).toString().padStart(2, "0")}
          </p>
          <span className="text-2xl text-[#6C6461] inline-block w-max flex-none">sec</span>
        </div>
      </div>
      <div className="flex gap-[6px]">
        <a onClick={toggleTime} className="flex items-center px-[16px] text-white text-[14px] font-medium rounded-full bg-[#1D1A19]" href="#">{status === "running" ? "Durdur" : status === "stopped" ? "Başlat" : "Devam Et"}</a>
        <a onClick={resetTime} className="flex items-center p-2 rounded-full bg-[#1D1A19]" href="#"><img className="w-5 h-5" src="/icons/reset.svg" /></a>
      </div>
    </div>
  )
}

export default Timer
