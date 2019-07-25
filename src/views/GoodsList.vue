<template>
  <div>
    <NavHeader></NavHeader>
    <NavBread>
      <span slot="bread">goods</span>
    </NavBread>
    <!-- <Button type="primary">iview按钮</Button> -->
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">Sort by:</span>
          <a
            href="javascript:void(0)"
            class="default cur"
          >Default</a>
          <a
            href="javascript:void(0)"
            class="price"
            @click="sortGoods"
          >Price <svg
              class="icon icon-arrow-short"
              v-bind:class="{'sort-up':!sortFlag}"
            >
              <use xlink:href="#icon-arrow-short"></use>
            </svg></a>
          <a
            href="javascript:void(0)"
            class="filterby stopPop"
            @click="showFilterPop"
          >Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div
            class="filter stopPop"
            id="filter"
            :class="{'filterby-show':filterBy}"
          >
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd><a
                  href="javascript:void(0)"
                  :class="{'cur':priceChecked=='all'}"
                  @click="getGoodsListall"
                >All</a></dd>
              <dd
                v-for="(item,index) in priceFilter"
                :key="index"
                @click="setPrice(index)"
              >
                <a
                  href="javascript:void(0)"
                  :class="{'cur':priceChecked==index}"
                >{{item.startPrice}}-{{item.endPrice}}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li
                  v-for="(item,index) in goodsList"
                  :key="index"
                >
                  <div class="pic">
                    <!-- 图片懒加载 -->
                    <a href="#"><img
                        v-lazy="'/../../static/'+item.productImage"
                        alt=""
                      ></a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice}}</div>
                    <div class="btn-area">
                      <a
                        href="javascript:;"
                        class="btn btn--m"
                        @click='addCart(item.productId)'
                      >加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>
              <!-- v使用ue-infinite-scroll插件来滚动加载 -->
              <div
                v-infinite-scroll="loadMore"
                infinite-scroll-disabled="busy"
                infinite-scroll-distance="10"
                class="loaderMore"
              >
                <img
                  src="./../assets/loading-spinning-bubbles.svg"
                  v-if="loading"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="md-overlay"
      v-show="overLayFlag"
      @click="closePop"
    ></div>
    <Modal
      v-bind:mdShow="mdShow"
      v-on:close="closeModal"
    >
      <!-- 将这里面的内容插入到子组件的插槽中 -->
      <p slot="message">

        请先登录，否则无法加入到购物车中!
      </p>
      <p slot="btnGroup">
        <a
          class="btn btn--m"
          href="javascript:;"
          @click="mdShow=false"
        >关闭</a>
      </p>
    </Modal>




    <Modal
      v-bind:mdShow="mdShowCart"
      v-on:close="closeModal"
    >
      <!-- 将这里面的内容插入到子组件的插槽中 -->
      <p slot="message">

        <span>加入购物车成功!</span>
      </p>
      <p slot="btnGroup">
        <a
          class="btn btn--m"
          href="javascript:;"
          @click="mdShowCart=false"
        >继续购物</a>
        <router-link
          class="btn btn--m"
          href="javascript:;"
          to="/cart"
        >查看购物车</router-link>
      </p>
    </Modal>
    <NavFooter></NavFooter>

  </div>
</template>
<style scoped>
/* 清楚浮动 */
.ccessory-list ul::after {
  clear: both;
  content: "";
  height: 0;
  display: block;
  visibility: hidden;
}
.loaderMore {
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.icon-arrow-short {
  width: 11px;
  height: 11px;
}
.sort-up {
  transform: rotate(180deg);
  transition: all 0.3s ease-out;
}
</style>

<script>
import "./../assets/css/base.css";
import "./../assets/css/product.css";
import NavHeader from "@/components/NavHeader.vue";
import NavFooter from "@/components/NavFooter.vue";
import NavBread from "@/components/NavBread.vue";
import Modal from "@/components/Modal";
import axios from "axios";
export default {
  data() {
    return {
      goodsList: [], //商品列表
      sortFlag: true, //排序标识
      page: 1, //页码
      pageSize: 8, //每页展示商品数量
      loading: false, //是否显示loading
      priceFilter: [
        {
          startPrice: "0.00",
          endPrice: "100.00"
        },
        {
          startPrice: "100.00",
          endPrice: "500.00"
        },
        {
          startPrice: "500.00",
          endPrice: "1000.00"
        },
        {
          startPrice: "1000.00",
          endPrice: "2000.00"
        }
      ],
      priceChecked: "all",
      filterBy: false,
      overLayFlag: false,
      busy: true, //是否默认滚动加载的标识true为禁用
      mdShow: false,
      mdShowCart:false
    };
  },
  components: {
    NavHeader,
    NavFooter,
    NavBread,
    Modal
  },
  mounted() {
    this.getGoodsList();
  },
  methods: {
    closeModal() {
      this.mdShow = false;
    },
    getGoodsList(flag) {
      //flag是分页的标识
      var param = {
        page: this.page,
        pageSize: this.pageSize,
        sort: this.sortFlag ? 1 : -1,
        priceLevel: this.priceChecked
      };
      this.loading = true;
      axios
        .get("/goods/list", {
          params: param //传data的时候要用params包起来
        })
        .then(result => {
          this.loading = false;
          var res = result.data.result.list;
          if (flag) {
            // 如果是加载分页，一页要显示所有加载出来的数据，所以要累加
            this.goodsList = this.goodsList.concat(result.data.result.list);
            if (result.data.result.count == 0) {
              //如果没有数据就禁用滚动加载
              this.busy = true;
            } else {
              this.busy = false;
            }
          } else {
            // 初始化时走的是这里，需要把加载给放开
            this.goodsList = res;
            this.busy = false;
          }
        });
    },
    getGoodsListall() {
      this.page = 1;
      this.pageSize = 10;

      this.priceChecked = "all";
      this.getGoodsList();
    },
    sortGoods() {
      this.sortFlag = !this.sortFlag;
      this.page = 1;
      this.getGoodsList();
    },
    showFilterPop() {
      this.filterBy = true;
      this.overLayFlag = true;
    },
    closePop() {
      this.filterBy = false;
      this.overLayFlag = false;
    },
    // 以价格来筛选
    setPrice(index) {
      this.priceChecked = index; //设置选中的位置
      this.page = 1; //从第一页开始
      this.getGoodsList();
      this.closePop();
    },

    loadMore() {
      this.busy = true;
      setTimeout(() => {
        this.page++; //滚动后就进入下一页
        this.getGoodsList(true);
      }, 500);
    },
    addCart(productId) {
      axios
        .post("/goods/addCart", {
          productId: productId
        })
        .then(res => {
          if (res.data.status === "0") {
          this.mdShowCart = true
          } else {
            //  alert("msg:"+res.data.msg)
            this.mdShow = true;
          }
        });
    }
  }
};
</script>
