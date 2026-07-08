<script>
  let { coins = [], activeCoinIndex = $bindable(0) } = $props();
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
      {#each coins as coin, i}
        <button
          class="text-label-mono px-3 py-1 rounded-full transition-all font-bold text-xs
            {activeCoinIndex === i
              ? 'bg-primary-container text-on-primary-container'
              : 'text-on-surface-variant hover:text-primary'}"
          onclick={() => activeCoinIndex = i}
        >
          {coin.symbol}
        </button>
      {/each}
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
