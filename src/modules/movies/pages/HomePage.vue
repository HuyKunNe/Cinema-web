<template>
  <section class="relative overflow-hidden border-b border-outline">
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,var(--color-primary-subtle)_0%,transparent_40%)]"
      aria-hidden="true"
    ></div>

    <div class="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Cinema booking</p>

      <h1 class="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
        Trải nghiệm điện ảnh bắt đầu từ chiếc ghế bạn chọn.
      </h1>

      <p class="mt-6 max-w-2xl text-base leading-7 text-content-muted md:text-lg">
        Khám phá phim, chọn suất chiếu và theo dõi vé trong một trải nghiệm liền mạch.
      </p>

      <RouterLink
        to="/auth/login"
        class="mt-8 inline-flex rounded-xl bg-primary px-6 py-3 font-semibold transition hover:bg-primary-hover"
      >
        Bắt đầu
      </RouterLink>
    </div>
  </section>
</template>
