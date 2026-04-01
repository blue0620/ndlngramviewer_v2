<template>
  <Line :data="chartData" :options="options" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface PointDatum {
  x: number
  y: number
}

interface Props {
  chartData: ChartData<'line', PointDatum[]>
}

const props = defineProps<Props>()

const options = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  parsing: false,
  plugins: {
    title: {
      display: true,
      text: '出現頻度上位の分布'
    },
    tooltip: {
      mode: 'nearest',
      intersect: false
    }
  },
  scales: {
    x: {
      type: 'linear',
      title: {
        display: true,
        text: '出版年代'
      },
      ticks: {
        stepSize: 1,
        callback: (value) => String(value)
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: false,
        text: '出現回数'
      }
    }
  },
  onClick: (_event, activeElements, chart) => {
    if (activeElements.length === 0) return
    const point = activeElements[0]
    const dataset = chart.data.datasets[point.datasetIndex]
    const rawPoint = dataset.data[point.index] as PointDatum
    const baseurl = (chart.data as Record<string, string>).baseurl
    const query1url = (chart.data as Record<string, string>).query1url
    const query2url = (chart.data as Record<string, string>).query2url
    if (!baseurl || !query1url || !query2url) return

    const label = dataset.label ?? ''
    const year = rawPoint.x
    const url = `${baseurl}${label}${query1url}${year}-00-00${query2url}${year}-00-00`
    window.open(url)
  }
}))

const chartData = computed(() => props.chartData)
</script>
