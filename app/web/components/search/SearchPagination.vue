<template>
  <div class="search-paginaition">
    <nav class="pagination is-small" role="navigation" aria-label="pagination">
      <a class="pagination-previous is-small" :disabled="page <= 1" @click="goto(page - 1)">
        <b-icon icon="chevron-left" />
      </a>
      <a class="pagination-next is-small" :disabled="page >= maxPage" @click="goto(page + 1)">
        <b-icon icon="chevron-right" />
      </a>
      <ul class="pagination-list">
        <template v-if="showLeadingShortcut">
          <li>
            <a class="pagination-link" aria-label="Goto page 1" @click="goto(1)">1</a>
          </li>
          <li v-show="pageArray[0] > 2">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
        </template>

        <li v-for="p in pageArray" :key="p">
          <a class="pagination-link" :class="{ 'is-current': p === page }" :aria-label="`Goto page ${p}`" @click="goto(p)">{{ p }}</a>
        </li>

        <template v-if="showTrailingShortcut">
          <li v-show="pageArray[pageArray.length - 1] < maxPage - 1">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          <li>
            <a class="pagination-link" :aria-label="`Goto page ${maxPage}`" @click="goto(maxPage)">{{ maxPage }}</a>
          </li>
        </template>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  size?: number
  keyword?: string
  pagesize: number
  pagefrom: number
  allhits: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 2,
  keyword: ''
})

const emit = defineEmits<{
  (e: 'update:pagefrom', value: number): void
}>()

const router = useRouter()
const localPageFrom = ref(props.pagefrom)

watch(
  () => props.pagefrom,
  (value) => {
    localPageFrom.value = value
  }
)

const maxPage = computed(() => Math.max(1, Math.ceil(props.allhits / props.pagesize)))
const page = computed(() => Math.floor(localPageFrom.value / props.pagesize) + 1)
const showLeadingShortcut = computed(() => page.value - props.size > 1)
const showTrailingShortcut = computed(() => page.value < maxPage.value - props.size)

const pageArray = computed<number[]>(() => {
  const arr: number[] = []
  for (let i = page.value - props.size; i < page.value + props.size + 1; i += 1) {
    if (i > 0 && i <= maxPage.value) {
      arr.push(i)
    }
  }
  return arr
})

const goto = async (nextPage: number) => {
  let safePage = nextPage
  if (safePage < 1) safePage = 1
  if (safePage > maxPage.value) safePage = maxPage.value

  const nextFrom = props.pagesize * (safePage - 1)
  localPageFrom.value = nextFrom
  emit('update:pagefrom', nextFrom)

  await router.push({
    query: {
      keyword: props.keyword,
      size: String(props.pagesize),
      from: String(nextFrom)
    }
  })
}
</script>

<style scoped lang="scss">
@import "../../src/styles/_palette.scss";

.search-paginaition {
  @include is-mobile() {
    padding: 1rem;
  }

  @include is-tablet() {
    margin: 1.75rem 2.75rem;
  }

  .is-current {
    pointer-events: none;
  }
}
</style>
