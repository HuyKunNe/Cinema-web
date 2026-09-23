<template>
  <div class="min-h-screen bg-background text-content lg:flex">
    <aside class="hidden w-64 shrink-0 border-r border-outline bg-surface-header lg:block">
      <RouterLink to="/admin" class="block border-b border-outline px-6 py-5">
        <span class="text-xl font-bold tracking-[0.12em] text-secondary"> CINEMA </span>

        <span class="ml-2 text-sm font-semibold"> ADMIN </span>
      </RouterLink>

      <div class="p-4 text-sm text-content-muted">Navigation sẽ được hoàn thiện trong F1.1C.</div>
    </aside>

    <div class="min-w-0 flex-1">
      <header
        class="flex h-16 items-center justify-between border-b border-outline bg-surface-header px-5 lg:px-8"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-content-muted">Cinema administration</p>

          <p class="font-semibold">Vận hành hệ thống</p>
        </div>

        <div class="rounded-full border border-outline px-4 py-2 text-sm">Quản trị viên</div>
      </header>

      <main id="main-content" class="p-5 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
