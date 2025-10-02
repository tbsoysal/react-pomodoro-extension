type Props = {
  startTime: () => void;
  stopTime: () => void;
  resetTime: () => void;
  status: "running" | "paused" | "stopped";
}

const Controlls = ({ status, startTime, stopTime, resetTime }: Props) => {

  const toggleTime = () => {
    if (status === "running") {
      stopTime();
    }
    else {
      startTime();
    }
  }

  const openWindow = async () => {
    // Get screen dimensions
    const currentWindow = await chrome.windows.getCurrent();
    const screenWidth = currentWindow.width || 1920;

    // Position at top-right corner
    const windowWidth = 268;
    const windowHeight = 264;

    chrome.windows.create({
      url: chrome.runtime.getURL("minimal.html"),
      type: "popup",
      width: windowWidth,
      height: windowHeight,
      top: 50,
      left: screenWidth - windowWidth - 50,
      focused: true,
      state: "normal"
    });
  };

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  }

  return (
    <div className="pt-5 border-t-[1px] border-[#272322] flex justify-between items-center">
      <a onClick={openWindow} className="flex items-center p-2 rounded-full bg-[#1D1A19]" href="#"><img className="w-5 h-5" src="/icons/alwaysOnTop.svg" /></a>

      <div className="flex gap-[6px]">
        <a onClick={resetTime} className="flex items-center p-2 rounded-full bg-[#1D1A19]" href="#"><img className="w-5 h-5" src="/icons/reset.svg" /></a>
        <a onClick={toggleTime} className="flex items-center px-[16px] text-white text-[14px] font-medium rounded-full bg-[#1D1A19]" href="#">{status === "running" ? "Durdur" : status === "stopped" ? "Başlat" : "Devam Et"}</a>
      </div>

      <a onClick={openOptionsPage} className="flex items-center p-2 rounded-full bg-[#1D1A19]" href="#"><img className="w-5 h-5" src="/icons/options.svg" /></a>
    </div>
  )
}

export default Controlls
