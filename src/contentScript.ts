/**
 * Content Script - Site Blocking Backup
 * 
 * This script runs on all pages and checks if the current site should be blocked.
 * It serves as a backup for the declarativeNetRequest rules when browser caching
 * prevents the network-level blocking from working.
 */

// Check if current page should be blocked
async function checkAndBlock(): Promise<void> {
  try {
    // Get timer state from storage
    const result = await chrome.storage.local.get(['timerState', 'blockedSites']);
    
    const timerState = result.timerState;
    const blockedSites = result.blockedSites || [];
    
    // Only block if timer is running in focus mode
    if (!timerState || timerState.mode !== 'focus' || timerState.status !== 'running') {
      return;
    }
    
    // Get current domain
    const currentDomain = window.location.hostname.toLowerCase();
    
    // Check if current domain is blocked
    const isBlocked = blockedSites.some((site: string) => {
      const siteDomain = site.toLowerCase();
      return currentDomain === siteDomain || 
             currentDomain.endsWith('.' + siteDomain) ||
             currentDomain === 'www.' + siteDomain;
    });
    
    if (isBlocked) {
      // Redirect to blocked page
      const blockedSite = blockedSites.find((site: string) => {
        const siteDomain = site.toLowerCase();
        return currentDomain === siteDomain || 
               currentDomain.endsWith('.' + siteDomain) ||
               currentDomain === 'www.' + siteDomain;
      });
      
      const blockedUrl = chrome.runtime.getURL('blocked.html') + '?blocked=' + encodeURIComponent(blockedSite || currentDomain);
      window.location.href = blockedUrl;
    }
  } catch (error) {
    console.log('Content script error:', error);
  }
}

// Run check when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndBlock);
} else {
  checkAndBlock();
}

// Also listen for storage changes to update blocking status
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && (changes.timerState || changes.blockedSites)) {
    checkAndBlock();
  }
});
