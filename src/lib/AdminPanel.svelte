<script>
  import { onMount } from 'svelte';
  
  let users = $state([]);
  let isLoading = $state(true);
  let errorMsg = $state('');
  
  async function fetchUsers() {
    isLoading = true;
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        users = await res.json();
      } else {
        errorMsg = 'Gagal memuat data user (Pastikan Anda login sebagai Admin)';
      }
    } catch (e) {
      errorMsg = 'Koneksi ke server gagal.';
    } finally {
      isLoading = false;
    }
  }
  
  async function extendSub(email, days) {
    if (!confirm(`Perpanjang langganan ${email} selama ${days} hari?`)) return;
    
    try {
      const res = await fetch('/api/admin/extend-sub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, days })
      });
      
      if (res.ok) {
        alert('Berhasil diperpanjang!');
        fetchUsers();
      } else {
        alert('Gagal memperpanjang');
      }
    } catch (e) {
      alert('Koneksi gagal');
    }
  }
  
  onMount(() => {
    fetchUsers();
  });
  
  function getStatus(user) {
    const now = new Date();
    const end = user.subscription_ends_at ? new Date(user.subscription_ends_at) : (user.trial_ends_at ? new Date(user.trial_ends_at) : new Date(0));
    
    if (end > now) {
      const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return { active: true, text: `Aktif (${daysLeft} Hari)` };
    }
    return { active: false, text: 'Kedaluwarsa' };
  }
</script>

<div class="glass rounded-2xl p-8 border border-white/10 relative overflow-hidden">
  <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
  
  <div class="relative z-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-black text-on-surface font-sans">Admin Panel</h2>
        <p class="text-sm text-on-surface-variant mt-1">Kelola Pengguna & Tagihan SaaS</p>
      </div>
      <button 
        onclick={fetchUsers}
        class="bg-surface-container-high hover:bg-white/10 text-on-surface p-2 rounded-xl transition-all border border-white/5"
        title="Refresh Data"
      >
        <span class="material-symbols-outlined text-[20px] {isLoading ? 'animate-spin' : ''}">refresh</span>
      </button>
    </div>

    {#if errorMsg}
      <div class="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
        <span class="material-symbols-outlined">error</span>
        <p>{errorMsg}</p>
      </div>
    {:else if isLoading}
      <div class="flex justify-center p-12">
        <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="overflow-x-auto rounded-xl border border-white/5">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest border-b border-white/10 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              <th class="p-4">User</th>
              <th class="p-4">Status</th>
              <th class="p-4">Masa Aktif Sampai</th>
              <th class="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-sm bg-surface-container-lowest">
            {#each users as user}
              {@const status = getStatus(user)}
              <tr class="hover:bg-white/5 transition-colors">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    {#if user.picture}
                      <img src={user.picture} alt="Avatar" class="w-8 h-8 rounded-full bg-surface-container-high" referrerpolicy="no-referrer" />
                    {:else}
                      <div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                        <span class="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                      </div>
                    {/if}
                    <div>
                      <div class="font-bold text-on-surface">{user.name || 'Unknown'}</div>
                      <div class="text-[10px] text-on-surface-variant">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 rounded-full text-[10px] font-bold {status.active ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-error/20 text-error border border-error/30'}">
                    {status.text}
                  </span>
                </td>
                <td class="p-4 text-on-surface-variant text-xs">
                  {user.subscription_ends_at ? new Date(user.subscription_ends_at).toLocaleString('id-ID') : 
                   (user.trial_ends_at ? new Date(user.trial_ends_at).toLocaleString('id-ID') + ' (Trial)' : '-')}
                </td>
                <td class="p-4 text-right">
                  <button 
                    onclick={() => extendSub(user.email, 30)}
                    class="bg-primary hover:bg-primary/90 text-background px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-[0_0_10px_rgba(78,222,163,0.2)] flex items-center gap-1 ml-auto"
                  >
                    <span class="material-symbols-outlined text-[14px]">add_circle</span>
                    +30 Hari
                  </button>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="4" class="p-8 text-center text-on-surface-variant text-sm">Belum ada user yang terdaftar.</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
