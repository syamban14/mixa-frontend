<script>
  import { onMount } from 'svelte';
  
  let { onLogin = () => {} } = $props();
  
  let errorMsg = $state('');
  let isLoading = $state(false);

  // Fallback admin login states
  let showAdminLogin = $state(false);
  let password = $state('');

  const GOOGLE_CLIENT_ID = '905823335852-e3iivrak2u5hj8omoatuh9sqbbev5sjm.apps.googleusercontent.com';

  onMount(() => {
    // Initialize Google Login
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        context: 'signin',
        ux_mode: 'popup',
        auto_select: false,
        itp_support: true
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById("google-button-container"),
        { theme: "outline", size: "large", width: 280, text: "continue_with" }
      );
      
      // window.google.accounts.id.prompt(); // Optional: One Tap prompt
    } else {
      errorMsg = 'Google Login Service tidak tersedia. Periksa koneksi internet Anda.';
    }
  });

  async function handleGoogleCallback(response) {
    isLoading = true;
    errorMsg = '';
    
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.user.has_access) {
          localStorage.setItem('mixa_token', data.token);
          localStorage.setItem('mixa_user', JSON.stringify(data.user));
          window.location.reload();
        } else {
          errorMsg = 'Masa berlangganan atau masa percobaan (Trial) Anda telah habis. Silakan perpanjang.';
        }
      } else {
        const errorData = await res.json();
        errorMsg = errorData.detail || 'Autentikasi gagal.';
      }
    } catch (err) {
      errorMsg = 'Koneksi ke server gagal.';
    } finally {
      isLoading = false;
    }
  }

  // Backward compatibility for Admin login if needed
  async function handleAdminLogin(e) {
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
        localStorage.setItem('mixa_token', data.token);
        localStorage.setItem('mixa_user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        errorMsg = 'Password salah.';
      }
    } catch (err) {
      errorMsg = 'Koneksi ke server gagal.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="relative bg-[#0a0a0a] overflow-hidden" style="width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
    <div class="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]"></div>
  </div>
  
  <div class="relative z-10" style="width: 100%; max-width: 448px; padding: 0 16px; flex-shrink: 0;">
    <div class="glass rounded-2xl p-8 shadow-2xl border border-white/10" style="width: 100%;">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
        </div>
        <h1 class="text-3xl font-black text-on-surface font-sans mb-2">MIXA AI</h1>
        <p class="text-on-surface-variant text-sm">Masuk untuk mengakses dasbor AutoTrade</p>
      </div>
      
      {#if !showAdminLogin}
        <div class="flex flex-col items-center gap-6">
          <div id="google-button-container" class="min-h-[40px] flex justify-center"></div>
          
          {#if isLoading}
            <div class="flex items-center gap-2 text-primary text-sm mt-4 animate-pulse">
              <span class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
              Memverifikasi Akun Google...
            </div>
          {/if}
          
          {#if errorMsg}
            <div class="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm flex items-center gap-2 w-full mt-2 animate-in slide-in-from-top-2">
              <span class="material-symbols-outlined text-[18px]">error</span>
              <span class="text-left">{errorMsg}</span>
            </div>
          {/if}
          
          <button onclick={() => showAdminLogin = true} class="text-xs text-on-surface-variant/50 hover:text-primary transition-colors mt-4 bg-transparent border-none cursor-pointer">
            Gunakan Master Password (Admin)
          </button>
        </div>
      {:else}
        <form onsubmit={handleAdminLogin} class="space-y-6">
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
          
          <div class="flex flex-col gap-2">
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
            <button type="button" onclick={() => showAdminLogin = false} class="w-full bg-transparent text-on-surface-variant px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/5 transition-all">
              Kembali ke Google Login
            </button>
          </div>
        </form>
      {/if}
      
      <p class="text-center text-xs text-on-surface-variant/50 mt-8">
        SaaS Mode. Google Identity Secured.
      </p>
    </div>
  </div>
</div>
