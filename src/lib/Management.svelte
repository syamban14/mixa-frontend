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
    'BNB': 'Binance Coin',
    'LRC': 'Loopring',
    'TRX': 'Tron'
  };

  let showModal = $state(false);
  let selectedCoin = $state(null);
  let formTp = $state(10.0);
  let formSl = $state(5.0);
  let formBuyAmount = $state(20000.0);
  let formStrategy = $state('MA Crossover');
  let formIsActive = $state(true);

  function openSettings(coin) {
    selectedCoin = coin;
    formTp = coin.take_profit_pct || 10.0;
    formSl = coin.stop_loss_pct || 5.0;
    formBuyAmount = coin.buy_amount || 20000.0;
    formStrategy = coin.strategy || 'MA Crossover';
    formIsActive = coin.is_active !== undefined ? coin.is_active : true;
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
          strategy: formStrategy,
          buy_amount: formBuyAmount,
          is_active: formIsActive
        })
      });
      if (res.ok) {
        selectedCoin.take_profit_pct = formTp;
        selectedCoin.stop_loss_pct = formSl;
        selectedCoin.strategy = formStrategy;
        selectedCoin.buy_amount = formBuyAmount;
        selectedCoin.is_active = formIsActive;
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
          {#if coin.is_active}
            <span class="flex items-center gap-1 text-[10px] text-primary font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              ACTIVE
            </span>
          {:else}
            <span class="flex items-center gap-1 text-[10px] text-on-surface-variant font-bold opacity-60">
              <span class="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
              NOT ACTIVE
            </span>
          {/if}
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
      <h4 class="text-data-numeric text-headline-md text-primary">{coins.filter(c => c.is_active).length}</h4>
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
  <div class="glass-card w-full max-w-2xl rounded-3xl p-8 border border-white/10 shadow-2xl relative">
    <button onclick={() => showModal = false} class="absolute top-6 right-6 text-on-surface-variant hover:text-white">
      <span class="material-symbols-outlined text-3xl">close</span>
    </button>
    
    <div class="mb-8">
      <h3 class="text-[32px] font-bold text-primary flex items-center gap-3">
        <span class="material-symbols-outlined text-[36px]">tune</span>
        Konfigurasi {selectedCoin?.symbol}
      </h3>
      <p class="text-body-md text-on-surface-variant mt-2">Atur manajemen risiko dan strategi spesifik untuk koin ini.</p>
    </div>

    <div class="flex flex-col gap-6">
      
      <div class="flex items-center justify-between p-4 rounded-xl bg-surface-container border border-white/5">
        <div>
          <h4 class="text-body-lg font-bold text-on-surface flex items-center gap-2">
            Status Koin
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {formIsActive ? 'bg-primary/20 text-primary' : 'bg-on-surface-variant/20 text-on-surface-variant'}">
              {formIsActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </h4>
          <p class="text-sm text-on-surface-variant mt-1">
            Jika dimatikan, bot tidak akan memantau atau membeli koin ini, dan koin akan disembunyikan dari Dasbor.
          </p>
        </div>
        
        <!-- Svelte Custom Toggle Switch -->
        <button 
          class="relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none {formIsActive ? 'bg-primary' : 'bg-surface-container-high border border-white/20'}"
          onclick={() => formIsActive = !formIsActive}
        >
          <span class="absolute top-1 left-1 w-6 h-6 rounded-full transition-transform duration-300 shadow-sm {formIsActive ? 'translate-x-6 bg-black' : 'translate-x-0 bg-on-surface-variant'}"></span>
        </button>
      </div>

      <div>
        <label class="block text-body-md font-bold text-on-surface-variant mb-2">Strategi Aktif</label>
        <select bind:value={formStrategy} class="w-full bg-surface-container border border-white/10 rounded-xl px-5 py-4 text-lg text-on-surface focus:outline-none focus:border-primary cursor-pointer">
          {#each availableStrategies as strat}
            <option value={strat}>{strat}</option>
          {/each}
        </select>
        <p class="text-sm text-tertiary mt-2">*Sementara ini semua eksekusi Python diarahkan ke MA Crossover</p>
      </div>

      <div>
        <label class="block text-body-md font-bold text-on-surface-variant mb-2">Nominal Pembelian (Alokasi Modal)</label>
        <div class="relative">
          <span class="absolute left-4 top-4 text-xl text-on-surface-variant font-bold">Rp</span>
          <input type="number" step="1000" bind:value={formBuyAmount} class="w-full bg-surface-container border border-white/10 rounded-xl pl-14 pr-5 py-4 text-xl text-on-surface font-mono focus:outline-none focus:border-primary">
        </div>
        <p class="text-sm text-on-surface-variant mt-2">Atur porsi modal untuk koin ini. Batas minimal Indodax adalah Rp 10.000.</p>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block text-body-md font-bold text-on-surface-variant mb-2 text-primary">Take Profit (%)</label>
          <div class="relative">
            <input type="number" step="0.1" bind:value={formTp} class="w-full bg-surface-container border border-white/10 rounded-xl px-5 py-4 text-xl text-on-surface font-mono focus:outline-none focus:border-primary">
            <span class="absolute right-4 top-4 text-xl text-on-surface-variant">%</span>
          </div>
        </div>
        <div>
          <label class="block text-body-md font-bold text-on-surface-variant mb-2 text-secondary">Stop Loss (%)</label>
          <div class="relative">
            <input type="number" step="0.1" bind:value={formSl} class="w-full bg-surface-container border border-white/10 rounded-xl px-5 py-4 text-xl text-on-surface font-mono focus:outline-none focus:border-secondary">
            <span class="absolute right-4 top-4 text-xl text-on-surface-variant">%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-10 flex justify-end gap-4">
      <button onclick={() => showModal = false} class="px-8 py-4 rounded-full text-lg text-on-surface hover:bg-white/5 transition-colors font-semibold">
        Batal
      </button>
      <button onclick={saveSettings} class="px-8 py-4 rounded-full bg-primary text-black text-lg hover:bg-primary-hover font-bold transition-all shadow-[0_0_20px_rgba(78,222,163,0.4)]">
        Simpan Pengaturan
      </button>
    </div>
  </div>
</div>
{/if}
