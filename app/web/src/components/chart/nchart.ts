import { defineComponent, nextTick } from "vue";
import template from "./nchart.html?raw";
import { Ngramyear } from "domain/ngramyear";
import { SearchResult } from "../../service/search-service";
import "./nchart.scss";
import LineChart from "./LineChart.js";

export default defineComponent({
  name: "NchartPage",
  components: { LineChart },
  props: {
    ss: { type: Object as () => SearchResult<Ngramyear>, required: true },
  },
  data() {
    return {
      datacollection: {},
      dataload: false,
    };
  },
  methods: {
    async fillData() {
      await nextTick();
      const datasetsarray: any[] = [];
      for (let ii = 0; ii < Math.min(this.ss.list.length, 5); ii++) {
        const ngramkeyword = this.ss.list[ii].ngramkeyword;
        const jsonobj = JSON.parse(this.ss.list[ii].ngramyearjson);
        const dataarray: any[] = [];
        const labelsarray = Object.keys(jsonobj);
        const countarray = Object.values(jsonobj);
        for (let j = 0; j < labelsarray.length; j++) {
          dataarray.push({ x: new Date(Number(labelsarray[j]), 1, 1), y: countarray[j] });
        }
        dataarray.sort((a: any, b: any) => a.x - b.x).reverse();
        const colorcode = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        datasetsarray.push({
          label: ngramkeyword,
          data: dataarray,
          backgroundColor: colorcode,
          borderColor: colorcode,
          lineTension: 0,
          fill: false,
        });
      }
      this.datacollection = { datasets: datasetsarray };
    },
    async clickbutton() {
      await this.fillData();
      this.dataload = true;
    },
  },
  template,
});
