<style lang="scss">
main {
  background: white;
}

.w1 {
  width: 10%;
}
.w2 {
  width: 20%;
}
.w3 {
  width: 30%;
}
.w6 {
  width: 60%;
}
.search-panel {
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.radio-list li {
  margin-right: 1rem;
  margin-bottom: 0.5rem;
}

.footer {
  .link {
    margin-right: 2rem;
  }
}
.inlineblock li{
   display: inline-block;
}
/* --- スライダー用のベース設定 --- */
.slider-container {
  /* ツールチップ（数値）が表示されるため、上部に余白を確保 */
  padding: 2rem 1rem 1rem;
  /* スライダーの未選択部分（背景）の色 */
  --slider-bg: #dbdbdb; 
}

/* --- 黄色のスライダー (対象とする出版年代の範囲) --- */
.slider-yellow {
  --slider-connect-bg: #E8B647; /* バーの選択部分の色 */
  --slider-tooltip-bg: #E8B647; /* ツールチップの背景色 */
  --slider-handle-ring-color: #E8B647; /* つまみクリック時の影の色 */
}

/* --- 黒色のスライダー (可視化対象の件数) --- */
.slider-dark {
  --slider-connect-bg: #363636; /* バーの選択部分の色 */
  --slider-tooltip-bg: #363636; /* ツールチップの背景色 */
  --slider-handle-ring-color: #363636; /* つまみクリック時の影の色 */
}
.custom-switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    display: none; // Hide the default checkbox
  }

  .switch-slider {
    position: relative;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 10px;
    margin-right: 10px;
    transition: background-color 0.3s;

    &::before {
      content: "";
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 8px;
      background-color: #fff;
      top: 2px;
      left: 2px;
      transition: transform 0.3s;
    }
  }

  input[type="checkbox"]:checked + .switch-slider {
    background-color: #2196F3;
  }

  input[type="checkbox"]:checked + .switch-slider::before {
    transform: translateX(20px);
  }

  .switch-label {
    font-size: 14px; // Adjust as needed
  }
}
</style>

