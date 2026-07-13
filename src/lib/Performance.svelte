<script>
  import { onMount } from 'svelte';

  let dailyStats = $state([]);
  let summary = $state({ total_trades: 0, win_rate: 0, overall_pnl_pct: 0 });
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      const res = await fetch('/api/performance');
      if (res.ok) {
        const data = await res.json();
        dailyStats = data.daily_stats;
        summary = data.summary;
      } else {
        error = "Gagal memuat data performa";
      }
    } catch (e) {
      error = "Koneksi ke server terputus";
    } finally {
      loading = false;
    }
  });
</script>

<div class="glass rounded-xl p-6 lg:p-8">
  <div class="mb-8">
    <h2 class="text-headline-sm flex items-center gap-2 mb-2">
      <span class="material-symbols-outlined text-primary">pie_chart</span>
      Portofolio & Performa PnL
    </h2>
    <p class="text-on-surface-variant text-body-md">
      Ringkasan performa riwayat trading riil maupun simulasi (Dry Run) Anda dari waktu ke waktu.
    </p>
  </div>

  {#if loading}
    <div class="h-[400px] flex items-center justify-center">
      <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  {:else if error}
    <div class="bg-error/20 text-error p-4 rounded-lg flex items-center gap-2">
      <span class="material-symbols-outlined">error</span> {error}
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-surface-container rounded-xl p-6 border-l-4 border-primary">
        <p class="text-sm text-on-surface-variant uppercase tracking-widest mb-2 font-bold">Total PnL Akumulasi</p>
        <h3 class="text-headline-md font-mono font-bold {summary.overall_pnl_pct >= 0 ? 'text-primary' : 'text-error'}">
          {summary.overall_pnl_pct >= 0 ? '+' : ''}{summary.overall_pnl_pct.toFixed(2)}%
        </h3>
      </div>
      
      <div class="bg-surface-container rounded-xl p-6 border-l-4 border-secondary">
        <p class="text-sm text-on-surface-variant uppercase tracking-widest mb-2 font-bold">Win Rate Keseluruhan</p>
        <h3 class="text-headline-md font-bold text-secondary">
          {summary.win_rate.toFixed(1)}%
        </h3>
      </div>
      
      <div class="bg-surface-container rounded-xl p-6 border-l-4 border-tertiary">
        <p class="text-sm text-on-surface-variant uppercase tracking-widest mb-2 font-bold">Total Transaksi Selesai</p>
        <h3 class="text-headline-md font-mono text-tertiary">
          {summary.total_trades}
        </h3>
      </div>
    </div>

    <div class="bg-surface-container-low border border-white/5 rounded-xl p-6">
      <h3 class="text-title-md font-bold mb-6 flex items-center gap-2">
        <span class="material-symbols-outlined">calendar_month</span> Performa Harian
      </h3>
      
      {#if dailyStats.length === 0}
        <div class="text-center p-8 text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl mb-2 opacity-50">auto_graph</span>
          <p>Belum ada riwayat penjualan (SELL) yang menghasilkan PnL.</p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each dailyStats.slice().reverse() as day}
            <div class="flex items-center justify-between p-4 bg-surface-container rounded-lg border-l-4 {day.total_pnl_pct >= 0 ? 'border-l-primary' : 'border-l-error'}">
              <div>
                <p class="font-bold text-lg">{day.date}</p>
                <p class="text-sm text-on-surface-variant mt-1">{day.trade_count} Trades ({day.win_count} Win)</p>
              </div>
              <div class="text-right">
                <p class="font-mono text-xl font-bold {day.total_pnl_pct >= 0 ? 'text-primary' : 'text-error'}">
                  {day.total_pnl_pct >= 0 ? '+' : ''}{day.total_pnl_pct.toFixed(2)}%
                </p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
