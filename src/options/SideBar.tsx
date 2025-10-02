import type { FC } from "react";
import ClockIcon from "/icons/clock.svg";
import StopWatchIcon from "/icons/clock-stopwatch.svg";
import LockIcon from "/icons/lock-unlocked-01.svg";
import BarCharIcon from "/icons/bar-chart-01.svg";
import UserIcon from "/icons/user-01.svg";

type MenuItem = {
  id: string;
  label: string;
  icon: string;
};

const menuItems: MenuItem[] = [
  { id: "appearance", label: "Görünüm", icon: ClockIcon },
  { id: "timer", label: "Zamanlayıcı", icon: StopWatchIcon },
  { id: "permissions", label: "İzinler", icon: LockIcon },
  { id: "stats", label: "İstatistikler", icon: BarCharIcon },
  { id: "profile", label: "Profil", icon: UserIcon },
];

interface SidebarProps {
  onSelect: (id: string) => void;
  selectedId: string;
}

const Sidebar: FC<SidebarProps> = ({ onSelect, selectedId }) => {
  return (
    <aside className="h-screen w-[312px] text-white flex flex-col justify-between px-6 py-8">
      {/* User Info */}
      <div>
        {/* Menu */}
        <nav className="flex flex-col gap-2">
          <p className="text-[#9F938F] px-3 py-2 text-sm">Ana menü</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${selectedId === item.id
                ? "bg-[#1D1A19] text-white"
                : "text-white hover:bg-[#1D1A19]"
                }`}
            >
              <img src={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <button onClick={() => window.close()} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white cursor-pointer hover:bg-[#1D1A19] hover:text-white">
        <img src="/icons/log-out-01.svg" />
        Çıkış yap
      </button>
    </aside>
  );
};

export default Sidebar;
