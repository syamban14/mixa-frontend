<script>
  import { onMount } from 'svelte';
  
  let { coins = [] } = $props();
  
  let selectedSymbol = $state('');
  let initialCapital = $state(1000000);
  let strategy = $state('MA Crossover');
  let useDca = $state(false);
  let dcaMaxOrders = $state(3);
  let dcaStepPct = $state(3.0);
  let useTrailingStop = $state(false);
  let trailingStopPct = $state(2.0);
  
  let isLoading = $state(false);
  let result = $state(null);
  let errorMsg = $state('');
  
  const strategies = ['MA Crossover', 'RSI Breakout', 'Bollinger Bands', 'Grid Trading'];
  
  onMount(() => {
    if (coins.length > 0) {
      selectedSymbol = coins[0].symbol;
    } else {
      selectedSymbol = 'BTC/IDR';
    }
  });

  async function runBacktest() {
    isLoading = true;
    errorMsg = '';
    result = null;
    
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          timeframe: "15",
          strategy: strategy,
          initial_capital: initialCapital,
          use_dca: useDca,
          dca_max_orders: dcaMaxOrders,
          dca_step_pct: dcaStepPct,
          use_trailing_stop: useTrailingStop,
          trailing_stop_pct: trailingStopPct
        })
      });
      
      if (res.ok) {
        result = await res.json();
      } else {
        const error = await res.json();
        errorMsg = error.detail || 'Gagal menjalankan backtest';
      }
    } catch (e) {
      errorMsg = 'Koneksi ke server terputus.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="glass rounded-xl p-6 lg:p-8">
  <div class="mb-8">
    <h2 class="text-headline-sm flex items-center gap-2 mb-2">
      <span class="material-symbols-outlined text-tertiary">science</span>
      Laboratorium Backtest
    </h2>
    <p class="text-on-surface-variant text-body-md">
      Simulasikan strategi bot dengan 1000 data candle masa lalu. Uji strategi Anda tanpa risiko sebelum mempertaruhkan modal sungguhan!
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Panel Kiri: Konfigurasi -->
    <div class="lg:col-span-1 space-y-6">
      <div class="space-y-4">
        <div>
          <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Pilih Koin</label>
          <select bind:value={selectedSymbol} class="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary cursor-pointer font-bold">
            {#if coins.length === 0}
              <option value="BTC/IDR">BTC/IDR</option>
              <option value="PEPE/IDR">PEPE/IDR</option>
            {/if}
            {#each coins as coin}
              <option value={coin.symbol}>{coin.symbol}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Modal Simulasi (Rp)</label>
          <input type="number" bind:value={initialCapital} class="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary font-mono" />
        </div>
        
        <div>
          <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Strategi Inti</label>
          <select bind:value={strategy} class="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary cursor-pointer">
            {#each strategies as strat}
              <option value={strat}>{strat}</option>
            {/each}
          </select>
        </div>
        
        <!-- Toggle DCA -->
        <div class="pt-4 border-t border-white/10">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider">Gunakan DCA</label>
            <button class="relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {useDca ? 'bg-secondary' : 'bg-surface-container-high border border-white/20'}" onclick={() => useDca = !useDca}>
              <span class="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm {useDca ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>
          {#if useDca}
            <div class="grid grid-cols-2 gap-2 mt-2 animate-in fade-in">
              <div>
                <label class="text-[10px] text-on-surface-variant">Max Orders</label>
                <input type="number" bind:value={dcaMaxOrders} class="w-full bg-black/20 border border-secondary/30 rounded px-2 py-1 text-sm text-secondary focus:outline-none" />
              </div>
              <div>
                <label class="text-[10px] text-on-surface-variant">Step (%)</label>
                <input type="number" step="0.1" bind:value={dcaStepPct} class="w-full bg-black/20 border border-secondary/30 rounded px-2 py-1 text-sm text-secondary focus:outline-none" />
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Toggle Trailing Stop -->
        <div class="pt-4 border-t border-white/10">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider">Trailing Stop Loss</label>
            <button class="relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none shrink-0 {useTrailingStop ? 'bg-primary' : 'bg-surface-container-high border border-white/20'}" onclick={() => useTrailingStop = !useTrailingStop}>
              <span class="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm {useTrailingStop ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>
          {#if useTrailingStop}
            <div class="mt-2 animate-in fade-in">
              <label class="text-[10px] text-on-surface-variant">Drop dari Puncak (%)</label>
              <input type="number" step="0.1" bind:value={trailingStopPct} class="w-full bg-black/20 border border-primary/30 rounded px-2 py-1 text-sm text-primary focus:outline-none" />
            </div>
          {/if}
        </div>
      </div>
      
      <button 
        onclick={runBacktest} 
        disabled={isLoading}
        class="w-full bg-tertiary text-black px-6 py-4 rounded-xl font-bold text-lg hover:bg-tertiary/90 transition-all shadow-[0_0_15px_rgba(203,166,247,0.3)] hover:shadow-[0_0_25px_rgba(203,166,247,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {#if isLoading}
          <span class="material-symbols-outlined animate-spin">refresh</span>
          Memutar Waktu...
        {:else}
          <span class="material-symbols-outlined">rocket_launch</span>
          Mulai Simulasi
        {/if}
      </button>
      
      {#if errorMsg}
        <div class="bg-error/20 text-error p-3 rounded-lg text-sm flex items-start gap-2">
          <span class="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      {/if}
    </div>
    
    <!-- Panel Kanan: Hasil Analisis -->
    <div class="lg:col-span-2">
      {#if isLoading}
        <div class="h-full min-h-[400px] flex flex-col items-center justify-center bg-surface-container-low rounded-xl border border-white/5">
          <div class="relative w-24 h-24 mb-4">
            <div class="absolute inset-0 border-4 border-tertiary/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-tertiary rounded-full border-t-transparent animate-spin"></div>
            <span class="absolute inset-0 flex items-center justify-center material-symbols-outlined text-tertiary text-3xl">hourglass_bottom</span>
          </div>
          <p class="text-tertiary font-bold animate-pulse text-lg">Menganalisis 1000 Candle Historis...</p>
          <p class="text-on-surface-variant text-sm mt-2">Ini mungkin memakan waktu beberapa detik</p>
        </div>
      {:else if result}
        <div class="bg-surface-container-low rounded-xl border border-white/5 p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <h3 class="text-title-lg font-bold mb-6 flex items-center gap-2 text-tertiary">
            <span class="material-symbols-outlined">analytics</span> Laporan Performa Bot
          </h3>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div class="bg-surface-container p-4 rounded-xl">
              <p class="text-label-mono text-on-surface-variant mb-1">Modal Awal</p>
              <p class="text-title-md font-mono">Rp {result.initial_capital.toLocaleString('id-ID')}</p>
            </div>
            <div class="bg-surface-container p-4 rounded-xl border {result.net_profit_pct >= 0 ? 'border-primary/30' : 'border-error/30'}">
              <p class="text-label-mono text-on-surface-variant mb-1">Saldo Akhir</p>
              <p class="text-title-md font-mono font-bold {result.net_profit_pct >= 0 ? 'text-primary' : 'text-error'}">Rp {result.final_balance.toLocaleString('id-ID', {maximumFractionDigits: 0})}</p>
            </div>
            <div class="bg-surface-container p-4 rounded-xl">
              <p class="text-label-mono text-on-surface-variant mb-1">Net Profit (%)</p>
              <p class="text-title-lg font-bold {result.net_profit_pct >= 0 ? 'text-primary' : 'text-error'}">{result.net_profit_pct >= 0 ? '+' : ''}{result.net_profit_pct.toFixed(2)}%</p>
            </div>
            <div class="bg-surface-container p-4 rounded-xl">
              <p class="text-label-mono text-on-surface-variant mb-1">Win Rate</p>
              <p class="text-title-lg font-bold text-secondary">{result.win_rate.toFixed(1)}%</p>
              <p class="text-xs text-on-surface-variant">Dari {result.total_trades} trade (Sell)</p>
            </div>
          </div>
          
          <h4 class="font-bold text-on-surface-variant mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">history</span> Riwayat Eksekusi
          </h4>
          
          {#if result.trades.length > 0}
            <div class="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              <div class="space-y-2">
                {#each result.trades.slice().reverse() as trade}
                  <div class="flex items-center justify-between p-3 bg-surface-container rounded-lg border-l-4 {trade.type.includes('BUY') || trade.type.includes('DCA') ? 'border-l-secondary bg-secondary/5' : 'border-l-primary bg-primary/5'}">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-sm {trade.type.includes('BUY') || trade.type.includes('DCA') ? 'text-secondary' : 'text-primary'}">{trade.type}</span>
                        <span class="text-xs text-on-surface-variant bg-black/30 px-2 py-0.5 rounded">{trade.time}</span>
                      </div>
                      <div class="text-sm mt-1">Harga: Rp {trade.price.toLocaleString('id-ID', {maximumFractionDigits: 2})}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-mono text-sm">Rp {trade.amount.toLocaleString('id-ID', {maximumFractionDigits: 0})}</div>
                      {#if trade.pnl !== null}
                        <div class="text-xs font-bold mt-1 {trade.pnl >= 0 ? 'text-primary' : 'text-error'}">
                          {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
                        </div>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <div class="text-center p-8 bg-surface-container rounded-xl text-on-surface-variant border border-white/5 border-dashed">
              <span class="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
              <p>Tidak ada eksekusi trade dalam periode ini berdasarkan strategi.</p>
            </div>
          {/if}
        </div>
      {:else}
        <div class="h-full min-h-[400px] flex flex-col items-center justify-center bg-surface-container-low rounded-xl border border-white/5 border-dashed text-on-surface-variant p-8">
          <span class="material-symbols-outlined text-[64px] mb-4 opacity-50">monitoring</span>
          <h3 class="text-title-md font-bold text-on-surface text-center">Area Hasil Backtest</h3>
          <p class="text-sm w-full max-w-2xl text-center mt-3 leading-relaxed">
            Pilih konfigurasi Anda di panel sebelah kiri dan jalankan simulasi untuk melihat grafik keuntungan, win rate, dan riwayat pesanan (order history).
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
