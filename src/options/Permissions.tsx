import { useState, useEffect } from 'react';
import { storage } from '../utils/storageUtils';

const PermissionsSettings = () => {
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [blockNotifications, setBlockNotifications] = useState<boolean>(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [sites, notifications] = await Promise.all([
          storage.getBlockedSites(),
          storage.getBlockNotifications()
        ]);
        setBlockedSites(sites);
        setBlockNotifications(notifications ?? true); // Default to true if not set
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setBlockedSites([]);
        setBlockNotifications(true);
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Save blocked sites to storage
  const saveBlockedSites = async (sites: string[]) => {
    try {
      await storage.setBlockedSites(sites);
      setBlockedSites(sites);
    } catch (error) {
      console.error('Error saving blocked sites:', error);
      alert('Site kaydedilirken hata oluştu!');
    }
  };

  // Add a new site to block list
  const handleAddSite = async () => {
    if (!newSite.trim()) return;

    // Clean up the URL - extract domain
    let domain = newSite.trim().toLowerCase();

    // Remove protocol if present
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');

    // Remove trailing slash
    domain = domain.replace(/\/$/, '');

    // Validate domain (must have at least one dot)
    if (!domain.includes('.')) {
      alert('Geçerli bir domain girin (örn: example.com)');
      return;
    }

    // Check if already exists
    if (blockedSites.includes(domain)) {
      alert('Bu site zaten engellenmiş!');
      return;
    }

    const updatedSites = [...blockedSites, domain];
    await saveBlockedSites(updatedSites);
    setNewSite('');
  };

  // Remove a site from block list
  const handleRemoveSite = async (site: string) => {
    const updatedSites = blockedSites.filter(s => s !== site);
    await saveBlockedSites(updatedSites);
  };

  // Quick add predefined sites
  const handleQuickAdd = async (site: string) => {
    if (blockedSites.includes(site)) {
      alert('Bu site zaten engellenmiş!');
      return;
    }
    const updatedSites = [...blockedSites, site];
    await saveBlockedSites(updatedSites);
  };

  // Handle Enter key in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddSite();
    }
  };

  // Save notification blocking preference
  const handleNotificationToggle = async (value: boolean) => {
    try {
      await storage.setBlockNotifications(value);
      setBlockNotifications(value);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Bildirim ayarları kaydedilirken hata oluştu!');
    }
  };

  if (isLoading) {
    return <div className="p-6 text-white">Yükleniyor...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h2 className="font-medium text-lg mb-6">Dikkat Yönetimi</h2>

      {/* Notification Blocking Section */}
      <div className="flex gap-6 mb-8">
        <div className="w-[344px]">
          <h3 className="font-medium text-sm mb-1">Bildirim Engelleme</h3>
          <p className="text-sm text-[#9F938F]">
            Odaklanma modunda web sitesi bildirimlerini engelleyin.
            Bu özellik dikkatinizi dağıtan bildirimleri engeller.
          </p>
        </div>

        <div className="w-[344px]">
          <div className="flex items-center justify-between bg-[#1D1A19] rounded-lg px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#CEC8C6]">
                Bildirimleri Engelle
              </span>
              <span className="text-xs text-[#9F938F]">
                Odak modunda tüm bildirimleri engelle
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={blockNotifications}
                onChange={(e) => handleNotificationToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2A2625] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D84315]"></div>
            </label>
          </div>
          
          {blockNotifications && (
            <div className="mt-3 p-3 bg-[#2A2625] rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-[#D84315] text-sm">ℹ️</div>
                <div className="text-xs text-[#9F938F]">
                  <p className="mb-1">Bildirim engelleme şunları içerir:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Web sitesi bildirim izinleri</li>
                    <li>Push bildirimler</li>
                    <li>Mevcut açık bildirimler</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <div className="w-[344px]">
          <h3 className="font-medium text-sm mb-1">Site Engelleyici</h3>
          <p className="text-sm text-[#9F938F]">
            Odaklanma modunda dikkatinizi dağıtan siteleri engelleyin.
            Pomodoro başladığında bu siteler otomatik olarak engellenir.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-[344px]">
          {/* Quick Add Buttons */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#9F938F]">Hızlı Ekle</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleQuickAdd('youtube.com')}
                className="bg-[#1D1A19] hover:bg-[#2A2625] rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                YouTube
              </button>
              <button
                onClick={() => handleQuickAdd('x.com')}
                className="bg-[#1D1A19] hover:bg-[#2A2625] rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                X
              </button>
              <button
                onClick={() => handleQuickAdd('instagram.com')}
                className="bg-[#1D1A19] hover:bg-[#2A2625] rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                Instagram
              </button>
              <button
                onClick={() => handleQuickAdd('facebook.com')}
                className="bg-[#1D1A19] hover:bg-[#2A2625] rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                Facebook
              </button>
              <button
                onClick={() => handleQuickAdd('reddit.com')}
                className="bg-[#1D1A19] hover:bg-[#2A2625] rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                Reddit
              </button>
            </div>
          </div>

          {/* Add Custom Site */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#9F938F]">Özel Site Ekle</span>
            <div className="flex gap-2">
                <input
                  type="text"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="örn: youtube.com"
                  className="flex-1 bg-[#1D1A19] rounded-lg font-medium text-[#CEC8C6] py-2.5 px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#3A3634]"
                />
              <button
                onClick={handleAddSite}
                className="bg-[#D84315] hover:bg-[#BF360C] rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Sites List */}
      {blockedSites.length > 0 && (
        <div className="flex gap-6">
          <div className="w-[344px]">
            <h3 className="font-medium text-sm mb-1">Engellenmiş Siteler</h3>
            <p className="text-sm text-[#9F938F]">
              Odaklanma modunda bu siteler erişime kapalı olacak.
            </p>
          </div>

          <div className="w-[344px]">
            <div className="flex flex-col gap-2">
              {blockedSites.map((site) => (
                <div
                  key={site}
                  className="flex items-center justify-between bg-[#1D1A19] rounded-lg px-4 py-2.5"
                >
                  <span className="text-sm text-[#CEC8C6]">{site}</span>
                  <button
                    onClick={() => handleRemoveSite(site)}
                    className="text-[#9F938F] hover:text-[#D84315] transition-colors text-sm"
                    title="Kaldır"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {blockedSites.length > 0 && (
              <p className="text-xs text-[#9F938F] mt-3">
                Toplam {blockedSites.length} site engellenmiş
              </p>
            )}
          </div>
        </div>
      )}

      {blockedSites.length === 0 && (
        <div className="text-center py-8 text-[#9F938F] text-sm">
          Henüz engellenmiş site yok. Yukarıdaki butonlardan ekleyebilirsiniz.
        </div>
      )}
    </div>
  );
};

export default PermissionsSettings;
