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
          <b-table :data="totalingKeywordList" :key="tableDataKey">
            <b-table-column field="ngramkeyword" label="合算キーワード" v-slot="props">
              {{ props.row.ngramkeyword }}
            </b-table-column>
            <b-table-column field="count" label="合算後の総頻度" v-slot="props">
              {{ props.row.count }}
            </b-table-column>
            <b-table-column label="キャンセル" v-slot="props">
              <button class="button is-small is-danger" @click.prevent="totalingDeleteRow(props.row)">
                <b-icon icon="delete" size="is-small" />
              </button>
            </b-table-column>
          </b-table>
          <b-button label="合算結果を含めたリンクを取得する" type="is-success" @click="totalingResult" />
          <b-button label="合算結果を含めたTSVを取得する" type="is-info" @click="totalingDownload" />
        </div>

        <b-table
          :header-checkable="false"
          :data="resultKeywordList"
          :columns="resultColumns"
          :checked-rows.sync="checkedRows"
          checkable
        />
      </section>

      <footer class="modal-card-foot">
        <b-button label="編集画面を閉じる" @click="handleCancel" />
        <b-button label="選択したキーワードを合算する" type="is-primary" @click="totaling" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { DialogProgrammatic as Dialog } from 'buefy'
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
const tableDataKey = ref(0)
const datacollection = ref<{ datasets: unknown[] }>({ datasets: [] })

const resultColumns = [
  { field: 'ngramkeyword', label: 'キーワード' },
  { field: 'count', label: '総頻度' }
]

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

const totaling = () => {
  if (checkedRows.value.length < 2) {
    Dialog.alert('合算したい2つ以上のキーワードを選択してください')
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

  tableDataKey.value += 1
  checkedRows.value = []
}

const totalingDeleteRow = (rowdata: SummaryRow) => {
  totalingKeywordList.value = totalingKeywordList.value.filter((row) => row.ngramkeyword !== rowdata.ngramkeyword)
  tableDataKey.value += 1
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
