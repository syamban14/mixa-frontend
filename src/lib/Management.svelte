<script>
  let { coins = [] } = $props();

  const botIcons = ['trending_up', 'grid_view', 'bolt', 'account_balance_wallet'];
  const availableStrategies = ['MA Crossover', 'Grid Trading', 'RSI Breakout', 'Scalping', 'Bollinger Bands'];
  
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
    'TRX': 'Tron',
    'PEPE': 'Pepe'
  };

  let showModal = $state(false);
  let selectedCoin = $state(null);
  let formTp = $state(10.0);
  let formSl = $state(5.0);
  let formBuyAmount = $state(20000.0);
  let formStrategy = $state('MA Crossover');
  let formIsActive = $state(true);
  let formEntryPrice = $state(0.0);
  let formUseTrailingStop = $state(false);
  let formTrailingStopPct = $state(2.0);
  let formUseDynamicRoi = $state(false);
  let formDynamicRoiConfig = $state('{"0": 5.0, "60": 2.0, "1440": 0.5}');
  let formUseDca = $state(false);
  let formDcaMaxOrders = $state(3);
  let formDcaStepPct = $state(3.0);
  let formDcaVolumeScale = $state(1.0);
  let formUseMacroTrend = $state(false);
  let formUseTrailingBuy = $state(false);
  let formTrailingBuyPct = $state(1.0);
  let formUseWhaleRadar = $state(false);
  let formUseAutotune = $state(false);

  let newCoinSymbol = $state('');
  let isAddingCoin = $state(false);

  async function addNewCoin() {
    if (!newCoinSymbol || newCoinSymbol.trim() === '') {
      alert("Silakan ketikkan nama koin (contoh: BTC/IDR) di kolom teks terlebih dahulu!");
      return;
    }
    isAddingCoin = true;
    try {
      const res = await fetch('/api/coin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: newCoinSymbol })
      });
      if (res.ok) {
        newCoinSymbol = '';
        alert("Koin berhasil ditambahkan!");
        window.location.reload();
      } else {
        const error = await res.json();
        alert("Gagal menambahkan koin: " + (error.detail || "Kesalahan server"));
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      isAddingCoin = false;
    }
  }

  async function deleteCoin(coin) {
    if (!confirm(`Yakin ingin MENGHAPUS koin ${coin.symbol} secara permanen dari database?`)) return;
    try {
      const symbolPath = coin.symbol.replace('/', '%2F');
      const res = await fetch(`/api/coin/${symbolPath}`, { method: 'DELETE' });
      if (res.ok) {
        alert(`${coin.symbol} berhasil dihapus dari database.`);
        window.location.reload();
      } else {
        alert("Gagal menghapus koin.");
      }
    } catch(e) {
      alert("Error: " + e.message);
    }
  }

  function openSettings(coin) {
    selectedCoin = coin;
    formTp = coin.take_profit_pct || 10.0;
    formSl = coin.stop_loss_pct || 5.0;
    formBuyAmount = coin.buy_amount || 20000.0;
    formStrategy = coin.strategy || 'MA Crossover';
    formIsActive = coin.is_active !== undefined ? coin.is_active : true;
    formEntryPrice = coin.entry_price || 0.0;
    formUseTrailingStop = coin.use_trailing_stop || false;
    formTrailingStopPct = coin.trailing_stop_pct || 2.0;
    formUseDynamicRoi = coin.use_dynamic_roi || false;
    formDynamicRoiConfig = coin.dynamic_roi_config || '{"0": 5.0, "60": 2.0, "1440": 0.5}';
    formUseDca = coin.use_dca || false;
    formDcaMaxOrders = coin.dca_max_orders || 3;
    formDcaStepPct = coin.dca_step_pct || 3.0;
    formDcaVolumeScale = coin.dca_volume_scale || 1.0;
    formUseMacroTrend = coin.use_macro_trend || false;
    formUseTrailingBuy = coin.use_trailing_buy || false;
    formTrailingBuyPct = coin.trailing_buy_pct || 1.0;
    formUseWhaleRadar = coin.use_whale_radar || false;
    formUseAutotune = coin.use_autotune || false;
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
          is_active: formIsActive,
          entry_price: formEntryPrice,
          use_trailing_stop: formUseTrailingStop,
          trailing_stop_pct: formTrailingStopPct,
          use_dynamic_roi: formUseDynamicRoi,
          dynamic_roi_config: formDynamicRoiConfig,
          use_dca: formUseDca,
          dca_max_orders: formDcaMaxOrders,
          dca_step_pct: formDcaStepPct,
          dca_volume_scale: formDcaVolumeScale,
          use_macro_trend: formUseMacroTrend,
          use_trailing_buy: formUseTrailingBuy,
          trailing_buy_pct: formTrailingBuyPct,
          use_whale_radar: formUseWhaleRadar,
          use_autotune: formUseAutotune
        })
      });
      if (res.ok) {
        selectedCoin.take_profit_pct = formTp;
        selectedCoin.stop_loss_pct = formSl;
        selectedCoin.strategy = formStrategy;
        selectedCoin.buy_amount = formBuyAmount;
        selectedCoin.is_active = formIsActive;
        selectedCoin.entry_price = formEntryPrice;
        selectedCoin.use_trailing_stop = formUseTrailingStop;
        selectedCoin.trailing_stop_pct = formTrailingStopPct;
        selectedCoin.use_dynamic_roi = formUseDynamicRoi;
        selectedCoin.dynamic_roi_config = formDynamicRoiConfig;
        selectedCoin.use_dca = formUseDca;
        selectedCoin.dca_max_orders = formDcaMaxOrders;
        selectedCoin.dca_step_pct = formDcaStepPct;
        selectedCoin.dca_volume_scale = formDcaVolumeScale;
        selectedCoin.use_macro_trend = formUseMacroTrend;
        selectedCoin.use_trailing_buy = formUseTrailingBuy;
        selectedCoin.trailing_buy_pct = formTrailingBuyPct;
        selectedCoin.use_whale_radar = formUseWhaleRadar;
        selectedCoin.use_autotune = formUseAutotune;
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
    
    <div class="flex items-center gap-2">
      <input 
        type="text" 
        bind:value={newCoinSymbol} 
        placeholder="Cth: SHIB/IDR" 
        class="bg-surface-container border border-white/10 rounded-xl px-4 py-2 text-on-surface focus:outline-none focus:border-primary font-mono text-sm w-40"
      >
      <button 
        onclick={addNewCoin} 
        class="flex items-center gap-1 bg-primary text-background px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-95"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Tambah
      </button>
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
            {#if coin.use_dca && (coin.dca_completed_orders || 0) > 0}
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">DCA: {coin.dca_completed_orders}/{coin.dca_max_orders || 3}</span>
            {/if}
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">AKTIF</span>
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
  <div class="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 border border-white/10 shadow-2xl relative">
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
          class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {formIsActive ? 'bg-primary' : 'bg-surface-container-high border border-white/20'}"
          onclick={() => formIsActive = !formIsActive}
        >
          <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 shadow-sm {formIsActive ? 'translate-x-6 bg-black' : 'translate-x-0 bg-on-surface-variant'}"></span>
        </button>
      </div>
      
      <div class="p-6 rounded-xl bg-gradient-to-br from-tertiary/20 to-transparent border border-tertiary/30 relative overflow-hidden mt-6 mb-6">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl"></div>
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-body-lg font-bold text-tertiary flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">smart_toy</span>
              AI Autopilot (Auto-Tune)
              <span class="px-2 py-0.5 rounded text-[9px] bg-tertiary/20 text-tertiary uppercase font-bold tracking-wider">
                Fase 4
              </span>
            </h4>
            <p class="text-sm text-on-surface-variant mt-1">
              Biarkan bot mengatur strategi (MA/RSI/BB) dan parameter DCA/SL berdasarkan volatilitas dan tren pasar secara otomatis.
            </p>
          </div>
          <button 
            class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {formUseAutotune ? 'bg-tertiary' : 'bg-surface-container-high border border-white/20'}"
            onclick={() => formUseAutotune = !formUseAutotune}
          >
            <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 shadow-sm {formUseAutotune ? 'translate-x-6 bg-black' : 'translate-x-0 bg-on-surface-variant'}"></span>
          </button>
        </div>
      </div>

      <div class="{formUseAutotune ? 'opacity-50 pointer-events-none' : ''}">
        <label class="block text-body-md font-bold text-on-surface-variant mb-2">Harga Beli Manual (Rp)</label>
        <input type="number" bind:value={formEntryPrice} class="w-full bg-surface-container border border-white/10 rounded-xl px-5 py-4 text-lg text-on-surface focus:outline-none focus:border-primary font-mono text-data-numeric">
        <p class="text-[10px] text-on-surface-variant mt-1">Kosongkan/0 jika ingin otomatis dari bot.</p>
      </div>

      <div class="{formUseAutotune ? 'opacity-50 pointer-events-none' : ''}">
        <label class="block text-body-md font-bold text-on-surface-variant mb-2">Strategi Aktif</label>
        <select bind:value={formStrategy} class="w-full bg-surface-container border border-white/10 rounded-xl px-5 py-4 text-lg text-on-surface focus:outline-none focus:border-primary cursor-pointer">
          {#each availableStrategies as strat}
            <option value={strat}>{strat}</option>
          {/each}
        </select>
        <p class="text-sm text-tertiary mt-2">*Berbagai strategi sekarang didukung sepenuhnya oleh mesin bot.</p>
      </div>

      <div class="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div>
          <h4 class="text-body-md font-bold text-primary flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">query_stats</span>
            Filter Tren Makro (4H)
          </h4>
          <p class="text-xs text-on-surface-variant mt-1">
            Bot akan memblokir sinyal beli palsu saat pasar sedang Downtrend (Harga di bawah SMA50 - 4 Jam).
          </p>
        </div>
        <button 
          class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {formUseMacroTrend ? 'bg-primary' : 'bg-surface-container-high border border-white/20'}"
          onclick={() => formUseMacroTrend = !formUseMacroTrend}
        >
          <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 shadow-sm {formUseMacroTrend ? 'translate-x-6 bg-black' : 'translate-x-0 bg-on-surface-variant'}"></span>
        </button>
      </div>

      <div>
        <label class="block text-body-md font-bold text-on-surface-variant mb-2">Nominal Pembelian (Alokasi Modal)</label>
        <div class="relative">
          <span class="absolute left-4 top-4 text-xl text-on-surface-variant font-bold">Rp</span>
          <input type="number" step="1000" bind:value={formBuyAmount} class="w-full bg-surface-container border border-white/10 rounded-xl pl-14 pr-5 py-4 text-xl text-on-surface font-mono focus:outline-none focus:border-primary">
        </div>
        <p class="text-sm text-on-surface-variant mt-2">Atur porsi modal untuk koin ini. Batas minimal Indodax adalah Rp 10.000.</p>
      </div>

      <div class="grid grid-cols-2 gap-6 {formUseAutotune ? 'opacity-50 pointer-events-none' : ''}">
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

      <div class="p-6 rounded-xl bg-surface-container border border-primary/20 relative overflow-hidden {formUseAutotune ? 'opacity-50 pointer-events-none' : ''}">
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
        
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="text-body-lg font-bold text-primary flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">trending_down</span>
              Trailing Stop Loss
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {formUseTrailingStop ? 'bg-primary/20 text-primary' : 'bg-on-surface-variant/20 text-on-surface-variant'}">
                {formUseTrailingStop ? 'Aktif' : 'Nonaktif'}
              </span>
            </h4>
            <p class="text-sm text-on-surface-variant mt-1">
              Otomatis mengunci profit jika harga turun dari puncak tertingginya. Mengabaikan Take Profit statis.
            </p>
          </div>
          
          <button 
            class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {formUseTrailingStop ? 'bg-primary' : 'bg-surface-container-high border border-white/20'}"
            onclick={() => formUseTrailingStop = !formUseTrailingStop}
          >
            <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 shadow-sm {formUseTrailingStop ? 'translate-x-6 bg-black' : 'translate-x-0 bg-on-surface-variant'}"></span>
          </button>
        </div>

        {#if formUseTrailingStop}
          <div class="mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
            <label class="block text-body-md font-bold text-on-surface-variant mb-2">Batas Toleransi Penurunan (%)</label>
            <div class="relative">
              <input type="number" step="0.1" bind:value={formTrailingStopPct} class="w-full bg-black/20 border border-primary/30 rounded-xl px-5 py-4 text-xl text-primary font-mono focus:outline-none focus:border-primary">
              <span class="absolute right-4 top-4 text-xl text-primary">%</span>
            </div>
            <p class="text-xs text-primary/70 mt-2">Bot akan menjual jika harga turun sebanyak {formTrailingStopPct}% dari harga puncak tertingginya.</p>
          </div>
        {/if}
      </div>

      <div class="p-6 rounded-xl bg-surface-container border border-tertiary/20 relative overflow-hidden {formUseAutotune ? 'opacity-50 pointer-events-none' : ''}">
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-tertiary/5 rounded-full blur-2xl"></div>
        
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="text-body-lg font-bold text-tertiary flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">hourglass_bottom</span>
              Dynamic ROI (Timer Target)
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {formUseDynamicRoi ? 'bg-tertiary/20 text-tertiary' : 'bg-on-surface-variant/20 text-on-surface-variant'}">
                {formUseDynamicRoi ? 'Aktif' : 'Nonaktif'}
              </span>
            </h4>
            <p class="text-sm text-on-surface-variant mt-1">
              Otomatis menurunkan target Take Profit seiring berjalannya waktu (dalam menit) untuk menghindari modal mati.
            </p>
          </div>
          
          <button 
            class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {formUseDynamicRoi ? 'bg-tertiary' : 'bg-surface-container-high border border-white/20'}"
            onclick={() => formUseDynamicRoi = !formUseDynamicRoi}
          >
            <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 shadow-sm {formUseDynamicRoi ? 'translate-x-6 bg-black' : 'translate-x-0 bg-on-surface-variant'}"></span>
          </button>
        </div>

        {#if formUseDynamicRoi}
          <div class="mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
            <label class="block text-body-md font-bold text-on-surface-variant mb-2">Konfigurasi Aturan Waktu (Format JSON)</label>
            <div class="relative">
              <textarea rows="3" bind:value={formDynamicRoiConfig} class="w-full bg-black/20 border border-tertiary/30 rounded-xl px-5 py-4 text-sm text-tertiary font-mono focus:outline-none focus:border-tertiary"></textarea>
            </div>
            <p class="text-xs text-tertiary/70 mt-2">Format: {"{"} "Menit": Persentase_Target {"}"}. Contoh: {"{"}"0": 5.0, "60": 2.0, "1440": 0.5{"}"} artinya: Awalnya 5%, setelah 60 menit turun jadi 2%, setelah 1 hari (1440 mnt) turun jadi 0.5% (Balik modal).</p>
          </div>
        {/if}
      </div>

      <!-- DCA SECTION -->
      <div class="p-6 rounded-xl bg-surface-container border border-secondary/20 relative overflow-hidden {formUseAutotune ? 'opacity-50 pointer-events-none' : ''}">
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-secondary/5 rounded-full blur-2xl"></div>
        
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="text-body-lg font-bold text-secondary flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
              DCA (Safety Orders)
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {formUseDca ? 'bg-secondary/20 text-secondary' : 'bg-on-surface-variant/20 text-on-surface-variant'}">
                {formUseDca ? 'Aktif' : 'Nonaktif'}
              </span>
            </h4>
            <p class="text-sm text-on-surface-variant mt-1">
              Serok bawah otomatis saat harga turun untuk mendapatkan Average Entry Price yang lebih murah.
            </p>
          </div>
          
          <button 
            class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {formUseDca ? 'bg-secondary' : 'bg-surface-container-high border border-white/20'}"
            onclick={() => formUseDca = !formUseDca}
          >
            <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 shadow-sm {formUseDca ? 'translate-x-6 bg-black' : 'translate-x-0 bg-on-surface-variant'}"></span>
          </button>
        </div>

        {#if formUseDca}
          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 fade-in duration-300">
            <div>
              <label class="block text-body-md font-bold text-on-surface-variant mb-2">Maks. Safety Orders</label>
              <div class="relative">
                <input type="number" bind:value={formDcaMaxOrders} min="1" max="10" step="1" class="w-full bg-black/20 border border-secondary/30 rounded-xl px-5 py-4 text-body-lg text-white font-bold focus:outline-none focus:border-secondary">
              </div>
              <p class="text-xs text-on-surface-variant/70 mt-1">Batas maksimal serok.</p>
            </div>
            
            <div>
              <label class="block text-body-md font-bold text-on-surface-variant mb-2">Jarak Penurunan (%)</label>
              <div class="relative">
                <input type="number" bind:value={formDcaStepPct} min="0.1" step="0.1" class="w-full bg-black/20 border border-secondary/30 rounded-xl px-5 py-4 text-body-lg text-secondary font-bold focus:outline-none focus:border-secondary">
                <span class="absolute right-5 top-1/2 -translate-y-1/2 text-secondary font-bold">%</span>
              </div>
              <p class="text-xs text-on-surface-variant/70 mt-1">Turun dari Average Price.</p>
            </div>
            
            <div>
              <label class="block text-body-md font-bold text-on-surface-variant mb-2">Skala Volume (Martingale)</label>
              <div class="relative">
                <input type="number" bind:value={formDcaVolumeScale} min="0.1" step="0.1" class="w-full bg-black/20 border border-secondary/30 rounded-xl px-5 py-4 text-body-lg text-secondary font-bold focus:outline-none focus:border-secondary">
                <span class="absolute right-5 top-1/2 -translate-y-1/2 text-secondary font-bold">x</span>
              </div>
              <p class="text-xs text-on-surface-variant/70 mt-1">Pengganda nominal beli (1.0 = sama).</p>
            </div>
          </div>
        {/if}
      </div>

      <div class="p-6 rounded-xl bg-surface-container border border-primary/20 relative overflow-hidden {formUseAutotune ? 'opacity-50 pointer-events-none' : ''}">
        <div class="absolute -left-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
        
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="text-body-lg font-bold text-primary flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">moving</span>
              Trailing Buy (Serok Bergerak)
              <span class="px-2 py-0.5 rounded text-[9px] bg-primary/20 text-primary uppercase font-bold tracking-wider">
                Fase 2
              </span>
            </h4>
            <p class="text-sm text-on-surface-variant mt-1">
              Saat sinyal Beli aktif, bot tidak akan langsung membeli. Bot akan membuntuti harga turun, dan baru membeli saat harga memantul naik.
            </p>
          </div>
          
          <button 
            class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {formUseTrailingBuy ? 'bg-primary' : 'bg-surface-container-high border border-white/20'}"
            onclick={() => formUseTrailingBuy = !formUseTrailingBuy}
          >
            <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 shadow-sm {formUseTrailingBuy ? 'translate-x-6 bg-black' : 'translate-x-0 bg-on-surface-variant'}"></span>
          </button>
        </div>

        {#if formUseTrailingBuy}
          <div class="mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
            <label class="block text-body-md font-bold text-on-surface-variant mb-2">Toleransi Pantulan (%)</label>
            <div class="relative">
              <input type="number" step="0.1" bind:value={formTrailingBuyPct} class="w-full bg-black/20 border border-primary/30 rounded-xl px-5 py-4 text-xl text-primary font-mono focus:outline-none focus:border-primary">
              <span class="absolute right-5 top-1/2 -translate-y-1/2 text-primary font-bold">%</span>
            </div>
            <p class="text-xs text-on-surface-variant/70 mt-2">Bot akan mengeksekusi pembelian jika harga naik sebesar persentase ini dari titik terendah (dasar).</p>
          </div>
        {/if}
      </div>

      <div class="p-6 rounded-xl bg-surface-container border border-error/20 relative overflow-hidden {formUseAutotune ? 'opacity-50 pointer-events-none' : ''}">
        <div class="absolute -left-6 -top-6 w-32 h-32 bg-error/5 rounded-full blur-2xl"></div>
        
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-body-lg font-bold text-error flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">radar</span>
              Whale Radar (Orderbook Anti-Bandar)
              <span class="px-2 py-0.5 rounded text-[9px] bg-error/20 text-error uppercase font-bold tracking-wider">
                Fase 3
              </span>
            </h4>
            <p class="text-sm text-on-surface-variant mt-1">
              Pantau Orderbook sedalam 2% ke atas. Jika volume Tembok Jual 3x lipat lebih besar dari Beli, bot akan menolak membeli.
            </p>
          </div>
          
          <button 
            class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {formUseWhaleRadar ? 'bg-error' : 'bg-surface-container-high border border-white/20'}"
            onclick={() => formUseWhaleRadar = !formUseWhaleRadar}
          >
            <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 shadow-sm {formUseWhaleRadar ? 'translate-x-6 bg-black' : 'translate-x-0 bg-on-surface-variant'}"></span>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-10 flex justify-between items-center">
      <button onclick={() => deleteCoin(selectedCoin)} class="flex items-center gap-2 text-error hover:text-error/80 px-4 py-2 rounded-xl transition-colors font-semibold">
        <span class="material-symbols-outlined text-[20px]">delete</span>
        Hapus Koin
      </button>
      <div class="flex gap-4">
        <button onclick={() => showModal = false} class="px-8 py-4 rounded-full text-lg text-on-surface hover:bg-white/5 transition-colors font-semibold">
          Batal
        </button>
        <button onclick={saveSettings} class="px-8 py-4 rounded-full bg-primary text-black text-lg hover:bg-primary-hover font-bold transition-all shadow-[0_0_20px_rgba(78,222,163,0.4)]">
          Simpan Pengaturan
        </button>
      </div>
    </div>
  </div>
</div>
{/if}