<template>
  <div>
    <main>
      <section class="hero is-info">
        <div class="hero-body">
          <div class="container">
            <h1 class="title">NDL Ngram Viewer</h1>
            <h2 class="subtitle">国立国会図書館の提供するデジタル化資料のOCR全文テキストデータを利用したNgram Viewer</h2>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="notification" v-show="deleteNot">
            <button class="delete" @click="deleteNot=false"></button>
            <div class="content">
              国立国会図書館が提供する<a href="https://lab.ndl.go.jp/data_set/ocr/r3_line/">デジタル化資料のOCRテキスト化事業</a>の成果物である全文テキストを活用した実験サービスです。
              <br />OCRによって作成されたテキストデータから、出版年代ごとの出現頻度を可視化することができます。（可視化対象は、デフォルトでは総出現頻度上位5件です）
              <br />可視化グラフの縦軸は、年代ごとに何回出現したかを表す出現頻度と、出現頻度を出版年代ごとの総ngram数で割った値を表す出現比率の2種類を切り替えることができます。
              <p>2023年1月現在の対象は次の通りです。</p>
              <ul>
                <li>図書・雑誌資料約230万点（約17億種類の単語及びフレーズ)</li>
                <li>図書資料約97万点（約8.5億種類の単語及びフレーズ)</li>
                <li>雑誌資料約132万点（約8.9億種類の単語及びフレーズ)</li>
                <li>著作権保護期間満了の図書資料約28万点（約8.3億種類の単語及びフレーズ)</li>
              </ul>
              <br />図書については刊行年代が1960年代まで、雑誌については刊行年代が1990年代までの資料を主に対象としています。
              <br />・複数のキーワードをスラッシュ(/)区切りでクエリに指定することで、出現頻度を重ねて表示することができます。
              <br />例：「<a href="./?keyword=モダンガール%2Fモダンボーイ">モダンガール/モダンボーイ</a>」
              <br />
              <br />・正規表現を利用したクエリが可能です。
              <br />例：「<a href="./?keyword=平.盛">平.盛</a>」「<a href="./?keyword=風薫る.*">風薫る.*</a>」「<a href="./?keyword=.*温泉">.*温泉</a>」「<a href="./?keyword=%5B%5Eあ-んア-ン%5D%7B2,2%7D羊羹">[^あ-んア-ン]{2,2}羊羹</a>」
              <br />
              <details open><summary>利用可能な演算子一覧</summary>
                  <table class="table is-half">
                    <thead>
                      <tr>
                        <th class="w1">演算子</th>
                        <th class="w3">クエリ例</th>
                        <th class="w6">説明</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>.</td>
                        <td><a href="./?keyword=修.者" rel="noopener noreferrer">修.者</a></td>
                        <td>任意の1文字を表す</td>
                      </tr>
                      <tr>
                        <td>*</td>
                        <td><a href="./?keyword=日*精進" rel="noopener noreferrer">日*精進</a></td>
                        <td>直前の表現が0個以上あることを表す</td>
                      </tr>
                      <tr>
                        <td>+</td>
                        <td><a href="./?keyword=郵便局%2B長" rel="noopener noreferrer">郵便局+長</a></td>
                        <td>直前の表現が1個以上あることを表す</td>
                      </tr>
                      <tr>
                        <td>?</td>
                        <td><a href="./?keyword=巡査部?長" rel="noopener noreferrer">巡査部?長</a></td>
                        <td>直前の表現が0個か1個あることを表す</td>
                      </tr>
                      <tr>
                        <td>{,}</td>
                        <td><a href="./?keyword=私を.%7B2,3%7Dにする" rel="noopener noreferrer">私を.{2,3}にする</a></td>
                        <td>直前の文字の繰り返し回数の範囲を指定する。<br />例1：{2,4}：2回以上4回以下 <br />例2：{3,} ：3回以上 <br />例3：{,5} ：5回以下</td>
                      </tr>
                      <tr>
                        <td>[…]</td>
                        <td><a href="./?keyword=大正%5Bーア-ン%5D%7B6,%7D"  rel="noopener noreferrer">大正[ーア-ン]{6,}</a></td>
                        <td>ブラケット内の1文字を表す。「-」で範囲を、「^」で否定を表す。<br />例1：[abc]：a,b,cのうち1文字 <br />例2：[ア-ン]：アからンまでの1文字（カタカナいずれか1文字）<br /> 例3：[^ア-ン]：アからンまで以外の1文字（カタカナ以外の1文字）</td>
                      </tr>
                      <tr>
                        <td>(…)</td>
                        <td><a href="./?keyword=春の海ひねもす(のたり)*" rel="noopener noreferrer">春の海ひねもす(のたり)*</a></td>
                        <td>かっこで囲んだ範囲のグループを形成し、単一の文字として扱う。（他の演算子と組み合わせて用いる）</td>
                      </tr>
                      <tr>
                        <td>|</td>
                        <td><a href="./?keyword=ご%28機嫌%7Cきげん%29よう" rel="noopener noreferrer">ご(機嫌|きげん)よう</a></td>
                        <td>左辺または右辺の最長のパターンにマッチすることを表す</td>
                      </tr>
                    </tbody>
                  </table>
              </details>
              <ul>
                <li>【注意1】クエリにスラッシュ(/)が含まれる場合、正規表現は無効化されます。つまり複数キーワードクエリと正規表現クエリを併用することはできません。</li>
                <li>【注意2】処理の特性により、総出現頻度が10程度以下のものについては集計漏れが発生することがあります。</li>
                <li>【注意3】NDL Ngram Viewerの可視化対象は国立国会図書館デジタルコレクションの全文検索対象とほぼ同じですが、厳密に同じデータを参照するものではありません。クエリによっては差異が発生することがあります。</li>
                <li>【注意4】資料に含まれるキーワードの頻度を可視化するサービスであり、一つの資料に繰り返し同じキーワードが含まれる場合があるため、全文検索における検索ヒット件数（資料数）とは多くの場合異なります。</li>
                <li>【注意5】負荷対策のため、接頭及び接尾が両方とも正規表現で記述されたクエリは受け付けません。（受け付けない例：「.*テスト.*」）</li>
              </ul>
              <br />【技術情報】全文テキストデータに対して異体字等の丸め処理を行った後、NormalモードのKuromojiで形態素解析を行い、形態素gramで1gramから5gramまでの総出現頻度が4以上の単語及びフレーズを集計しています。
              <br />本サービスが利用しているデータセットを次のリンクから公開しています。
              <br />・NDL Ngram Data <a href="https://github.com/ndl-lab/ndlngramdata" target="_blank" rel="noopener noreferrer">https://github.com/ndl-lab/ndlngramdata <span>（※新しいタブで開きます）</span></a>
              <br />詳細については<a href="https://lab.ndl.go.jp/service/ngramviewer/" target="_blank" rel="noopener noreferrer">https://lab.ndl.go.jp/service/ngramviewer/ <span>（※新しいタブで開きます）</span></a>もご覧ください。
            </div>
          </div>
          <div class="search-panel">
            <section class="mb-4">
              <ul class="inlineblock radio-list">
                <li>
                  <label class="radio"><input type="radio" v-model="radiomtype" value="full">
                      図書・雑誌(※約230万資料から集計)
                  </label>
                </li>
                <li>
                  <label class="radio"><input type="radio" v-model="radiomtype" value="tosho-all">
                      図書のみ(※約97万資料から集計)
                  </label>
                </li>
                <li>
                  <label class="radio"><input type="radio" v-model="radiomtype" value="zasshi-all">
                      雑誌のみ(※約132万資料から集計)
                  </label>
                </li>
                <li>
                  <label class="radio"><input type="radio" v-model="radiomtype" value="tosho-pdm">
                      著作権保護期間満了図書のみ(※約28万資料から集計)
                  </label>
                </li>
              </ul>
            </section>
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  class="input is-info"
                  type="text"
                  title="可視化したいキーワードを入力する"
                  v-model="input"
                />
              </div>
              <div class="control">
                <button :disabled="empty || loading" class="button is-info" v-on:click="searchbutton()"><span>検索</span></button>
              </div>
            </div>
          </div>
          <div v-if="dataload==true&&pagefrom==0">
            <div class="columns">
              <div class="column">
                <label class="custom-switch">
                  <input type="checkbox" v-model="isRate" />
                  <span class="switch-slider"></span>
                  <span class="switch-label">
                    <span v-if="isRate">キーワードの出現比率を可視化（出版年代ごとの出現頻度/出版年代ごとの総対象Ngram数）</span>
                    <span v-else>キーワードの出現頻度を可視化</span>
                  </span>
                </label>
              </div>
            </div>
            <div class="columns">
              <div class="column is-two-thirds">
                <div class="slider-container slider-yellow">
                  <!-- yearRangeは配列 [開始, 終了] なので、自動的に2つのつまみになります -->
                  <Slider v-model="yearRange" :min="1801" :max="2023" />
                </div>
              </div>
              <div class="column">対象とする出版年代の範囲</div>
            </div>
            <div class="columns">
              <div class="column is-two-thirds">
                <div class="slider-container slider-dark">
                  <Slider v-model="visibleValue" :min="1" :max="10" />
                </div>
              </div>
              <div class="column">可視化対象の件数（デフォルトは上位5件）</div>
            </div>
            <ngram-chart
                  :ss="result"
                  :is-rate="isRate"
                  :visible-value="visibleValue"
                  :year-range="yearRange"
                  :yearfrequency="yearfrequencyjson"
                  :baseurl="ddbaseurl"
                  :query1url="ddquery1url"
                  :query2url="ddquery2url"
                  :querysuffix="ddquerysuffix"
                />
          </div>
          <div v-if="result!=null" >
            <div class="level-item is-size-7-touch level-left">{{ result.hit}}件ヒットしました</div>
            <div v-if="groupstr==null">
              <button class="button is-small" @click="isComponentModalActive = true">検索結果を編集する</button>
            </div>
            <div v-else>
              <button class="button is-primary is-small" disabled>編集後の検索結果</button>
            </div>
            
            <a :href="download()" target="_blank">⬇ <span>検索結果の出現頻度をダウンロード（最大10,000件）</span></a>
            <a :href="downloadfrequency()">⬇ <span>出版年代ごとの総対象ngram数の情報をダウンロード</span></a>
            <section>
              <ul class="inlineblock">
                <li>
                  <label><input type="radio" v-model="radiomtype" value="full">
                      図書・雑誌
                  </label>
                </li>
                <li>
                  <label><input type="radio" v-model="radiomtype" value="tosho-all">
                      図書のみ
                  </label>
                </li>
                <li>
                  <label><input type="radio" v-model="radiomtype" value="zasshi-all">
                      雑誌のみ
                  </label>
                </li>
                <li>
                  <label><input type="radio" v-model="radiomtype" value="tosho-pdm">
                      著作権保護期間満了図書のみ
                  </label>
                </li>
              </ul>
            </section>
            <div v-if="isComponentModalActive" class="modal is-active"><div class="modal-background" @click="closeModal"></div><div class="modal-content"><search-result-editor :input="input" :result="result" :is-rate="isRate" :visible-value="visibleValue" :year-range="yearRange" v-on:closemodal="closeModal"/></div><button class="modal-close is-large" aria-label="close" @click="closeModal"></button></div>
            <nav class="search-nav level level-right">
              <div class="level-right">
                <!-- ページネーション（そのまま） -->
                <search-pagination :proppagefrom="pagefrom" :allhits="result.hit" :pagesize="pagesize" :keyword="input" :materialtype="radiomtype" :groupstr="groupstr"></search-pagination>
                
                <!-- Bulmaの level-item を使って綺麗に横並びにする -->
                <div class="level-item ml-3">
                  表示件数
                </div>
                <div class="level-item">
                  <!-- Bulmaのセレクトボックススタイルを適用 -->
                  <div class="select is-small">
                    <!-- v-modelでpagesizeを直接バインドし、変更時にsearchbuttonを実行（ページを0に戻して再検索） -->
                    <select v-model="pagesize" @change="searchbutton()">
                      <option :value="100">100件</option>
                      <option :value="200">200件</option>
                      <option :value="500">500件</option>
                    </select>
                  </div>
                </div>
              </div>
            </nav>
            <table class="table is-fullwidth">
              <thead>
                <tr>
                  <th class="w6">キーワード</th>
                  <th class="w1">総出現頻度</th>
                  <th class="w3">URLリンク</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(vs,i) in result.list" :key="i">
                  <td>{{vs.ngramkeyword}}</td>
                  <td>{{vs.count}}</td>
                  <td>
                    <a v-if="radiomtype!='tosho-pdm'" :href="ddbaseurl+vs.ngramkeyword" target="_blank" rel="noopener noreferrer">国立国会図書館デジタルコレクションで検索</a>
                    <a v-else :href="ddbaseurl+vs.ngramkeyword" target="_blank" rel="noopener noreferrer">次世代デジタルライブラリーで検索</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <span class="link">
            <a href="https://www.ndl.go.jp/">国立国会図書館ホームページ</a>
          </span>
          <span class="link">
            <a href="https://lab.ndl.go.jp/">NDLラボ</a>
          </span>
          <br />
          <span lang="en">Copyright © 2022- National Diet Library, Japan. All Rights Reserved.</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Slider from '@vueform/slider';
