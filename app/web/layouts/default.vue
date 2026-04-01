<template>
  <div>
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
        <div class="container">
          <slot />
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <span class="link">
            <a href="https://www.ndl.go.jp/">国立国会図書館ホームページ</a>
          </span>
          <span class="link">
            <a href="https://lab.ndl.go.jp/">NDLラボ</a>
          </span>
          <br />
          <span>Copyright © 2022- National Diet Library, Japan. All Rights Reserved.</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
main {
  background: white;
}

.footer {
  .link {
    margin-right: 2rem;
  }
}
</style>
