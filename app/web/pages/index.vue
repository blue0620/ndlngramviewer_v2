<template>
  <main>
    <section class="hero is-info">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">NDL Ngram Viewer</h1>
          <h2 class="subtitle">
            国立国会図書館の提供するデジタル化資料のOCR全文テキストデータを利用したNgram Viewer
          </h2>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container content">
        <p>
          既存の Webpack + <code>src/main.ts</code> 起動フローから、Nuxt 3 の
          <code>app.vue</code> / <code>pages/</code> 構成へ移行しました。
        </p>
        <p>
          既存 UI・検索ロジック（Vue 2 / class component 依存）は段階的に Nuxt 対応へ移設してください。
        </p>
      </div>
    </section>
  </main>
</template>