import '@vueform/slider/themes/default.css';
import type { Ngramyear } from "~/src/domain/ngramyear";
import { useSearchService, SearchServiceError } from "~/composables/useSearchService";
import type { SearchResult } from "~/composables/useSearchService";
import SearchPagesize from "~/src/components/search/search-pagesize/search-pagesize";
import SearchPagination from "~/src/components/search/search-pagination/search-pagination.vue";
import SearchResultEditor from "~/src/components/search-result-editor/search-result-editor.vue"
import NgramChart from "~/src/components/chart/NgramChart.vue";

const route = useRoute();
const router = useRouter();
const input = ref("");
const groupstr = ref<string | null>(null);
const result = ref<SearchResult<Ngramyear> | null>(null);
const loading = ref(false);
const deleteNot = ref(true);
const visibleValue = ref(5);
const dataload = ref(false);
const pagesize = ref(100);
const pagefrom = ref(0);
const isRate = ref(false);
const isComponentModalActive = ref(false);
const yearRange = ref<number[]>([1860, 2022]);
const radiomtype = ref("full");
const yearfrequencyjson = ref<any>(null);
const ddbaseurl = ref<string | null>(null);
const ddquery1url = ref<string | null>(null);
const ddquery2url = ref<string | null>(null);
const ddquerysuffix = ref<string | null>(null);
const empty = computed(() => !input.value);
const { search, downloadurl, getyearfreq } = useSearchService();

