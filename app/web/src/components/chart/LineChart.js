import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Chart from "chart.js";

export default defineComponent({
  name: "LineChart",
  props: {
    chartData: { type: Object, required: true },
  },
  setup(props) {
    const canvasRef = ref(null);
    let chart = null;

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      onClick(evt) {
        const activePoints = this.getElementsAtEventForMode(evt, "nearest", { intersect: true }, false);
        if (activePoints.length > 0) {
          const p = activePoints[0];
          const label = this.data.datasets[p._datasetIndex].label;
          const year = this.data.datasets[p._datasetIndex].data[p._index].x.getFullYear();
          const url = this.data.baseurl + label + this.data.query1url + year + this.data.querysuffix + this.data.query2url + year + this.data.querysuffix;
          window.open(url, "_blank", "noopener,noreferrer");
        }
      },
      title: { display: true, text: "出現頻度上位の分布" },
      tooltips: { mode: "nearest", intersect: false },
      scales: {
        xAxes: [{ display: true, scaleLabel: { display: true, labelString: "出版年代" }, type: "time", autoSkip: false, time: { unit: "year", displayFormats: { year: "YYYY" }, tooltipFormat: "YYYY" } }],
        yAxes: [{ display: true, scaleLabel: { display: false, labelString: "出現回数" }, autoSkip: false, ticks: { min: 0 } }],
      },
    };
    const render = () => {
      if (!canvasRef.value || !props.chartData) return;
      if (chart) chart.destroy();
      chart = new Chart(canvasRef.value.getContext("2d"), {
        type: "line",
	data: props.chartData,
        options,
      });
    };

    watch(() => props.chartData, render);
    onMounted(render);
    onBeforeUnmount(() => { if (chart) chart.destroy(); });

    return () => h("div", { style: "position:relative;height:420px;" }, [h("canvas", { ref: canvasRef })]);
  },
});
