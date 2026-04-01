<template>
  <div class="nchart">
    <div class="contents">
      <b-button @click="clickButton">出版年代の分布を見る</b-button>
      <LineChart v-if="dataLoad" :chart-data="datacollection" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ChartData } from 'chart.js'
import type { Ngramyear } from '../../src/domain/ngramyear'
import type { SearchResult } from '../../src/service/search-service'
import LineChart from './LineChart.vue'

interface PointDatum {
  x: number
  y: number
}

interface Props {
  ss: SearchResult<Ngramyear>
}

const props = defineProps<Props>()

const datacollection = ref<ChartData<'line', PointDatum[]>>({ datasets: [] })
const dataLoad = ref(false)

const fillData = () => {
  const datasetsarray: Array<Record<string, unknown>> = []

  for (let ii = 0; ii < Math.min(props.ss.list.length, 5); ii += 1) {
    const item = props.ss.list[ii]
    const jsonobj = JSON.parse(item.ngramyearjson) as Record<string, number>
    const dataarray: PointDatum[] = Object.entries(jsonobj)
      .map(([year, count]) => ({ x: Number(year), y: Number(count) }))
      .sort((a, b) => a.x - b.x)

    const colorcode = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
    datasetsarray.push({
      label: item.ngramkeyword,
      data: dataarray,
      backgroundColor: colorcode,
      borderColor: colorcode,
      tension: 0,
      fill: false
    })
  }

  datacollection.value = { datasets: datasetsarray }
}

const clickButton = () => {
  fillData()
  dataLoad.value = true
}
</script>

<style scoped lang="scss">
@import "../../src/styles/_palette.scss";

.nchart {
  .contents {
    width: 100%;
    height: 100%;
  }
}
</style>
