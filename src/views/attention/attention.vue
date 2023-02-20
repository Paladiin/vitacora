<template>
    <div class="attention">
      <Plate-item v-for="(item, index) in infos"
      :key="index"
      :info="item"
      :index="index"
      :query="query"></Plate-item>
    </div>
</template>

<script>
import PlateItem from "@/components/plateItem/plateItem";
import api from "@/service/stocksApi";

export default {
  data() {
    return {
      infos: [],
      query: {
        skin: 0,
        type: 0
      }
    };
  },
  created() {
    const themeType = Number(this.$route.query.skin);
    if (themeType) {
      document.querySelector("#app").setAttribute("class", "night-theme");
      document.body.style.background = "#0F1322";
    }
    localStorage.setItem("__THEME_TYPE__", themeType);
    this._initData();
    this._ViewStyle();
  },
  methods: {
    _initData() {
      api.getTodayChance().then(res => {
        if (res.code === 20000) this.infos = res.data.splice(0, 5);
      });
    },
    _ViewStyle(type = 0, skin = 0) {
      this.query = {
        type: this.$route.query.type || type,
        skin: this.$route.query.skin || skin
      };
    }
  },
  components: {
    PlateItem
  }
};
</script>

<style lang="scss">
</style>
