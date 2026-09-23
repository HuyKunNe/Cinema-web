<template>
  <main
    id="main-content"
    class="grid min-h-screen place-items-center bg-background px-4 py-12 text-content"
  >
    <section class="w-full max-w-md rounded-2xl border border-outline bg-surface p-8">
      <RouterLink
        to="/"
        class="mb-8 block text-center text-2xl font-bold tracking-[0.18em] text-secondary"
      >
        CINEMA
      </RouterLink>

      <RouterView />
    </section>
  </main>
</template>
