<script>
  let { coins = [], activeCoinIndex = $bindable(0) } = $props();
  
  let showDropdown = $state(false);
  let visibleCoins = $derived(coins.slice(0, 5));
  let hiddenCoins = $derived(coins.slice(5));
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
    <div class="flex items-center gap-2">
      <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-1">notifications</button>
      <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-1">settings</button>
    </div>
  </div>
</header>
