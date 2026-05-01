<template>
  <div class="search-paginaition">
    <nav class="pagination is-small" role="navigation" aria-label="pagination">
      <a class="pagination-previous is-small" v-on:click="goto(page - 1)">
        <span class="icon">
          <i class="fas fa-chevron-left"></i>
        </span>
      </a>
      <a class="pagination-next is-small" v-on:click="goto(page + 1)">
        <span class="icon">
          <i class="fas fa-chevron-right"></i>
        </span>
      </a>
      <ul class="pagination-list">
        <template v-if="show1">
          <li>
            <a class="pagination-link" v-on:click="goto(1)" aria-label="Goto page 1">{{ 1 }}</a>
          </li>
          <li v-show="pageArray[0] > 2">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
        </template>
        <li v-for="p in pageArray" :key="p">
          <a class="pagination-link" :class="{ 'is-current': p === page }" :aria-label="'Goto page ' + p" v-on:click="goto(p)">{{ p }}</a>
        </li>
        <template v-if="show2">
          <li v-show="pageArray[pageArray.length - 1] < maxPage - 1">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          <li>
            <a class="pagination-link" v-on:click="goto(maxPage)" :aria-label="'Goto page ' + maxPage">{{ maxPage }}</a>
          </li>
        </template>
      </ul>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";

export default defineComponent({
  name: "SearchPagination",
  props: {
    size: { type: Number, default: 2 },
    keyword: { type: String, required: true },
    materialtype: { type: String, required: true },
    groupstr: { type: String, default: null },
    pagesize: { type: Number, required: true },
    proppagefrom: { type: Number, required: true },
    allhits: { type: Number, required: true },
  },
  setup(props) {
    const pagefrom = ref(props.proppagefrom);
    watch(() => props.proppagefrom, (v) => { pagefrom.value = v; });

    const maxPage = computed(() => Math.ceil(props.allhits / props.pagesize));
    const page = computed(() => Math.floor(pagefrom.value / props.pagesize) + 1);
    const show1 = computed(() => page.value - props.size > 1);
    const show2 = computed(() => page.value < maxPage.value - props.size && maxPage.value < 20);
    const pageArray = computed(() => {
      const arr: number[] = [];
      for (let i = page.value - props.size; i < page.value + props.size + 1; i++) {
        if (i > 0 && i <= maxPage.value) arr.push(i);
      }
      return arr;
    });

    return { pagefrom, maxPage, page, show1, show2, pageArray };
  },
  methods: {
    goto(page: number) {
      let nextPage = page;
      if (nextPage <= 0) nextPage = 1;
      if (nextPage > this.maxPage) nextPage = this.maxPage;
      this.pagefrom = this.pagesize * (nextPage - 1);
      const pushobj: any = { query: { keyword: this.keyword, size: this.pagesize, from: this.pagefrom, materialtype: this.materialtype } };
      if (this.groupstr != null) pushobj.query.groupstr = this.groupstr;
      this.$router.push(pushobj).catch(() => {});
    },
  },
});
</script>

<style lang="scss" src="./search-pagination.scss"></style>