const custom_compare = (a: any, b: any) => a.x - b.x;
const closeModal = () => (isComponentModalActive.value = false);
const editModeFunc = () => (isComponentModalActive.value = true);
const downloadfrequency = () => `https://lab.ndl.go.jp/dataset/ngramviewer/yearfrequency_${radiomtype.value}.tsv`;
const download = () => downloadurl(encodeURIComponent(input.value), radiomtype.value, groupstr.value);


let syncingFromCode = false;
const syncQuery = async () => {
  const query: Record<string, any> = { keyword: input.value, size: pagesize.value, from: pagefrom.value, materialtype: radiomtype.value };
  if (groupstr.value != null) query.groupstr = groupstr.value;
  syncingFromCode = true;
  await navigateTo({ query }, { replace: true });
  syncingFromCode = false;
};

const runSearch = async () => {
  if (!input.value) return;
  loading.value = true;
  dataload.value = false;
  if (radiomtype.value === "tosho-pdm") {
    ddbaseurl.value = "https://lab.ndl.go.jp/dl/fulltext?keyword=";
    ddquery1url.value = "&searchfield=contentonly&r-publishyear=";
    ddquery2url.value = ",";
    ddquerysuffix.value = "";
  } else {
    ddquery1url.value = "&publicationFrom=";
    ddquery2url.value = "&publicationTo=";
    ddquerysuffix.value = "-00-00";
    if (!radiomtype.value || radiomtype.value === "full") ddbaseurl.value = "https://dl.ndl.go.jp/search/searchResult?accessRestrictions=internet&accessRestrictions=ooc&accessRestrictions=inlibrary&collection=A00001&collection=A00002&fullText=true&itemToSearch_facet=fullText&eraType=AD&keyword=";
    else if (radiomtype.value === "tosho-all") ddbaseurl.value = "https://dl.ndl.go.jp/search/searchResult?accessRestrictions=internet&accessRestrictions=ooc&accessRestrictions=inlibrary&collection=A00001&fullText=true&itemToSearch_facet=fullText&eraType=AD&keyword=";
    else if (radiomtype.value === "zasshi-all") ddbaseurl.value = "https://dl.ndl.go.jp/search/searchResult?accessRestrictions=internet&accessRestrictions=ooc&accessRestrictions=inlibrary&collection=A00002&fullText=true&itemToSearch_facet=fullText&eraType=AD&keyword=";
  }
  await syncQuery();
  try {
    result.value = await search(encodeURIComponent(input.value), pagesize.value, pagefrom.value, radiomtype.value, groupstr.value);
    yearfrequencyjson.value = await getyearfreq(radiomtype.value);
    dataload.value = true;
  } catch (error) {
    const message = error instanceof SearchServiceError
      ? error.message
      : "エラーが発生しました。不正なクエリ文字列の可能性があります";
    window.alert(message);
    dataload.value = false;
  }
  loading.value = false;
};

