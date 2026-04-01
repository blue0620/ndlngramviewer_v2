<template>
  <div>
    <div class="field">
      <section>
        <div class="block">
          <label class="radio mr-4" v-for="item in materialTypes" :key="item.value">
            <input type="radio" v-model="materialtype" :value="item.value" @change="onChangeCondition" />
            {{ item.label }}
          </label>
        </div>
      </section>
      <div class="control level-right is-flex">
        <input class="input is-info" type="text" v-model="keyword" @keyup.enter="searchWithReset" />
        <button class="button is-info ml-2" :disabled="!keyword || loading" @click="searchWithReset">
          検索
        </button>
      </div>
    </div>

    <div v-if="result">
      <div class="level-item is-size-7-touch level-left">{{ result.hit }}件ヒットしました</div>

      <div class="is-flex is-align-items-center my-2">
        <span class="mr-2">表示件数</span>
        <div class="select is-small">
          <select v-model.number="size" @change="onPageSizeChange">
            <option :value="100">100件</option>
            <option :value="200">200件</option>
            <option :value="500">500件</option>
          </select>
        </div>
      </div>

      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th>キーワード</th>
            <th>総出現頻度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in result.list" :key="i">
            <td>{{ row.ngramkeyword }}</td>
            <td>{{ row.count }}</td>
          </tr>
        </tbody>
      </table>

      <nav class="pagination is-small" role="navigation" aria-label="pagination">
        <a class="pagination-previous" :disabled="page <= 1" @click="movePage(page - 1)">Prev</a>
        <a class="pagination-next" :disabled="page >= maxPage" @click="movePage(page + 1)">Next</a>
        <ul class="pagination-list">
          <li>
            <span class="pagination-link is-current">{{ page }} / {{ maxPage }}</span>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import type { Ngramyear } from '~/src/domain/ngramyear'
import { search, type SearchResult } from '~/src/service/search-service'
import { parseSearchQuery } from '~/composables/useSearchQuery'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const result = ref<SearchResult<Ngramyear> | null>(null)

const initial = parseSearchQuery(route.query)
const keyword = ref(initial.keyword)
const groupstr = ref<string | null>(initial.groupstr)
const size = ref(initial.size)
const from = ref(initial.from)
const materialtype = ref(initial.materialtype)

const materialTypes = [
  { value: 'full', label: '図書雑誌' },
  { value: 'tosho-all', label: '図書のみ' },
  { value: 'zasshi-all', label: '雑誌のみ' },
  { value: 'tosho-pdm', label: '著作権保護期間満了図書のみ' },
]

const page = computed(() => Math.floor(from.value / size.value) + 1)
const maxPage = computed(() => Math.max(1, Math.ceil((result.value?.hit ?? 0) / size.value)))

const runSearch = async () => {
  if (!keyword.value) return
  loading.value = true
  try {
    result.value = (
      await search(
        encodeURIComponent(keyword.value),
        size.value,
        from.value,
        materialtype.value,
        groupstr.value,
      )
    ).data
  } finally {
    loading.value = false
  }
}

const syncRoute = async () => {
  await router.push({
    path: route.path,
    query: {
      keyword: keyword.value,
      size: String(size.value),
      from: String(from.value),
      materialtype: materialtype.value,
      ...(groupstr.value ? { groupstr: groupstr.value } : {}),
    },
  })
}

const searchWithReset = async () => {
  from.value = 0
  groupstr.value = null
  await syncRoute()
  await runSearch()
}

const movePage = async (targetPage: number) => {
  const p = Math.min(Math.max(1, targetPage), maxPage.value)
  from.value = (p - 1) * size.value
  await syncRoute()
  await runSearch()
}

const onPageSizeChange = async () => {
  from.value = 0
  await syncRoute()
  await runSearch()
}

const onChangeCondition = async () => {
  from.value = 0
  await syncRoute()
  await runSearch()
}

watch(
  () => route.query,
  async (query) => {
    const parsed = parseSearchQuery(query)
    keyword.value = parsed.keyword
    groupstr.value = parsed.groupstr
    size.value = parsed.size
    from.value = parsed.from
    materialtype.value = parsed.materialtype
  },
)

onServerPrefetch(async () => {
  if (keyword.value) {
    await runSearch()
  }
})

if (process.client && keyword.value) {
  runSearch()
}
</script>
