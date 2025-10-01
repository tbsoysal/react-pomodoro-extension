import lightModeIcon from '/icons/light.svg';
import darkModeIcon from '/icons/dark.svg';

type Props = {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const Controlls = ({ isDarkMode, setIsDarkMode }: Props) => {
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
      <div className='flex gap-2'>
        <a onClick={openWindow} className="flex items-center p-2 rounded-full bg-[#1D1A19]" href="#"><img className="w-5 h-5" src="/icons/alwaysOnTop.svg" /></a>
        <a onClick={openOptionsPage} className="flex items-center p-2 rounded-full bg-[#1D1A19]" href="#"><img className="w-5 h-5" src="/icons/options.svg" /></a>
      </div>
      {/* Light mode Dark Mode Toggle Button */}
      <div onClick={() => setIsDarkMode(!isDarkMode)} className="flex item-center gap-2 p-1 rounded-full bg-[#1D1A19] cursor-pointer">
        <a className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-75 ${!isDarkMode ? 'bg-gradient-to-b from-[#FF0000] to-[#DC8E00]' : ' '}`}>
          <img className='w-4 h-4' src={lightModeIcon} />
        </a>
        <a className={`w-6 h-6 flex items-center justify-center rounded-full ${isDarkMode ? 'bg-gradient-to-b from-[#FF0000] to-[#DC8E00]' : ' '}`}>
          <img className='w-4 h-4' src={darkModeIcon} />
        </a>
      </div>

    </div>
  )
}

export default Controlls
