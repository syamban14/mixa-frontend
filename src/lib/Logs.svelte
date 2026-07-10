<script>
  import { onMount } from 'svelte';

  let logs = $state([]);
  let loading = $state(true);
  let logsContainer = $state(null);
  let autoScroll = $state(true);

  async function fetchLogs() {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      if (data.logs) {
        logs = data.logs;
      }
    } catch (e) {
      console.error('Gagal mengambil log dari backend', e);
      logs = [...logs, `[ERROR] Gagal mengambil log: ${e.message}`];
    } finally {
      loading = false;
      if (autoScroll && logsContainer) {
        setTimeout(() => {
          logsContainer.scrollTop = logsContainer.scrollHeight;
        }, 50);
      }
    }
  }

  function handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Jika user scroll ke atas (tidak di paling bawah), matikan autoscroll
    if (scrollHeight - scrollTop - clientHeight > 50) {
      autoScroll = false;
    } else {
      autoScroll = true;
    }
  }

  function scrollToBottom() {
    autoScroll = true;
    if (logsContainer) {
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }
  }

  onMount(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Polling setiap 5 detik
    return () => clearInterval(interval);
  });
</script>

<div class="flex flex-col h-[calc(100vh-120px)] gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-headline-md text-primary flex items-center gap-3">
        <span class="material-symbols-outlined text-[32px]">terminal</span>
        System Logs (Backend)
      </h2>
      <p class="text-on-surface-variant text-body-sm mt-1">Real-time output dari mesin Python utama (MIXA Engine) di VPS Anda.</p>
    </div>
    
    <div class="flex items-center gap-3">
      {#if !autoScroll}
        <button 
          class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-xs font-bold uppercase tracking-wider"
          onclick={scrollToBottom}
        >
          <span class="material-symbols-outlined text-sm">arrow_downward</span>
          Resume Auto-Scroll
        </button>
      {/if}
      
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-white/5 text-xs text-on-surface-variant">
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        Live Polling (5s)
      </div>
    </div>
  </div>

  <div 
    bind:this={logsContainer}
    onscroll={handleScroll}
    class="flex-1 bg-[#0a0a0a] rounded-xl border border-white/10 p-4 font-mono text-[13px] leading-relaxed overflow-y-auto relative shadow-inner"
  >
    {#if loading && logs.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-50">
        <span class="material-symbols-outlined text-4xl mb-2 animate-bounce">sync</span>
        <p>Memuat jurnal aktivitas bot...</p>
      </div>
    {:else if logs.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-50">
        <span class="material-symbols-outlined text-4xl mb-2">hourglass_empty</span>
        <p>Belum ada catatan aktivitas.</p>
      </div>
    {:else}
      {#each logs as log}
        <!-- Pewarnaan pintar untuk Log Level -->
        <div class="py-0.5 border-b border-white/[0.02] hover:bg-white/[0.02] px-2 rounded -mx-2 transition-colors flex gap-3">
          {#if log.includes('ERROR')}
            <span class="text-secondary font-bold shrink-0">[ERROR]</span>
            <span class="text-secondary/90 break-words">{log.replace(/.*- ERROR - /, '')}</span>
          {:else if log.includes('WARNING')}
            <span class="text-[#f59e0b] font-bold shrink-0">[WARN]</span>
            <span class="text-[#f59e0b]/90 break-words">{log.replace(/.*- WARNING - /, '')}</span>
          {:else if log.includes('INFO')}
            <span class="text-primary font-bold shrink-0">[INFO]</span>
            <span class="text-on-surface-variant break-words">{log.replace(/.*- INFO - /, '')}</span>
          {:else}
            <span class="text-on-surface-variant break-words w-full">{log}</span>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>
