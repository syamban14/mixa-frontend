<script>
  import { onMount } from 'svelte';
  import { createChart, CandlestickSeries } from 'lightweight-charts';

  let { coin, coins = [] } = $props();

  let chartContainer = $state(null);
  let chart;
  let candleSeries;
  let initialBalance = $state(0);

  // P&L per Koin
  let pnlPct = $derived(
    coin?.entry_price > 0
      ? ((coin.current_price - coin.entry_price) / coin.entry_price) * 100
      : 0
  );

  // Global Portfolio
  let totalAsset = $derived.by(() => {
    if (!coins || coins.length === 0) return 0;
    let idr = coins[0].balances?.IDR || 0;
    let cryptoValue = 0;
    for (const c of coins) {
      const koin_utama = c.symbol.split('/')[0];
      const crypto_amt = c.balances?.[koin_utama] || 0;
      cryptoValue += crypto_amt * c.current_price;
    }
    return idr + cryptoValue;
  });

  let globalPnlPct = $derived(
    initialBalance > 0 
      ? ((totalAsset - initialBalance) / initialBalance) * 100 
      : 0
  );

  let globalPnlIdr = $derived(
    totalAsset - initialBalance
  );

  // Saldo Koin Spesifik
  let specificCoinBalance = $derived.by(() => {
    if (!coin || !coin.balances) return 0;
    const koin_utama = coin.symbol.split('/')[0];
    return coin.balances[koin_utama] || 0;
  });

  // Saldo IDR
  let idrBalance = $derived.by(() => {
    if (!coin || !coin.balances) return 0;
    return coin.balances['IDR'] || 0;
  });

  let coinPnlIdr = $derived(
    coin?.entry_price > 0 && specificCoinBalance > 0
      ? (specificCoinBalance * coin.entry_price) * (pnlPct / 100)
      : 0
  );

  onMount(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        initialBalance = data.initial_balance || 0;
      }
    } catch (e) {
      console.error(e);
    }
    if (!chartContainer) return;

    // === LIGHTWEIGHT CHARTS v5 INIT ===
    chart = createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: 300,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#dae2fd',
        fontFamily: "'Geist', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#4edea3', width: 1, style: 2, labelBackgroundColor: '#171f33' },
        horzLine: { color: '#4edea3', width: 1, style: 2, labelBackgroundColor: '#171f33' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255,255,255,0.05)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.05)',
      },
    });

    // v5: addSeries(CandlestickSeries, options)
    candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4edea3',
      downColor: '#ffb3ad',
      borderVisible: false,
      wickUpColor: '#4edea3',
      wickDownColor: '#ffb3ad',
    });

    // Fetch OHLCV data dari FastAPI
    try {
      const symbolPath = coin.symbol.replace('/', '%2F');
      const response = await fetch(`/api/chart/${symbolPath}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const chartData = data
          .map(d => {
            // Timestamp dari database sudah dalam bentuk WIB.
            // Agar chart menampilkan waktu WIB, kita parse seolah-olah itu UTC (tambahkan 'Z')
            // sehingga Lightweight Charts (yang default-nya merender dalam UTC)
            // akan merender angka jam/menit persis seperti di database.
            const isoString = d.timestamp.replace(' ', 'T') + 'Z';
            const ts = Math.floor(new Date(isoString).getTime() / 1000);
            return { time: ts, open: d.open, high: d.high, low: d.low, close: d.close };
          })
          .sort((a, b) => a.time - b.time);

        candleSeries.setData(chartData);
        chart.timeScale().fitContent();
      }
    } catch (e) {
      console.error('Gagal memuat data chart:', e);
    }

    const handleResize = () => chart.applyOptions({ width: chartContainer.clientWidth });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  });
</script>

<!-- STITCH LAYOUT: 12-col Bento Grid -->
<div class="grid grid-cols-12 gap-4">
  <!-- Summary Card (4 cols) -->
  <div class="col-span-12 lg:col-span-4 glass rounded-xl p-5 flex flex-col justify-between overflow-hidden relative group">
    
    {#if coin?.cooldown_remaining_minutes > 0}
      <div class="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pointer-events-none">
        <div class="bg-secondary/10 border-[3px] border-secondary text-secondary px-6 py-3 rounded-xl transform -rotate-12 shadow-[0_0_20px_rgba(var(--color-secondary),0.3)] backdrop-blur-md flex flex-col items-center">
           <span class="font-black text-2xl tracking-widest uppercase">REHAT BELI</span>
           <span class="text-sm font-bold mt-1">Sisa: {coin.cooldown_remaining_minutes} Menit</span>
        </div>
      </div>
    {/if}

    <div class="relative z-10">
      <div class="flex justify-between items-start mb-4">
        <p class="text-label-mono text-on-surface-variant uppercase tracking-wider">Total Aset Portfolio</p>
        <span class="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
      </div>
      <h2 class="text-[32px] font-black text-on-surface font-sans">
        Rp {totalAsset.toLocaleString('id-ID')}
      </h2>
      
      <div class="flex flex-col gap-3 mt-4">
        <div class="grid grid-cols-2 gap-2 text-[12px] bg-black/20 p-3 rounded-lg border border-white/5">
          <div>
            <span class="text-on-surface-variant block mb-1">Modal Awal</span>
            <span class="font-bold">Rp {initialBalance.toLocaleString('id-ID')}</span>
          </div>
          <div>
            <span class="text-on-surface-variant block mb-1">Sisa Saldo IDR</span>
            <span class="font-bold text-primary">Rp {idrBalance.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-[12px] bg-black/20 p-3 rounded-lg border border-white/5">
          <div>
            <span class="text-on-surface-variant block mb-1">Harga Beli (Entry)</span>
            <span class="font-bold text-tertiary">
              {specificCoinBalance > 0 && coin.entry_price > 0 ? 'Rp ' + coin.entry_price.toLocaleString('id-ID') : '-'}
            </span>
          </div>
          <div>
            <span class="text-on-surface-variant block mb-1">Saldo Koin ({coin.symbol.split('/')[0]})</span>
            <span class="font-bold text-tertiary">{specificCoinBalance > 0 ? specificCoinBalance : '-'}</span>
          </div>
        </div>

        <div class="flex flex-col gap-4 mt-2">
          <!-- Global PnL -->
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <span class="text-on-surface-variant text-[12px]">Global P&L</span>
            <div class="flex items-center gap-2">
              {#if globalPnlPct >= 0}
                <span class="text-[12px] font-bold text-primary">
                  +Rp {globalPnlIdr.toLocaleString('id-ID')}
                </span>
                <span class="flex items-center text-primary bg-primary/10 px-2 py-0.5 rounded text-[12px] font-bold">
                  <span class="material-symbols-outlined text-[14px]">public</span>
                  +{globalPnlPct.toFixed(2)}%
                </span>
              {:else}
                <span class="text-[12px] font-bold text-secondary">
                  Rp {globalPnlIdr.toLocaleString('id-ID')}
                </span>
                <span class="flex items-center text-secondary bg-secondary/10 px-2 py-0.5 rounded text-[12px] font-bold">
                  <span class="material-symbols-outlined text-[14px]">public</span>
                  {globalPnlPct.toFixed(2)}%
                </span>
              {/if}
            </div>
          </div>

          <!-- Specific Coin PnL -->
          <div class="flex items-center justify-between">
            <span class="text-on-surface-variant text-[12px]">{coin.symbol.split('/')[0]} P&L</span>
            <div class="flex items-center gap-2">
              {#if coin.entry_price > 0}
                {#if pnlPct >= 0}
                  <span class="text-[12px] font-bold text-primary">
                    +Rp {coinPnlIdr.toLocaleString('id-ID')}
                  </span>
                  <span class="flex items-center text-primary bg-primary/10 px-2 py-0.5 rounded text-[12px] font-bold">
                    <span class="material-symbols-outlined text-[14px]">trending_up</span>
                    +{pnlPct.toFixed(2)}%
                  </span>
                {:else}
                  <span class="text-[12px] font-bold text-secondary">
                    Rp {coinPnlIdr.toLocaleString('id-ID')}
                  </span>
                  <span class="flex items-center text-secondary bg-secondary/10 px-2 py-0.5 rounded text-[12px] font-bold">
                    <span class="material-symbols-outlined text-[14px]">trending_down</span>
                    {pnlPct.toFixed(2)}%
                  </span>
                {/if}
              {:else}
                <span class="flex items-center text-on-surface-variant bg-on-surface-variant/10 px-2 py-0.5 rounded text-[12px] font-bold">
                  -
                </span>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-6 flex justify-between items-center relative z-10">
      <div class="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/5">
        <p class="text-[10px] text-on-surface-variant font-bold uppercase">Sinyal</p>
        <p class="text-data-numeric text-lg {coin.signal === 'BUY' ? 'text-primary' : coin.signal === 'SELL' ? 'text-secondary' : 'text-on-surface'}">{coin.signal || 'HOLD'}</p>
      </div>
      <div class="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/5">
        <p class="text-[10px] text-on-surface-variant font-bold uppercase">Mode</p>
        <p class="text-data-numeric text-lg">{coin.mode || 'AUTO'}</p>
      </div>
      <div class="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/5">
        <p class="text-[10px] text-on-surface-variant font-bold uppercase">Pair</p>
        <p class="text-data-numeric text-lg text-primary">{coin.symbol}</p>
      </div>
    </div>
  </div>

  <!-- Main Chart (8 cols) -->
  <div class="col-span-12 lg:col-span-8 glass rounded-xl p-5 flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-headline-sm">Candlestick Chart</h3>
        <p class="text-xs text-on-surface-variant">Real-time {coin.symbol} price action (15M)</p>
      </div>
    </div>
    <div bind:this={chartContainer} class="w-full h-[300px]"></div>
  </div>
</div>

<!-- MIXA AI Insight Section -->
<div class="grid grid-cols-12 gap-4 mt-4">
  <div class="col-span-12 lg:col-span-9 space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-headline-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">smart_toy</span>
        Analisis MIXA AI
      </h3>
    </div>
    <div class="glass rounded-xl p-5 border-t-2 border-primary">
      <p class="text-body-md leading-relaxed">{coin.mixa_insight || 'Menunggu inisialisasi MIXA AI...'}</p>
    </div>
  </div>

  <div class="col-span-12 lg:col-span-3">
    <div class="glass rounded-xl p-5 h-full flex flex-col">
      <h3 class="text-headline-sm mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-secondary">insights</span>
        Status
      </h3>
      <div class="space-y-4 flex-1">
        <div class="p-3 bg-surface-container rounded-lg border border-white/5">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-bold leading-none text-sm">Pembaruan</p>
              <p class="text-[10px] text-on-surface-variant text-label-mono mt-1">
                {coin.last_update ? new Date(coin.last_update).toLocaleString('id-ID') : '-'}
              </p>
            </div>
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          </div>
        </div>
        <div class="p-3 bg-surface-container rounded-lg border border-white/5">
          <p class="text-[10px] text-on-surface-variant uppercase mb-1">Harga Entry</p>
          <p class="text-data-numeric">
            {coin.entry_price > 0 ? 'Rp ' + coin.entry_price.toLocaleString('id-ID') : 'Standby'}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
