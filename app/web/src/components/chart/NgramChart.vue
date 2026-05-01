<template>
  <div class="nchart">
    <div class="contents">
      <button v-if="showTrigger" class="button is-info" @click="clickbutton">出版年代の分布を見る</button>
      <ClientOnly>
        <line-chart v-if="dataload" :chart-data="datacollection" />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import LineChart from "~/src/components/chart/LineChart.js";
import type { SearchResult } from "~/composables/useSearchService";
import type { Ngramyear } from "~/src/domain/ngramyear";

const props = withDefaults(defineProps<{
  ss: SearchResult<Ngramyear> | null;
  isRate: boolean;
  visibleValue: number;
  yearRange: number[];
  yearfrequency: Record<string, number> | null;
  baseurl: string | null;
  query1url: string | null;
  query2url: string | null;
  querysuffix: string | null;
  autoLoad?: boolean;
  showTrigger?: boolean;
}>(), {
  autoLoad: true,
  showTrigger: false,
});

const colorcode = ["#FF2800", "#66CCFF", "#35A16B", "#663300", "#9A0079", "#FF99A0", "#C7B2DE", "#B4EBFA", "#EDC58F", "#FFD1D1"];
const datacollection = ref<any>(null);
const dataload = ref(false);

const canRender = computed(() => !!props.ss && !!props.yearfrequency);

const customCompare = (a: any, b: any) => a.x - b.x;

const buildData = async () => {
  await nextTick();
  if (!props.ss) return;
  const datasetsarray: any[] = [];
  for (let ii = 0; ii < Math.min(props.ss.list.length, props.visibleValue); ii++) {
    const ngramkeyword = props.ss.list[ii].ngramkeyword;
    const jsonobj = JSON.parse(props.ss.list[ii].ngramyearjson);
    const dataarray: any[] = [];
    const labelsarray = Object.keys(jsonobj);
    const countarray = Object.values(jsonobj);
    for (let j = 0; j < labelsarray.length; j++) {
      const year = Number(labelsarray[j]);
      if (year >= props.yearRange[0] && year <= props.yearRange[1]) {
        if (props.isRate) {
          const yearsum = props.yearfrequency?.[labelsarray[j]];
          if (yearsum) {
            dataarray.push({ x: new Date(year, 1, 1), y: Number(countarray[j]) / Number(yearsum) });
          }
        } else {
          dataarray.push({ x: new Date(year, 1, 1), y: countarray[j] });
        }
      }
    }
    dataarray.sort(customCompare).reverse();
    datasetsarray.push({
      label: ngramkeyword,
      data: dataarray,
      backgroundColor: colorcode[ii],
      borderColor: colorcode[ii],
      lineTension: 0.2,
      fill: false,
    });
  }

  datacollection.value = {
    datasets: datasetsarray,
    baseurl: props.baseurl,
    query1url: props.query1url,
    query2url: props.query2url,
    querysuffix: props.querysuffix,
  };
};

const clickbutton = async () => {
  await buildData();
  dataload.value = true;
};

watch(
  () => [props.ss, props.isRate, props.visibleValue, props.yearRange[0], props.yearRange[1], props.yearfrequency, props.baseurl, props.query1url, props.query2url, props.querysuffix],
  async () => {
    if (!canRender.value) {
      dataload.value = false;
      return;
    }
    await buildData();
    if (props.autoLoad) dataload.value = true;
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.nchart {
  .contents {
    width: 100%;
    height: 100%;
  }
}
</style>
