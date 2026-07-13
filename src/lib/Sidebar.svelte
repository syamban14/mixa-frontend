<script>
  let { activePage = $bindable('dashboard') } = $props();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'performance', label: 'Portofolio', icon: 'pie_chart' },
    { id: 'management', label: 'Bot Management', icon: 'precision_manufacturing' },
    { id: 'config', label: 'Bot Configuration', icon: 'settings_input_component' },
    { id: 'backtest', label: 'Laboratorium', icon: 'science' },
    { id: 'history', label: 'Transaction History', icon: 'receipt_long' },
  ];
</script>

<aside class="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-white/10 shadow-md flex flex-col py-6 px-4 z-50">
  <div class="mb-10 px-2">
    <h1 class="text-headline-md font-bold text-primary">MIXA AI</h1>
    <p class="text-label-mono text-on-surface-variant uppercase tracking-widest mt-1 opacity-70">AutoTrade Terminal</p>
  </div>

  <nav class="flex-1 space-y-1">
    {#each navItems as item}
      <button
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors active:scale-95 duration-150 text-left
          {activePage === item.id
            ? 'text-primary font-bold border-r-2 border-primary bg-primary/5'
            : 'text-on-surface-variant font-medium hover:bg-surface-container-high'}"
        onclick={() => activePage = item.id}
      >
        <span
          class="material-symbols-outlined"
          style={activePage === item.id ? "font-variation-settings: 'FILL' 1;" : ''}
        >{item.icon}</span>
        <span class="text-body-md">{item.label}</span>
      </button>
    {/each}
  </nav>

  <div class="mt-auto space-y-4">
    <div class="pt-4 border-t border-white/5 space-y-1">
      <button class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors active:scale-95 duration-150 text-left {activePage === 'logs' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant font-medium hover:bg-surface-container-high'}" onclick={() => activePage = 'logs'}>
        <span class="material-symbols-outlined" style={activePage === 'logs' ? "font-variation-settings: 'FILL' 1;" : ''}>terminal</span>
        <span class="text-body-sm">System Logs</span>
      </button>
      <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors" href="#live">
        <span class="material-symbols-outlined">sensors</span>
        <span class="text-body-sm">Live Status</span>
      </a>
      <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors" href="#support">
        <span class="material-symbols-outlined">help_outline</span>
        <span class="text-body-sm">Support</span>
      </a>
    </div>
  </div>
</aside>
