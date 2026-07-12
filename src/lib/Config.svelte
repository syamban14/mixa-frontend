<script>
  import { onMount } from 'svelte';

  let geminiModel = $state('gemini-2.5-flash');
  let initialBalance = $state(0);
  let telegramToken = $state('');
  let telegramChatId = $state('');
  let isSaving = $state(false);
  let isTesting = $state(false);
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
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.gemini_model) geminiModel = data.gemini_model;
        if (data.initial_balance !== undefined) initialBalance = data.initial_balance;
        if (data.telegram_token) telegramToken = data.telegram_token;
        if (data.telegram_chat_id) telegramChatId = data.telegram_chat_id;
      }
    } catch (e) {
      console.error('Gagal mengambil konfigurasi:', e);
    }
  });

  async function saveConfig() {
    isSaving = true;
    showSuccess = false;
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gemini_model: geminiModel, 
          initial_balance: initialBalance,
          telegram_token: telegramToken,
          telegram_chat_id: telegramChatId
        })
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

  async function testTelegram() {
    isTesting = true;
    try {
      const res = await fetch('/api/config/telegram_test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_token: telegramToken, telegram_chat_id: telegramChatId })
      });
      if (res.ok) {
        alert('Test Ping berhasil terkirim ke Telegram Anda!');
      } else {
        const error = await res.json();
        alert('Gagal: ' + (error.detail || 'Token atau Chat ID tidak valid'));
      }
    } catch (e) {
      alert('Error koneksi saat menguji Telegram.');
    } finally {
      isTesting = false;
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
        
        <!-- Telegram Config -->
        <div class="pt-6 border-t border-white/10">
          <h3 class="text-title-md font-bold mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#0088cc]">send</span> Notifikasi Telegram
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Bot Token</label>
              <input 
                type="password" 
                bind:value={telegramToken} 
                class="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm"
                placeholder="Misal: 123456789:ABCdefGHI..."
              />
            </div>
            <div>
              <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Chat ID</label>
              <input 
                type="text" 
                bind:value={telegramChatId} 
                class="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm"
                placeholder="Misal: 987654321"
              />
            </div>
          </div>
          <button 
            onclick={testTelegram} 
            disabled={isTesting || !telegramToken || !telegramChatId}
            class="w-full sm:w-auto bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30 px-6 py-3 rounded-lg font-bold hover:bg-[#0088cc]/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {#if isTesting}
              <span class="material-symbols-outlined animate-spin">refresh</span>
              Mengirim Ping...
            {:else}
              <span class="material-symbols-outlined">campaign</span>
              Test Ping
            {/if}
          </button>
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
