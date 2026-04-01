<template>
  <div>
    <div class="notification is-light" v-if="deleteNot">
      <button class="delete" @click="deleteNot = false" />
      <div class="content">
        国立国会図書館が提供する
        <a href="https://lab.ndl.go.jp/data_set/ocr/r3_line/" target="_blank" rel="noopener noreferrer">
          デジタル化資料のOCRテキスト化事業
        </a>
        の成果物である全文テキストを活用した実験サービスです。
      </div>
    </div>

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

    <div v-if="dataload && page === 1" class="mb-4">
      <label class="checkbox">
        <input type="checkbox" v-model="isRate" />
        <span class="ml-2">{{ isRate ? 'キーワードの出現比率を可視化' : 'キーワードの出現頻度を可視化' }}</span>
      </label>

      <div class="mt-3">
        <div class="mb-1">対象とする出版年代の範囲: {{ yearRange[0] }} - {{ yearRange[1] }}</div>
        <div class="is-flex is-align-items-center">
          <input class="mr-2" type="range" min="1801" max="2023" v-model.number="yearRangeStart" />
          <input type="range" min="1801" max="2023" v-model.number="yearRangeEnd" />
        </div>
      </div>

      <div class="mt-3">
        <div class="mb-1">可視化対象の件数: {{ visibleValue }}</div>
        <input type="range" min="1" max="10" v-model.number="visibleValue" />
      </div>

      <div class="chart-wrap mt-3">
        <LineChart :chart-data="datacollection" />
      </div>
    </div>

    <div v-if="result">
      <div class="level-item is-size-7-touch level-left">{{ result.hit }}件ヒットしました</div>

      <div class="is-flex is-align-items-center is-flex-wrap-wrap my-2 gap-2">
        <button
          v-if="!groupstr"
          class="button is-primary is-small mr-2"
          @click="isComponentModalActive = true"
        >
          検索結果を編集する
        </button>
        <button v-else class="button is-primary is-small mr-2" disabled>編集後の検索結果</button>

        <a :href="download()" target="_blank" rel="noopener noreferrer" class="mr-3">
          検索結果の出現頻度をダウンロード（最大10,000件）
        </a>
        <a :href="downloadFrequency()" target="_blank" rel="noopener noreferrer">
          出版年代ごとの総対象ngram数の情報をダウンロード
        </a>
      </div>

      <div class="modal" :class="{ 'is-active': isComponentModalActive }">
        <div class="modal-background" @click="closeModal" />
        <SearchResultEditor
          v-if="isComponentModalActive && result"
          :result="result"
          :visible-value="visibleValue"
          :year-range="yearRange"
          :is-rate="isRate"
          :input="keyword"
          @closemodal="closeModal"
        />
      </div>

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
            <th class="w6">キーワード</th>
            <th class="w2">総出現頻度</th>
            <th class="w2">外部検索</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in result.list" :key="i">
            <td>{{ row.ngramkeyword }}</td>
            <td>{{ row.count }}</td>
            <td>
              <a :href="`${ddbaseurl}${row.ngramkeyword}`" target="_blank" rel="noopener noreferrer">
                国立国会図書館デジタルコレクションで検索
              </a>
            </td>
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
import { computed, onMounted, onServerPrefetch, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import type { Ngramyear } from '~/src/domain/ngramyear'
import { downloadurl, getyearfreq, search, type SearchResult } from '~/src/service/search-service'
import { parseSearchQuery } from '~/composables/useSearchQuery'
import SearchResultEditor from '~/components/search-result-editor/SearchResultEditor.vue'
import LineChart from '~/components/chart/LineChart.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const result = ref<SearchResult<Ngramyear> | null>(null)
const dataload = ref(false)
const datacollection = ref({ datasets: [] as unknown[], baseurl: '', query1url: '', query2url: '' })

const isRate = ref(false)
const yearRange = ref<[number, number]>([1860, 2022])
const visibleValue = ref(5)
const isComponentModalActive = ref(false)
const deleteNot = ref(true)
const yearfrequencyjson = ref<Record<string, number>>({})

const ddquery1url = '&publicationFrom='
const ddquery2url = '&publicationTo='

const initial = parseSearchQuery(route.query)
const keyword = ref(initial.keyword)
const groupstr = ref<string | null>(initial.groupstr)
const size = ref(initial.size)
const from = ref(initial.from)
const materialtype = ref(initial.materialtype)

const materialTypes = [
  { value: 'full', label: '図書雑誌(※約230万資料から集計)' },
  { value: 'tosho-all', label: '図書のみ(※約97万資料から集計)' },
  { value: 'zasshi-all', label: '雑誌のみ(※約132万資料から集計)' },
  { value: 'tosho-pdm', label: '著作権保護期間満了図書のみ(※約28万資料から集計)' },
]

const page = computed(() => Math.floor(from.value / size.value) + 1)
const maxPage = computed(() => Math.max(1, Math.ceil((result.value?.hit ?? 0) / size.value)))

const ddbaseurl = computed(() => {
  if (materialtype.value === 'tosho-all') {
    return 'https://dl.ndl.go.jp/search/searchResult?accessRestrictions=internet&accessRestrictions=ooc&accessRestrictions=inlibrary&collection=A00001&fullText=true&itemToSearch_facet=fullText&eraType=AD&keyword='
  }
  if (materialtype.value === 'tosho-pdm') {
    return 'https://dl.ndl.go.jp/search/searchResult?accessRestrictions=internet&collection=A00001&fullText=true&itemToSearch_facet=fullText&eraType=AD&keyword='
  }
  if (materialtype.value === 'zasshi-all') {
    return 'https://dl.ndl.go.jp/search/searchResult?accessRestrictions=internet&accessRestrictions=ooc&accessRestrictions=inlibrary&collection=A00002&fullText=true&itemToSearch_facet=fullText&eraType=AD&keyword='
  }
  return 'https://dl.ndl.go.jp/search/searchResult?accessRestrictions=internet&accessRestrictions=ooc&accessRestrictions=inlibrary&collection=A00001&collection=A00002&fullText=true&itemToSearch_facet=fullText&eraType=AD&keyword='
})

const yearRangeStart = computed({
  get: () => yearRange.value[0],
  set: (value: number) => {
    const start = Math.min(value, yearRange.value[1])
    yearRange.value = [start, yearRange.value[1]]
  },
})

const yearRangeEnd = computed({
  get: () => yearRange.value[1],
  set: (value: number) => {
    const end = Math.max(value, yearRange.value[0])
    yearRange.value = [yearRange.value[0], end]
  },
})

const colorCode = ['#FF2800', '#66CCFF', '#35A16B', '#663300', '#9A0079', '#FF99A0', '#C7B2DE', '#B4EBFA', '#EDC58F', '#FFD1D1']

const fillData = () => {
  if (!result.value) return

  const datasetsarray: Array<Record<string, unknown>> = []
  for (let ii = 0; ii < Math.min(result.value.list.length, visibleValue.value); ii += 1) {
    const ngramkeyword = result.value.list[ii].ngramkeyword
    const jsonobj = JSON.parse(result.value.list[ii].ngramyearjson) as Record<string, number>
    const dataarray: Array<{ x: number; y: number }> = []

    Object.entries(jsonobj).forEach(([y, count]) => {
      const numericYear = Number(y)
      if (numericYear >= yearRange.value[0] && numericYear <= yearRange.value[1]) {
        if (isRate.value) {
          const yearsum = yearfrequencyjson.value[y] ?? 1
          dataarray.push({ x: numericYear, y: Number(count) / Number(yearsum) })
        } else {
          dataarray.push({ x: numericYear, y: Number(count) })
        }
      }
    })

    dataarray.sort((a, b) => a.x - b.x)
    datasetsarray.push({
      label: ngramkeyword,
      data: dataarray,
      backgroundColor: colorCode[ii % colorCode.length],
      borderColor: colorCode[ii % colorCode.length],
      tension: 0.2,
      fill: false,
    })
  }

  datacollection.value = {
    datasets: datasetsarray,
    baseurl: ddbaseurl.value,
    query1url: ddquery1url,
    query2url: ddquery2url,
  }
}

watch([isRate, visibleValue, yearRange], fillData, { deep: true })

const runSearch = async () => {
  if (!keyword.value) return
  loading.value = true
  dataload.value = false
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
    yearfrequencyjson.value = (await getyearfreq(materialtype.value)).data as Record<string, number>
    fillData()
    dataload.value = true
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

const closeModal = () => {
  isComponentModalActive.value = false
}

const download = () => downloadurl(encodeURIComponent(keyword.value), materialtype.value, groupstr.value)
const downloadFrequency = () => `https://lab.ndl.go.jp/dataset/ngramviewer/yearfrequency_${materialtype.value}.tsv`

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

onMounted(async () => {
  if (keyword.value) {
    await runSearch()
  }
})
</script>
