<script>
  import { onMount } from 'svelte';
  import Sidebar from './lib/Sidebar.svelte';
  import TopNav from './lib/TopNav.svelte';
  import Dashboard from './lib/Dashboard.svelte';
  import History from './lib/History.svelte';
  import Management from './lib/Management.svelte';
  import Config from './lib/Config.svelte';
  import Logs from './lib/Logs.svelte';
  import Backtest from './lib/Backtest.svelte';
  import Performance from './lib/Performance.svelte';
  import Login from './lib/Login.svelte';
  import AdminPanel from './lib/AdminPanel.svelte';

  let isAuthenticated = $state(false);

  let states = $state([]);
  let activeStates = $derived(states.filter(c => c.is_active));
  let loading = $state(true);
  let activeCoinIndex = $state(0);
  
  $effect(() => {
    if (activeStates.length > 0 && activeCoinIndex >= activeStates.length) {
      activeCoinIndex = activeStates.length - 1;
    }
  });

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
    // Global fetch interceptor to append Auth token
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      config = config || {};
      
      const token = localStorage.getItem('mixa_token');
      if (token && resource.startsWith('/api/') && resource !== '/api/login') {
        config.headers = { ...config.headers, 'Authorization': `Bearer ${token}` };
      }
      
      const response = await originalFetch(resource, config);
      if (response.status === 401) {
        isAuthenticated = false;
        localStorage.removeItem('mixa_token');
      }
      return response;
    };

    if (localStorage.getItem('mixa_token')) {
      isAuthenticated = true;
    }

    fetchStatus();
    const interval = setInterval(() => {
      if (isAuthenticated) fetchStatus();
    }, 10000);
    return () => clearInterval(interval);
  });
</script>

{#if !isAuthenticated}
  <Login onLogin={() => { isAuthenticated = true; fetchStatus(); }} />
{:else}
  <div class="flex min-h-screen">
    <Sidebar bind:activePage />

    <main class="flex-1 ml-64 min-h-screen flex flex-col">
      <TopNav coins={activeStates} bind:activeCoinIndex bind:activePage />

      <div class="mt-16 p-6 space-y-4 flex-1">
        {#if loading}
          <div class="flex flex-col items-center justify-center h-[60vh]">
            <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <h2 class="text-headline-md text-on-surface">Menghubungkan ke Mesin Utama...</h2>
            <p class="text-on-surface-variant mt-2">Pastikan FastAPI berjalan di <code class="text-primary">port 8000</code></p>
          </div>
        {:else if activePage === 'admin'}
          <AdminPanel />
        {:else if states.length === 0}
          <div class="glass rounded-xl p-8 flex flex-col items-center justify-center h-[60vh]">
            <span class="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">database</span>
            <h2 class="text-headline-md text-on-surface">Database Kosong</h2>
            <p class="text-on-surface-variant mt-2">Jalankan <code class="text-primary">python main.py</code> terlebih dahulu.</p>
          </div>
        {:else if activePage !== 'management' && activeStates.length === 0}
          <div class="glass rounded-xl p-8 flex flex-col items-center justify-center h-[60vh]">
            <span class="material-symbols-outlined text-[64px] text-tertiary mb-4">power_off</span>
            <h2 class="text-headline-md text-on-surface">Tidak Ada Koin Aktif</h2>
            <p class="text-on-surface-variant mt-2">Masuk ke menu <button class="text-primary font-bold hover:underline" onclick={() => activePage = 'management'}>Bot Management</button> untuk mengaktifkan koin.</p>
          </div>
        {:else}
          {#key `${activePage}-${activeStates[activeCoinIndex]?.symbol}`}
            {#if activePage === 'dashboard'}
              <Dashboard coin={activeStates[activeCoinIndex]} coins={activeStates} />
            {:else if activePage === 'history'}
              <History coin={activeStates[activeCoinIndex]} />
            {:else if activePage === 'management'}
              <Management coins={states} />
            {:else if activePage === 'config'}
              <Config />
            {:else if activePage === 'backtest'}
              <Backtest coins={states} />
            {:else if activePage === 'performance'}
              <Performance />
            {:else if activePage === 'logs'}
              <Logs />
            {/if}
          {/key}

          <div class="flex items-center justify-between px-2 pt-4 opacity-50">
            <div class="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
              <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span> System Online</span>
              <span>Exchange: Indodax</span>
              <span>API Status: Stable</span>
            </div>
            <div class="text-[10px] text-right">
              Last sync: {activeStates[activeCoinIndex]?.last_update
                ? new Date(activeStates[activeCoinIndex].last_update).toLocaleString('id-ID')
                : '-'} WIB
            </div>
          </div>
        {/if}
      </div>
    </main>
  </div>
{/if}
