type Props = {
  startTime: () => void;
  stopTime: () => void;
  resetTime: () => void;
  isStarted: boolean;
}

const Controlls = ({ startTime, stopTime, resetTime, isStarted }: Props) => {

  const toggleTime = () => {
    if (isStarted) {
      stopTime();
    }
    else {
      startTime();
    }
  }
  return (
    <div className="pt-5 border-t-[1px] border-[#272322] flex justify-between items-center">
      <a className="flex items-center p-2 rounded-full bg-[#1D1A19]" href="#"><img className="w-5 h-5" src="/icons/alwaysOnTop.svg" /></a>
      <div className="flex gap-[6px]">
        <a onClick={resetTime} className="flex items-center p-2 rounded-full bg-[#1D1A19]" href="#"><img className="w-5 h-5" src="/icons/reset.svg" /></a>
        <a onClick={toggleTime} className="flex items-center px-[16px] text-white text-[14px] font-medium rounded-full bg-[#1D1A19]" href="#">{isStarted ? "Durdur" : "Başlat"}</a>
        <a className="flex items-center p-2 rounded-full bg-[#1D1A19]" href="#"><img className="w-5 h-5" src="/icons/options.svg" /></a>
      </div>
      <a className="flex item-center p-2 rounded-full bg-[#1D1A19]" href="#">
        <img className="w-5 h-5 rounded-full" src="/icons/light.svg" />
        <img className="w-5 h-5 rounded-full" src="/icons/dark.svg" />
      </a>
    </div>
  )
}

export default Controlls
