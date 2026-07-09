<script>
  import { onMount } from 'svelte';
  let { coin } = $props();

  let history = $state([]);
  let loading = $state(true);
  let filterType = $state('All');

  let filteredHistory = $derived(
    filterType === 'All'
      ? history
      : history.filter(h => h.action === filterType.toUpperCase())
  );

  onMount(async () => {
    try {
      const symbolPath = coin.symbol.replace('/', '%2F');
      const response = await fetch(`/api/history/${symbolPath}`);
      history = await response.json();
    } catch (e) {
      console.error('Gagal memuat riwayat:', e);
    } finally {
      loading = false;
    }
  });
</script>

<div class="space-y-4">
  <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
    <div>
      <h2 class="text-headline-md text-on-surface">Transaction History</h2>
      <p class="text-on-surface-variant text-body-sm mt-1">Review all automated execution logs for {coin.symbol}.</p>
    </div>
  </div>

  <!-- Filter Bar -->
  <div class="glass p-4 rounded-xl flex flex-wrap gap-4 items-center">
    <div class="flex flex-col gap-1">
      <span class="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold ml-1">Type</span>
      <div class="flex bg-surface-container-lowest p-1 rounded-lg border border-white/5">
        {#each ['All', 'Buy', 'Sell'] as type}
          <button
            class="px-4 py-1.5 rounded-md text-xs font-bold transition-colors
              {filterType === type
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:text-on-surface'}"
            onclick={() => filterType = type}
          >{type}</button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="glass rounded-xl overflow-hidden border border-white/10">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr class="bg-surface-container-high border-b border-white/10">
            <th class="px-4 py-4 text-label-mono text-on-surface-variant uppercase tracking-wider">Date / Time</th>
            <th class="px-4 py-4 text-label-mono text-on-surface-variant uppercase tracking-wider">Type</th>
            <th class="px-4 py-4 text-label-mono text-on-surface-variant uppercase tracking-wider">Pair</th>
            <th class="px-4 py-4 text-label-mono text-on-surface-variant uppercase tracking-wider text-right">Execution Price</th>
            <th class="px-4 py-4 text-label-mono text-on-surface-variant uppercase tracking-wider text-right">Nominal</th>
            <th class="px-4 py-4 text-label-mono text-on-surface-variant uppercase tracking-wider text-center">PnL</th>
            <th class="px-4 py-4 text-label-mono text-on-surface-variant uppercase tracking-wider text-center">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          {#if loading}
            {#each Array(5) as _}
              <tr class="zebra-stripe">
                <td class="px-4 py-4"><div class="h-4 w-24 bg-white/5 rounded animate-pulse"></div></td>
                <td class="px-4 py-4"><div class="h-6 w-12 bg-white/5 rounded animate-pulse"></div></td>
                <td class="px-4 py-4"><div class="h-4 w-20 bg-white/5 rounded animate-pulse"></div></td>
                <td class="px-4 py-4"><div class="h-4 w-20 bg-white/5 rounded animate-pulse ml-auto"></div></td>
                <td class="px-4 py-4"><div class="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto"></div></td>
                <td class="px-4 py-4"><div class="h-4 w-16 bg-white/5 rounded animate-pulse mx-auto"></div></td>
                <td class="px-4 py-4"><div class="h-6 w-20 bg-white/5 rounded-full animate-pulse mx-auto"></div></td>
              </tr>
            {/each}
          {:else if filteredHistory.length === 0}
            <tr>
              <td colspan="7" class="px-4 py-12 text-center text-on-surface-variant">
                Belum ada transaksi untuk {coin.symbol}.
              </td>
            </tr>
          {:else}
            {#each filteredHistory as h (h.id)}
              <tr class="zebra-stripe transition-colors group">
                <td class="px-4 py-4">
                  <div class="text-data-numeric text-on-surface">
                    {h.timestamp ? new Date(h.timestamp).toLocaleDateString('id-ID') : '-'}
                  </div>
                  <div class="text-label-mono text-[10px] text-on-surface-variant">
                    {h.timestamp ? new Date(h.timestamp).toLocaleTimeString('id-ID') : ''} WIB
                  </div>
                </td>
                <td class="px-4 py-4">
                  {#if h.action === 'BUY'}
                    <span class="text-xs font-bold py-1 px-2.5 rounded bg-primary/10 text-primary border border-primary/20">BUY</span>
                  {:else}
                    <span class="text-xs font-bold py-1 px-2.5 rounded bg-secondary-container/10 text-secondary border border-secondary/20">SELL</span>
                  {/if}
                </td>
                <td class="px-4 py-4">
                  <span class="text-data-numeric text-on-surface">{h.symbol}</span>
                </td>
                <td class="px-4 py-4 text-right">
                  <span class="text-data-numeric text-on-surface">Rp {h.price?.toLocaleString('id-ID')}</span>
                </td>
                <td class="px-4 py-4 text-right">
                  <div class="text-data-numeric">{h.nominal}</div>
                </td>
                <td class="px-4 py-4 text-center">
                  {#if h.action === 'SELL' && h.pnl_pct != null}
                    {#if h.pnl_pct >= 0}
                      <span class="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                        <span class="material-symbols-outlined text-[14px]">trending_up</span>
                        +{h.pnl_pct.toFixed(2)}%
                      </span>
                    {:else}
                      <span class="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold">
                        <span class="material-symbols-outlined text-[14px]">trending_down</span>
                        {h.pnl_pct.toFixed(2)}%
                      </span>
                    {/if}
                  {:else}
                    <span class="text-on-surface-variant text-xs">-</span>
                  {/if}
                </td>
                <td class="px-4 py-4">
                  <div class="flex justify-center">
                    <span class="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                      <span class="material-symbols-outlined text-[14px]">check_circle</span>
                      Filled
                    </span>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
    <div class="px-4 py-3 bg-surface-container-low border-t border-white/10 flex items-center justify-between">
      <div class="text-body-sm text-on-surface-variant">
        Menampilkan <span class="font-bold text-on-surface">{filteredHistory.length}</span> transaksi
      </div>
      <div class="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span> System Online</span>
      </div>
    </div>
  </div>
</div>
