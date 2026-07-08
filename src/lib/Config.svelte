<script>
  import { onMount } from 'svelte';

  let geminiModel = $state('gemini-2.5-flash');
  let initialBalance = $state(0);
  let isSaving = $state(false);
  let showSuccess = $state(false);

  // Model populer sebagai template cepat
  const popularModels = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-2-5-flash-lite'
  ];

  onMount(async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/config`);
      if (res.ok) {
        const data = await res.json();
        if (data.gemini_model) geminiModel = data.gemini_model;
        if (data.initial_balance !== undefined) initialBalance = data.initial_balance;
      }
    } catch (e) {
      console.error('Gagal mengambil konfigurasi:', e);
    }
  });

  async function saveConfig() {
    isSaving = true;
    showSuccess = false;
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gemini_model: geminiModel, initial_balance: initialBalance })
      });
      if (res.ok) {
        showSuccess = true;
        setTimeout(() => showSuccess = false, 3000);
      }
    } catch (e) {
      console.error('Gagal menyimpan konfigurasi:', e);
      alert('Gagal menyimpan konfigurasi, pastikan backend berjalan.');
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="glass rounded-xl p-6 lg:p-8">
  <div class="mb-6">
    <h2 class="text-headline-sm flex items-center gap-2 mb-2">
      <span class="material-symbols-outlined text-primary">smart_toy</span>
      Konfigurasi MIXA AI
    </h2>
    <p class="text-on-surface-variant text-body-md">
      Atur model AI yang digunakan oleh sistem analisis pasar otomatis.
    </p>
  </div>

  <div class="space-y-6 max-w-2xl">
    <div class="p-4 bg-surface-container rounded-lg border border-white/5 relative">
      <div class="space-y-4">
        <div>
          <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Modal Awal (Rp)</label>
          <input 
            type="number" 
            bind:value={initialBalance} 
            class="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm"
            placeholder="Misal: 1000000"
          />
        </div>
        <div>
          <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Model Gemini Aktif</label>
          <div class="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              bind:value={geminiModel} 
              class="flex-1 bg-background border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm"
              placeholder="Misal: gemini-2.5-flash"
            />
            
            <button 
              onclick={saveConfig} 
              disabled={isSaving}
              class="bg-primary text-background px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50"
            >
              {#if isSaving}
                <span class="material-symbols-outlined animate-spin">refresh</span>
                Menyimpan...
              {:else}
                <span class="material-symbols-outlined">save</span>
                Simpan
              {/if}
            </button>
          </div>
        </div>
      </div>

      {#if showSuccess}
        <div class="absolute -top-3 right-4 bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30 px-3 py-1 rounded text-xs font-bold animate-pulse">
          Berhasil Disimpan!
        </div>
      {/if}
    </div>

    <div>
      <p class="text-label-mono text-on-surface-variant uppercase tracking-wider mb-3">Model Populer</p>
      <div class="flex flex-wrap gap-2">
        {#each popularModels as m}
          <button 
            onclick={() => geminiModel = m}
            class="px-4 py-2 rounded-full border text-sm font-mono transition-colors {geminiModel === m ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container border-white/10 text-on-surface-variant hover:border-white/30 hover:text-on-surface'}"
          >
            {m}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
