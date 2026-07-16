<script>
  import { onMount } from 'svelte';

  let geminiModel = $state('gemini-2.5-flash');
  let initialBalance = $state(0);
  let telegramToken = $state('');
  let telegramChatId = $state('');
  let indodaxApiKey = $state('');
  let indodaxSecretKey = $state('');
  let isSaving = $state(false);
  let isTesting = $state(false);
  let showSuccess = $state(false);
  let isAdmin = $state(false);

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
        if (data.is_admin) isAdmin = true;
        if (data.gemini_model) geminiModel = data.gemini_model;
        if (data.initial_balance !== undefined) initialBalance = data.initial_balance;
        if (data.telegram_token) telegramToken = data.telegram_token;
        if (data.telegram_chat_id) telegramChatId = data.telegram_chat_id;
        if (data.indodax_api_key) indodaxApiKey = data.indodax_api_key;
        if (data.indodax_secret_key) indodaxSecretKey = data.indodax_secret_key;
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
          telegram_chat_id: telegramChatId,
          indodax_api_key: indodaxApiKey,
          indodax_secret_key: indodaxSecretKey
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
        body: JSON.stringify({ telegram_chat_id: telegramChatId })
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
          
          {#if !isAdmin}
            <div class="bg-[#0088cc]/10 border border-[#0088cc]/30 rounded-lg p-4 mb-4">
              <p class="text-sm text-[#0088cc] mb-2 font-bold">Cara Mendapatkan Chat ID Anda:</p>
              <ol class="text-sm text-on-surface-variant list-decimal list-inside space-y-1">
                <li>Buka Telegram dan cari bot resmi kami: <strong>@MixaTradeBot</strong> (atau bot resmi Admin).</li>
                <li>Klik tombol <strong>Start</strong> atau ketik <code>/start</code>.</li>
                <li>Atau Anda bisa menggunakan bot <strong>@userinfobot</strong> untuk melihat Chat ID Anda.</li>
                <li>Masukkan ID berupa angka (contoh: 123456789) ke dalam kolom di bawah ini.</li>
              </ol>
            </div>
          {/if}

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {#if isAdmin}
              <div>
                <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Bot Token (Admin)</label>
                <input 
                  type="password" 
                  bind:value={telegramToken} 
                  class="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm"
                  placeholder="Misal: 123456789:ABCdefGHI..."
                />
              </div>
            {/if}
            <div class={!isAdmin ? "sm:col-span-2" : ""}>
              <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Chat ID Anda</label>
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
            disabled={isTesting || !telegramChatId}
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

        <!-- Indodax Config -->
        <div class="pt-6 border-t border-white/10">
          <h3 class="text-title-md font-bold mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-tertiary">key</span> API Key Indodax
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">API Key</label>
              <input 
                type="password" 
                bind:value={indodaxApiKey} 
                class="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm"
                placeholder="Indodax API Key..."
              />
            </div>
            <div>
              <label class="block text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">Secret Key</label>
              <input 
                type="password" 
                bind:value={indodaxSecretKey} 
                class="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm"
                placeholder="Indodax Secret Key..."
              />
            </div>
          </div>
          <p class="text-xs text-on-surface-variant mt-3">Disimpan secara aman di database lokal Anda. Hanya masukkan jika Anda ingin bot mengeksekusi perdagangan sungguhan.</p>
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
