<script setup lang="ts">
const metrics = ['Doanh thu', 'Vé đã bán', 'Tỷ lệ lấp đầy', 'Booking đang xử lý']
</script>

<template>
  <section>
    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary-hover">Admin</p>

    <h1 class="mt-2 text-3xl font-bold md:text-4xl">Tổng quan</h1>

    <p class="mt-4 max-w-2xl text-content-muted">
      Dashboard sẽ được kết nối với dữ liệu vận hành sau khi API contract được xác nhận.
    </p>

    <div class="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="metric in metrics"
        :key="metric"
        class="rounded-xl border border-outline bg-surface p-5"
      >
        <p class="text-sm text-content-muted">
          {{ metric }}
        </p>

        <p class="mt-3 text-2xl font-bold">—</p>
      </article>
    </div>
  </section>
</template>
