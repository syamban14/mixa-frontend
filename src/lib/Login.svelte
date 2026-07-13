<script>
  let { onLogin = () => {} } = $props();
  
  let password = $state('');
  let errorMsg = $state('');
  let isLoading = $state(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!password) return;
    
    isLoading = true;
    errorMsg = '';
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Simpan token ke localStorage
        localStorage.setItem('mixa_token', data.token);
        onLogin();
      } else {
        errorMsg = 'Password yang Anda masukkan salah.';
      }
    } catch (err) {
      errorMsg = 'Koneksi ke server gagal.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="relative min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden">
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
    <div class="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]"></div>
  </div>
  
  <div class="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
    <div class="glass rounded-2xl p-8 shadow-2xl border border-white/10">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-primary text-3xl">lock</span>
        </div>
        <h1 class="text-3xl font-black text-on-surface font-sans mb-2">MIXA AI</h1>
        <p class="text-on-surface-variant text-sm">Masuk untuk mengakses dasbor AutoTrade</p>
      </div>
      
      <form onsubmit={handleLogin} class="space-y-6">
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Master Password</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">key</span>
            <input 
              type="password" 
              bind:value={password} 
              class="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              placeholder="Masukkan password..."
              required
              autofocus
            />
          </div>
        </div>
        
        {#if errorMsg}
          <div class="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
            <span class="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        {/if}
        
        <button 
          type="submit" 
          disabled={isLoading || !password}
          class="w-full bg-primary text-background px-6 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(78,222,163,0.3)] hover:shadow-[0_0_25px_rgba(78,222,163,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none mt-2"
        >
          {#if isLoading}
            <span class="material-symbols-outlined animate-spin">refresh</span>
            Memverifikasi...
          {:else}
            <span>Buka Kunci</span>
            <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
          {/if}
        </button>
      </form>
      
      <p class="text-center text-xs text-on-surface-variant/50 mt-8">
        Mode keamanan aktif. End-to-end terenkripsi.
      </p>
    </div>
  </div>
</div>
