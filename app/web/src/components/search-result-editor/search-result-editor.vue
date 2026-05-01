<template>
  <div class="search-result-editor">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">編集画面</p>
        <button type="button" class="delete" @click="handleCancel" />
      </header>
      <section class="modal-card-body">
        <line-chart :chart-data="datacollection"></line-chart>
        <div v-if="totalingkeywordlist.length > 0">
          <table class="table is-fullwidth">
            <thead><tr><th>合算キーワード</th><th>合算後の総頻度</th><th>キャンセル</th></tr></thead>
            <tbody>
              <tr v-for="row in totalingkeywordlist" :key="row.ngramkeyword">
                <td>{{ row.ngramkeyword }}</td><td>{{ row.count }}</td>
                <td><button class="button is-small is-danger" @click.prevent="totalingDeleteRow(row)">削除</button></td>
              </tr>
            </tbody>
          </table>
          <button class="button is-success" @click="totalingResult">合算結果を含めたリンクを取得する</button>
          <button class="button is-info" @click="totalingDownload">合算結果を含めたTSVを取得する</button>
        </div>
        <table class="table is-fullwidth">
          <thead><tr><th></th><th>キーワード</th><th>総頻度</th></tr></thead>
          <tbody>
            <tr v-for="row in resultkeywordlist" :key="row.ngramkeyword">
              <td><input type="checkbox" :checked="checkedRows.includes(row)" @change="$event.target.checked ? checkedRows.push(row) : checkedRows = checkedRows.filter(r => r !== row)"></td>
              <td>{{ row.ngramkeyword }}</td><td>{{ row.count }}</td>
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

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import LineChart from "../chart/LineChart.js";
import yearfrequencyjson from "../../yearfrequency.json";
import { downloadurl } from "../../service/search-service";
import { buildGroupStrFromIdxArrays, createTotalingSummary, validateCanTotal } from "./search-result-editor-utils";

export default defineComponent({
  name: "SearchResultEditor",
  components: { LineChart },
  props: {
    result: { type: Object, required: true },
    visibleValue: { type: Number, required: true },
    yearRange: { type: Array as () => number[], required: true },
    isRate: { type: Boolean, required: true },
    input: { type: String, required: true },
  },
  data() {
    return {
      resultkeywordlist: [] as any[],
      totalingkeywordlist: [] as any[],
      checkedRows: [] as any[],
      tableDataKey: 0,
      resultcolumns: [
        { field: "ngramkeyword", label: "キーワード" },
        { field: "count", label: "総頻度" },
      ],
      datacollection: null as any,
    };
  },
  watch: {
    totalingkeywordlist: {
      handler() {
        this.fillData();
      },
      deep: true,
    },
  },
  mounted() {
    this.fillData();
  },
  methods: {
    async fillData() {
      await nextTick();
      const datasetsarray: any[] = [];
      const colorcode = ["#FF2800", "#66CCFF", "#35A16B", "#663300", "#9A0079", "#FF99A0", "#C7B2DE", "#B4EBFA", "#EDC58F", "#FFD1D1"];
      const tmpresultlist: any[] = this.result.list.concat(this.totalingkeywordlist);
      tmpresultlist.sort(this.custom_compare_count).reverse();

      for (let ii = 0; ii < Math.min(tmpresultlist.length, this.visibleValue); ii++) {
        const ngramkeyword = tmpresultlist[ii].ngramkeyword;
        const jsonobj = JSON.parse(tmpresultlist[ii].ngramyearjson);
        const dataarray: any[] = [];
        const labelsarray = Object.keys(jsonobj);
        const countarray = Object.values(jsonobj);
        for (let j = 0; j < labelsarray.length; j++) {
          if (Number(labelsarray[j]) >= this.yearRange[0] && Number(labelsarray[j]) <= this.yearRange[1]) {
            if (this.isRate) {
              const yearsum = (yearfrequencyjson as any)[labelsarray[j]];
              dataarray.push({ x: new Date(Number(labelsarray[j]), 1, 1), y: Number(countarray[j]) / Number(yearsum) });
            } else {
              dataarray.push({ x: new Date(Number(labelsarray[j]), 1, 1), y: countarray[j] });
            }
          }
        }
        dataarray.sort(this.custom_compare).reverse();
        datasetsarray.push({
          label: ngramkeyword,
          data: dataarray,
          backgroundColor: colorcode[ii],
          borderColor: colorcode[ii],
          lineTension: 0.2,
          fill: false,
        });
      }

      this.datacollection = { datasets: datasetsarray };
      this.resultkeywordlist = [];
      for (let ii = 0; ii < this.result.list.length; ii++) {
        const obj = this.result.list[ii];
        obj.idx = ii;
        this.resultkeywordlist.push(obj);
      }
    },
    handleCancel() {
      this.$emit("closemodal");
    },
    totaling() {
      if (validateCanTotal(this.checkedRows)) {
        const summaryobj = createTotalingSummary(this.checkedRows);
        if (summaryobj != null) {
          this.totalingkeywordlist.push(summaryobj);
          this.tableDataKey++;
          this.checkedRows = [];
        }
      } else {
        window.alert("合算したい2つ以上のキーワードを選択してください");
      }
    },
    totalingDeleteRow(rowdata: any) {
      let idx = -1;
      for (let ii = 0; ii < this.totalingkeywordlist.length; ii++) {
        if (this.totalingkeywordlist[ii].ngramkeyword === rowdata.ngramkeyword) idx = ii;
      }
      this.totalingkeywordlist.splice(idx, 1);
      this.tableDataKey++;
    },
    totalingResult() {
      const groupstr = buildGroupStrFromIdxArrays(this.totalingkeywordlist.map((row) => row.idxarray));
      const url = new URL(window.location.href);
      url.searchParams.set("groupstr", groupstr);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    },
    totalingDownload() {
      const groupstr = buildGroupStrFromIdxArrays(this.totalingkeywordlist.map((row) => row.idxarray));
      window.open(downloadurl(encodeURIComponent(this.input), null, groupstr), "_blank", "noopener,noreferrer");
    },
    custom_compare(a: any, b: any) { return a.x - b.x; },
    custom_compare_count(a: any, b: any) { return a.count - b.count; },
  },
});
</script>