const searchbutton = () => {
  if (input.value != null) {
    pagefrom.value = 0;
    groupstr.value = null;
    runSearch();
  }
};

watch(radiomtype, runSearch);
watch(() => route.query, async (query) => {
  if (syncingFromCode) return;
  input.value = Array.isArray(query.keyword) ? query.keyword.join(" ") : (query.keyword ?? "");
  groupstr.value = Array.isArray(query.groupstr) ? query.groupstr.join(" ") : (query.groupstr ?? null);
  if (query.size) pagesize.value = parseInt(Array.isArray(query.size) ? query.size[0] : query.size);
  if (query.from) pagefrom.value = parseInt(Array.isArray(query.from) ? query.from[0] : query.from);
  if (query.materialtype) radiomtype.value = Array.isArray(query.materialtype) ? query.materialtype[0] : query.materialtype;
  if (input.value) await runSearch();
}, { deep: true });

onBeforeMount(() => {
  const query = { ...route.query } as Record<string, any>;
  input.value = Array.isArray(query.keyword) ? query.keyword.join(" ") : query.keyword;
  groupstr.value = Array.isArray(query.groupstr) ? query.groupstr.join(" ") : query.groupstr;
  if (query.size) pagesize.value = parseInt(Array.isArray(query.size) ? query.size[0] : query.size);
  if (query.from) pagefrom.value = parseInt(Array.isArray(query.from) ? query.from[0] : query.from);
  if (query.materialtype) radiomtype.value = Array.isArray(query.materialtype) ? query.materialtype[0] : query.materialtype;
  if (input.value != null) runSearch();
});
</script>
