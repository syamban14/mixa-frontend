<script>
  let { coins = [] } = $props();

  const botIcons = ['trending_up', 'grid_view', 'bolt', 'account_balance_wallet'];
  const strategies = ['MA Crossover', 'Grid Trading', 'RSI Breakout', 'Scalping'];
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div>
      <h2 class="text-headline-md text-on-surface">Bot Management</h2>
      <p class="text-on-surface-variant text-body-sm">Monitor and control your automated trading strategies in real-time.</p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {#each coins as coin, i}
      <div class="glass-card rounded-xl p-4 flex flex-col gap-4 transition-all hover:scale-[1.01] bot-active-glow relative overflow-hidden group">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined">{botIcons[i % botIcons.length]}</span>
            </div>
            <div>
              <h3 class="text-headline-sm text-on-surface leading-tight">MIXA Bot {coin.symbol.split('/')[0]}</h3>
              <p class="text-label-mono text-on-surface-variant">{coin.symbol}</p>
            </div>
          </div>
          <span class="text-[10px] text-label-mono text-primary py-1 px-2 bg-primary/10 rounded-full font-bold uppercase">
            {coin.mode || 'AUTO'}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Strategy</p>
            <p class="text-body-md text-on-surface font-semibold">{strategies[i % strategies.length]}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Sinyal</p>
            {#if coin.signal === 'BUY'}
              <p class="text-data-numeric text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">arrow_upward</span>
                BUY
              </p>
            {:else if coin.signal === 'SELL'}
              <p class="text-data-numeric text-secondary flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">arrow_downward</span>
                SELL
              </p>
            {:else}
              <p class="text-data-numeric text-on-surface-variant">HOLD</p>
            {/if}
          </div>
        </div>

        <div class="flex justify-between items-center mt-2">
          <div class="text-label-mono text-on-surface-variant text-[10px]">
            Update: {coin.last_update ? new Date(coin.last_update).toLocaleTimeString('id-ID') : '-'} WIB
          </div>
          <span class="flex items-center gap-1 text-[10px] text-primary font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            ACTIVE
          </span>
        </div>
      </div>
    {/each}
  </div>

  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
    <div class="glass-card rounded-xl p-4 border-l-4 border-primary">
      <p class="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Total Pairs</p>
      <h4 class="text-data-numeric text-headline-md text-on-surface">{coins.length}</h4>
    </div>
    <div class="glass-card rounded-xl p-4 border-l-4 border-primary">
      <p class="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Active Bots</p>
      <h4 class="text-data-numeric text-headline-md text-primary">{coins.length}</h4>
    </div>
    <div class="glass-card rounded-xl p-4 border-l-4 border-tertiary">
      <p class="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Engine</p>
      <h4 class="text-data-numeric text-headline-md text-on-surface">MIXA AI</h4>
    </div>
    <div class="glass-card rounded-xl p-4 border-l-4 border-outline">
      <p class="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Database</p>
      <h4 class="text-data-numeric text-headline-md text-on-surface">SQLite</h4>
    </div>
  </div>
</div>
