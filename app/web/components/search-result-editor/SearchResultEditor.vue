<template>
  <div class="search-result-editor">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">編集画面</p>
        <button type="button" class="delete" @click="handleCancel" />
      </header>

      <section class="modal-card-body">
        <LineChart :chart-data="datacollection" />

        <div v-if="totalingKeywordList.length > 0">
          <table class="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>合算キーワード</th>
                <th>合算後の総頻度</th>
                <th>キャンセル</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in totalingKeywordList" :key="row.ngramkeyword">
                <td>{{ row.ngramkeyword }}</td>
                <td>{{ row.count }}</td>
                <td>
                  <button class="button is-small is-danger" @click.prevent="totalingDeleteRow(row)">
                    削除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <button class="button is-success mr-2" @click="totalingResult">合算結果を含めたリンクを取得する</button>
          <button class="button is-info" @click="totalingDownload">合算結果を含めたTSVを取得する</button>
        </div>

        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th />
              <th>キーワード</th>
              <th>総頻度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in resultKeywordList" :key="row.idx">
              <td>
                <input
                  type="checkbox"
                  :checked="isChecked(row)"
                  @change="toggleChecked(row, ($event.target as HTMLInputElement).checked)"
                />
              </td>
              <td>{{ row.ngramkeyword }}</td>
              <td>{{ row.count }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer class="modal-card-foot">
        <button class="button" @click="handleCancel">編集画面を閉じる</button>
        <button class="button is-primary" @click="totaling">選択したキーワードを合算する</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import LineChart from '../chart/LineChart.vue'
import yearfrequencyjson from '../../src/yearfrequency.json'
import { downloadurl } from '../../src/service/search-service'

interface SearchRow {
  idx?: number
  ngramkeyword: string
  count: number
  ngramyearjson: string
}

interface SummaryRow extends SearchRow {
  idxarray: number[]
}

interface SearchResultPayload {
  list: SearchRow[]
}

interface Props {
  result: SearchResultPayload
  visibleValue: number
  yearRange: [number, number]
  isRate: boolean
  input: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'closemodal'): void }>()

const resultKeywordList = ref<SearchRow[]>([])
const totalingKeywordList = ref<SummaryRow[]>([])
const checkedRows = ref<SearchRow[]>([])
const datacollection = ref<{ datasets: unknown[] }>({ datasets: [] })

const colorCode = ['#FF2800', '#66CCFF', '#35A16B', '#663300', '#9A0079', '#FF99A0', '#C7B2DE', '#B4EBFA', '#EDC58F', '#FFD1D1']

const fillData = () => {
  const datasetsarray: Array<Record<string, unknown>> = []
  const tmpResultList = props.result.list.concat(totalingKeywordList.value)
  tmpResultList.sort((a, b) => a.count - b.count).reverse()

  for (let ii = 0; ii < Math.min(tmpResultList.length, props.visibleValue); ii += 1) {
    const ngramkeyword = tmpResultList[ii].ngramkeyword
    const jsonobj = JSON.parse(tmpResultList[ii].ngramyearjson) as Record<string, number>
    const dataarray: Array<{ x: number; y: number }> = []

    Object.entries(jsonobj).forEach(([year, count]) => {
      const numericYear = Number(year)
      if (numericYear >= props.yearRange[0] && numericYear <= props.yearRange[1]) {
        if (props.isRate) {
          const yearsum = (yearfrequencyjson as Record<string, number>)[year] ?? 1
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
      fill: false
    })
  }

  datacollection.value = { datasets: datasetsarray }
  resultKeywordList.value = props.result.list.map((row, idx) => ({ ...row, idx }))
}

watch(totalingKeywordList, fillData, { deep: true })
watch(() => props.result, fillData, { immediate: true, deep: true })

const handleCancel = () => emit('closemodal')

const isChecked = (row: SearchRow) => checkedRows.value.some((checked) => checked.idx === row.idx)

const toggleChecked = (row: SearchRow, isSelected: boolean) => {
  if (isSelected) {
    checkedRows.value.push(row)
    return
  }
  checkedRows.value = checkedRows.value.filter((checked) => checked.idx !== row.idx)
}

const totaling = () => {
  if (checkedRows.value.length < 2) {
    window.alert('合算したい2つ以上のキーワードを選択してください')
    return
  }

  const [first, ...rest] = checkedRows.value
  const summaryjsonobj = JSON.parse(first.ngramyearjson) as Record<string, number>
  let summarycount = first.count
  let summaryngramkeyword = first.ngramkeyword
  const summaryidxarray = [first.idx ?? 0]

  rest.forEach((row) => {
    summarycount += row.count
    summaryngramkeyword += `=${row.ngramkeyword}`
    summaryidxarray.push(row.idx ?? 0)

    const tmpjsonobj = JSON.parse(row.ngramyearjson) as Record<string, number>
    Object.entries(tmpjsonobj).forEach(([key, value]) => {
      summaryjsonobj[key] = (summaryjsonobj[key] ?? 0) + Number(value)
    })
  })

  totalingKeywordList.value.push({
    ngramkeyword: summaryngramkeyword,
    count: summarycount,
    idxarray: summaryidxarray,
    ngramyearjson: JSON.stringify(summaryjsonobj)
  })

  checkedRows.value = []
}

const totalingDeleteRow = (rowdata: SummaryRow) => {
  totalingKeywordList.value = totalingKeywordList.value.filter((row) => row.ngramkeyword !== rowdata.ngramkeyword)
}

const buildGroupStr = () => totalingKeywordList.value
  .map((row) => [...row.idxarray].sort((a, b) => a - b).join('='))
  .join('-')
  .trim()

const totalingResult = () => {
  const groupstr = buildGroupStr()
  window.open(`${window.location.href}&groupstr=${groupstr}`)
}

const totalingDownload = () => {
  const groupstr = buildGroupStr()
  window.open(downloadurl(encodeURIComponent(props.input), groupstr))
}
</script>
