import type { ModeKey } from "../../types";

type Props = {
  currMode: ModeKey;
  setCurrMode: (mode: ModeKey) => void;
}

const TabMenu = ({ currMode, setCurrMode }: Props) => {
  const itemStyles = "flex justify-center items-center w-[108px] text-sm text-white font-medium bg-[#1D1A19] py-2 rounded-[100px] transition ease";
  const selectedItemStyle = " bg-[#3D3836] border-solid border-[1px] border-white";

  return (
    <div className="flex justify-between items-center">
      <a onClick={() => setCurrMode("focus")} className={itemStyles + (currMode === "focus" ? selectedItemStyle : '')} href="#">Odak</a>
      <a onClick={() => setCurrMode("short_break")} className={itemStyles + (currMode === "short_break" ? selectedItemStyle : '')} href="#">Kısa Mola</a>
      <a onClick={() => setCurrMode("long_break")} className={itemStyles + (currMode === "long_break" ? selectedItemStyle : '')} href="#">Uzun Mola</a>
    </div>
  )
}

export default TabMenu
