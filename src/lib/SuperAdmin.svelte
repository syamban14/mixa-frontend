<script>
  import { onMount } from 'svelte';

  let data = $state({
    total_users: 0,
    active_users: 0,
    total_volume: 0,
    leaderboard: [],
    server: { cpu: 0, ram: 0 }
  });
  
  let isLoading = $state(true);
  let error = $state(null);

  onMount(async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        data = await res.json();
      } else {
        error = "Gagal memuat data dashboard super admin.";
      }
    } catch (e) {
      error = "Koneksi ke server terputus.";
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="glass rounded-xl p-6 lg:p-8">
  <div class="mb-8">
    <h2 class="text-headline-md font-bold flex items-center gap-2 text-primary">
      <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
      Super Admin Dashboard
    </h2>
    <p class="text-on-surface-variant text-body-md mt-2">
      Pantau performa bisnis SaaS Anda, pertumbuhan pengguna, dan status server.
    </p>
  </div>

  {#if isLoading}
    <div class="flex justify-center items-center py-20">
      <span class="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
    </div>
  {:else if error}
    <div class="bg-error/20 border border-error/50 rounded-xl p-6 text-center text-error">
      {error}
    </div>
  {:else}
    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Users -->
      <div class="bg-surface-container border border-white/5 rounded-xl p-6 relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 text-primary/10 group-hover:text-primary/20 transition-colors">
          <span class="material-symbols-outlined" style="font-size: 120px;">group</span>
        </div>
        <p class="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Total Users</p>
        <p class="text-4xl font-bold text-white relative z-10">{data.total_users}</p>
      </div>

      <!-- Active Users -->
      <div class="bg-surface-container border border-white/5 rounded-xl p-6 relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 text-secondary/10 group-hover:text-secondary/20 transition-colors">
          <span class="material-symbols-outlined" style="font-size: 120px;">monitoring</span>
        </div>
        <p class="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Active Trading Users</p>
        <p class="text-4xl font-bold text-secondary relative z-10">{data.active_users}</p>
      </div>

      <!-- Trading Volume -->
      <div class="bg-surface-container border border-white/5 rounded-xl p-6 relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 text-[#4edea3]/10 group-hover:text-[#4edea3]/20 transition-colors">
          <span class="material-symbols-outlined" style="font-size: 120px;">payments</span>
        </div>
        <p class="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Total Trading Volume (IDR)</p>
        <p class="text-2xl font-bold text-[#4edea3] relative z-10 mt-2">Rp {data.total_volume.toLocaleString('id-ID')}</p>
      </div>

      <!-- Server Health -->
      <div class="bg-surface-container border border-white/5 rounded-xl p-6 relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 text-tertiary/10 group-hover:text-tertiary/20 transition-colors">
          <span class="material-symbols-outlined" style="font-size: 120px;">dns</span>
        </div>
        <p class="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-4 relative z-10">Server Status</p>
        
        <div class="space-y-3 relative z-10">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-on-surface">CPU Usage</span>
              <span class="font-mono {data.server.cpu > 80 ? 'text-error' : 'text-tertiary'}">{data.server.cpu}%</span>
            </div>
            <div class="w-full bg-black/40 rounded-full h-1.5">
              <div class="h-1.5 rounded-full {data.server.cpu > 80 ? 'bg-error' : 'bg-tertiary'}" style="width: {data.server.cpu}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-on-surface">RAM Usage</span>
              <span class="font-mono {data.server.ram > 80 ? 'text-error' : 'text-tertiary'}">{data.server.ram}%</span>
            </div>
            <div class="w-full bg-black/40 rounded-full h-1.5">
              <div class="h-1.5 rounded-full {data.server.ram > 80 ? 'bg-error' : 'bg-tertiary'}" style="width: {data.server.ram}%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="bg-surface-container border border-white/5 rounded-xl overflow-hidden">
      <div class="px-6 py-5 border-b border-white/10 bg-white/5 flex items-center gap-3">
        <span class="material-symbols-outlined text-[#f3c22b]">workspace_premium</span>
        <h3 class="font-bold text-lg">Top 10 Pengguna (Berdasarkan Profit)</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/10 bg-black/20">
              <th class="p-4 text-on-surface-variant font-bold text-sm tracking-wider uppercase">Rank</th>
              <th class="p-4 text-on-surface-variant font-bold text-sm tracking-wider uppercase">User</th>
              <th class="p-4 text-on-surface-variant font-bold text-sm tracking-wider uppercase">Email</th>
              <th class="p-4 text-on-surface-variant font-bold text-sm tracking-wider uppercase">Trades</th>
              <th class="p-4 text-on-surface-variant font-bold text-sm tracking-wider uppercase">Total PnL (%)</th>
            </tr>
          </thead>
          <tbody>
            {#if data.leaderboard.length === 0}
              <tr>
                <td colspan="5" class="p-8 text-center text-on-surface-variant">Belum ada data history trading.</td>
              </tr>
            {:else}
              {#each data.leaderboard as user, i}
                <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td class="p-4">
                    {#if i === 0}
                      <span class="material-symbols-outlined text-[#f3c22b]">trophy</span>
                    {:else if i === 1}
                      <span class="material-symbols-outlined text-[#c0c0c0]">trophy</span>
                    {:else if i === 2}
                      <span class="material-symbols-outlined text-[#cd7f32]">trophy</span>
                    {:else}
                      <span class="font-mono text-on-surface-variant w-6 text-center inline-block">{i + 1}</span>
                    {/if}
                  </td>
                  <td class="p-4 font-bold">{user.name}</td>
                  <td class="p-4 text-on-surface-variant">{user.email}</td>
                  <td class="p-4 font-mono">{user.trade_count}</td>
                  <td class="p-4">
                    <span class="font-mono font-bold px-3 py-1 rounded text-xs {user.total_pnl_pct >= 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-error/20 text-error border border-error/30'}">
                      {user.total_pnl_pct > 0 ? '+' : ''}{user.total_pnl_pct.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
