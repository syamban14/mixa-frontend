<script>
  import { onMount, onDestroy } from 'svelte';
  
  let { coins = [], activeCoinIndex = $bindable(0) } = $props();
  
  let showDropdown = $state(false);
  let visibleCoins = $derived(coins.slice(0, 5));
  let hiddenCoins = $derived(coins.slice(5));
  
  // Notification State
  let notifications = $state([]);
  let showNotifDropdown = $state(false);
  let unreadCount = $derived(notifications.filter(n => !n.is_read).length);
  let pollInterval;
  
  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        notifications = data.notifications || [];
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  async function markAsRead() {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      notifications = notifications.map(n => ({ ...n, is_read: true }));
    } catch (e) {
      console.error(e);
    }
  }
  
  onMount(() => {
    fetchNotifications();
    pollInterval = setInterval(fetchNotifications, 10000); // Poll tiap 10 detik
  });
  
  onDestroy(() => {
    if (pollInterval) clearInterval(pollInterval);
  });
</script>

<header class="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-sm flex justify-between items-center px-6">
  <div class="flex items-center gap-4">
    <div class="relative w-64">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
      <input
        class="w-full bg-surface-container-lowest border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-label-mono focus:border-primary/50 focus:ring-0 transition-all outline-none text-on-surface"
        placeholder="Search Markets..."
        type="text"
      />
    </div>
    <div class="flex gap-2 ml-4">
      {#each visibleCoins as coin, i}
        <button
          class="text-label-mono px-3 py-1 rounded-full transition-all font-bold text-xs
            {activeCoinIndex === i
              ? 'bg-primary-container text-on-primary-container'
              : 'text-on-surface-variant hover:text-primary hover:bg-white/5'}"
          onclick={() => activeCoinIndex = i}
        >
          {coin.symbol}
        </button>
      {/each}

      {#if hiddenCoins.length > 0}
        <div class="relative">
          <button 
            class="text-label-mono px-3 py-1 rounded-full transition-all font-bold text-xs
              {activeCoinIndex >= 5 ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-primary hover:bg-white/5'}"
            onclick={() => showDropdown = !showDropdown}
          >
            ...
          </button>
          
          {#if showDropdown}
            <div class="absolute top-full mt-2 left-0 w-32 bg-surface border border-white/10 rounded-xl shadow-2xl py-2 z-50">
              {#each hiddenCoins as coin, i}
                <button
                  class="w-full text-left px-4 py-2 text-label-mono text-xs font-bold transition-all
                    {activeCoinIndex === i + 5 ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}"
                  onclick={() => {
                    activeCoinIndex = i + 5;
                    showDropdown = false;
                  }}
                >
                  {coin.symbol}
                </button>
              {/each}
            </div>
            
            <div class="fixed inset-0 z-40" onclick={() => showDropdown = false}></div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <div class="flex items-center gap-4">
    {#if coins.length > 0}
      <div class="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-white/5">
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span class="text-label-mono text-on-surface">
          Rp {coins[activeCoinIndex]?.current_price?.toLocaleString('id-ID') || '...'}
        </span>
      </div>
    {/if}
    <div class="flex items-center gap-4">
    <div class="relative">
      <button 
        class="relative w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-white transition-colors"
        onclick={() => {
          showNotifDropdown = !showNotifDropdown;
          if (showNotifDropdown && unreadCount > 0) markAsRead();
        }}
      >
        <span class="material-symbols-outlined text-[20px]">notifications</span>
        {#if unreadCount > 0}
          <span class="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        {/if}
      </button>
      
      {#if showNotifDropdown}
        <div class="absolute top-full mt-2 right-0 w-80 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div class="px-4 py-3 border-b border-white/10 bg-surface-container-lowest">
            <h3 class="text-sm font-bold text-on-surface">Notifikasi Autopilot</h3>
          </div>
          <div class="max-h-[300px] overflow-y-auto">
            {#if notifications.length === 0}
              <div class="p-6 text-center text-sm text-on-surface-variant">Belum ada aktivitas.</div>
            {:else}
              {#each notifications as notif}
                <div class="p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors text-sm">
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5
                      {notif.type === 'success' ? 'text-primary' : 
                       notif.type === 'warning' ? 'text-error' : 'text-secondary'}">
                      {notif.type === 'success' ? 'check_circle' : 
                       notif.type === 'warning' ? 'warning' : 'info'}
                    </span>
                    <div>
                      <p class="text-on-surface leading-tight text-xs">{notif.message}</p>
                      <p class="text-[10px] text-on-surface-variant mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
        <div class="fixed inset-0 z-40" onclick={() => showNotifDropdown = false}></div>
      {/if}
    </div>

    <button class="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 text-primary transition-colors">
      <span class="material-symbols-outlined text-[20px]">account_circle</span>
    </button>
  </div>
</header>
