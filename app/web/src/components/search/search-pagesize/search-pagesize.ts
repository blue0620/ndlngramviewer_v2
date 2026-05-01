import { defineComponent, ref, watch } from "vue";
import template from "./search-pagesize.html?raw";

export default defineComponent({
  name: "SearchPagesize",
  props: {
    manual: { type: Boolean, default: false },
    proppagesize: { type: Number, required: true },
    keyword: { type: String, required: true },
    materialtype: { type: String, required: true },
    groupstr: { type: String, default: null },
  },
  setup(props) {
    const pagesize = ref(props.proppagesize);
    const values = ["100", "200", "500"];
    watch(() => props.proppagesize, (v) => { pagesize.value = v; });
    return { pagesize, values };
  },
  methods: {
    sizeChange(event: Event) {
      const target = event.target as HTMLSelectElement;
      this.pagesize = parseInt(target.value, 10);
      const pushobj: any = { query: { keyword: this.keyword, size: this.pagesize, from: 0, materialtype: this.materialtype } };
      if (this.groupstr != null) pushobj.query.groupstr = this.groupstr;
      this.$router.push(pushobj).catch(() => {});
    },
  },
  template,
});
