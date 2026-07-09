<script>
  let { coins = [] } = $props();

  const botIcons = ['trending_up', 'grid_view', 'bolt', 'account_balance_wallet'];
  const availableStrategies = ['MA Crossover', 'Grid Trading', 'RSI Breakout', 'Scalping'];
  
  const coinDict = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'XRP': 'Ripple',
    'USDT': 'Tether',
    'DOGE': 'Dogecoin',
    'SOL': 'Solana',
    'ADA': 'Cardano',
    'DOT': 'Polkadot',
    'MATIC': 'Polygon',
    'BNB': 'Binance Coin'
  };

  let showModal = $state(false);
  let selectedCoin = $state(null);
  let formTp = $state(10.0);
  let formSl = $state(5.0);
  let formStrategy = $state('MA Crossover');

  function openSettings(coin) {
    selectedCoin = coin;
    formTp = coin.take_profit_pct || 10.0;
    formSl = coin.stop_loss_pct || 5.0;
    formStrategy = coin.strategy || 'MA Crossover';
    showModal = true;
  }

  async function saveSettings() {
    if (!selectedCoin) return;
    try {
      const symbolPath = selectedCoin.symbol.replace('/', '%2F');
      const res = await fetch(`/api/bot-config/${symbolPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          take_profit_pct: formTp,
          stop_loss_pct: formSl,
          strategy: formStrategy
        })
      });
      if (res.ok) {
        selectedCoin.take_profit_pct = formTp;
        selectedCoin.stop_loss_pct = formSl;
        selectedCoin.strategy = formStrategy;
        showModal = false;
      } else {
        alert("Gagal menyimpan konfigurasi.");
      }
    } catch (e) {
      alert("Error saat menyimpan: " + e.message);
    }
  }
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
              <p class="text-label-mono text-on-surface-variant flex gap-1 items-center">
                {coin.symbol} 
                <span class="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-tertiary">
                  {coinDict[coin.symbol.split('/')[0]] || coin.symbol.split('/')[0]}
                </span>
              </p>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="text-[10px] text-label-mono text-primary py-1 px-2 bg-primary/10 rounded-full font-bold uppercase">
              {coin.mode || 'AUTO'}
            </span>
            <button onclick={() => openSettings(coin)} class="text-on-surface-variant hover:text-primary transition-colors">
              <span class="material-symbols-outlined text-[18px]">settings</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Strategy</p>
            <p class="text-body-md text-on-surface font-semibold">{coin.strategy || 'MA Crossover'}</p>
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

{#if showModal}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
  <div class="glass-card w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl relative">
    <button onclick={() => showModal = false} class="absolute top-4 right-4 text-on-surface-variant hover:text-white">
      <span class="material-symbols-outlined">close</span>
    </button>
    
    <div class="mb-6">
      <h3 class="text-headline-md text-primary flex items-center gap-2">
        <span class="material-symbols-outlined">tune</span>
        Konfigurasi {selectedCoin?.symbol}
      </h3>
      <p class="text-body-sm text-on-surface-variant mt-1">Atur manajemen risiko dan strategi spesifik untuk koin ini.</p>
    </div>

    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-label-mono text-on-surface-variant mb-1">Strategi Aktif</label>
        <select bind:value={formStrategy} class="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary">
          {#each availableStrategies as strat}
            <option value={strat}>{strat}</option>
          {/each}
        </select>
        <p class="text-[10px] text-tertiary mt-1">*Sementara ini semua eksekusi Python diarahkan ke MA Crossover</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-label-mono text-on-surface-variant mb-1 text-primary">Take Profit (%)</label>
          <div class="relative">
            <input type="number" step="0.1" bind:value={formTp} class="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-on-surface font-mono focus:outline-none focus:border-primary">
            <span class="absolute right-3 top-2 text-on-surface-variant">%</span>
          </div>
        </div>
        <div>
          <label class="block text-label-mono text-on-surface-variant mb-1 text-secondary">Stop Loss (%)</label>
          <div class="relative">
            <input type="number" step="0.1" bind:value={formSl} class="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-on-surface font-mono focus:outline-none focus:border-secondary">
            <span class="absolute right-3 top-2 text-on-surface-variant">%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end gap-3">
      <button onclick={() => showModal = false} class="px-5 py-2.5 rounded-full text-on-surface hover:bg-white/5 transition-colors font-semibold">
        Batal
      </button>
      <button onclick={saveSettings} class="px-5 py-2.5 rounded-full bg-primary text-black hover:bg-primary-hover font-bold transition-all shadow-[0_0_15px_rgba(78,222,163,0.3)]">
        Simpan
      </button>
    </div>
  </div>
</div>
{/if}
