<script>
  import { onMount } from 'svelte';
  import Sidebar from './lib/Sidebar.svelte';
  import TopNav from './lib/TopNav.svelte';
  import Dashboard from './lib/Dashboard.svelte';
  import History from './lib/History.svelte';
  import Management from './lib/Management.svelte';
  import Config from './lib/Config.svelte';

  let states = $state([]);
  let loading = $state(true);
  let activeCoinIndex = $state(0);
  let activePage = $state('dashboard');

  async function fetchStatus() {
    try {
      const response = await fetch('/api/status');
      states = await response.json();
    } catch (e) {
      console.error('Gagal terhubung ke FastAPI backend', e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  });
</script>

<div class="flex min-h-screen">
  <Sidebar bind:activePage />

  <main class="flex-1 ml-64 min-h-screen flex flex-col">
    <TopNav coins={states} bind:activeCoinIndex />

    <div class="mt-16 p-6 space-y-4 flex-1">
      {#if loading}
        <div class="flex flex-col items-center justify-center h-[60vh]">
          <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <h2 class="text-headline-md text-on-surface">Menghubungkan ke Mesin Utama...</h2>
          <p class="text-on-surface-variant mt-2">Pastikan FastAPI berjalan di <code class="text-primary">port 8000</code></p>
        </div>
      {:else if states.length === 0}
        <div class="glass rounded-xl p-8 flex flex-col items-center justify-center h-[60vh]">
          <span class="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">database</span>
          <h2 class="text-headline-md text-on-surface">Database Kosong</h2>
          <p class="text-on-surface-variant mt-2">Jalankan <code class="text-primary">python main.py</code> terlebih dahulu.</p>
        </div>
      {:else}
        {#key `${activePage}-${states[activeCoinIndex]?.symbol}`}
          {#if activePage === 'dashboard'}
            <Dashboard coin={states[activeCoinIndex]} coins={states} />
          {:else if activePage === 'history'}
            <History coin={states[activeCoinIndex]} />
          {:else if activePage === 'management'}
            <Management coins={states} />
          {:else if activePage === 'config'}
            <Config />
          {/if}
        {/key}

        <div class="flex items-center justify-between px-2 pt-4 opacity-50">
          <div class="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span> System Online</span>
            <span>Exchange: Indodax</span>
            <span>API Status: Stable</span>
          </div>
          <div class="text-[10px] text-right">
            Last sync: {states[activeCoinIndex]?.last_update
              ? new Date(states[activeCoinIndex].last_update).toLocaleString('id-ID')
              : '-'} WIB
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>
