<template>
    <div id="app"
         class="min-vh-100"
         :class="$route.name">
        <AppProgressBar/>
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component"/>
            </transition>
        </router-view>
        <notifications position="bottom center" classes="snackbar" width="332"/>
        <BOrchestrator/>
    </div>
</template>

<script>
import { mapWritableState } from 'pinia';
import { BOrchestrator, useModal } from 'bootstrap-vue-next';
import AppProgressBar from '@/components/AppProgressBar.vue';
import ConfirmService from '@/services/confirm.service';
import { useThemesStore } from '@/store/themes';

export default {
  name: 'app',
  components: {
    AppProgressBar,
    BOrchestrator,
  },
  setup() {
    ConfirmService.init(useModal());
  },
  computed: {
    ...mapWritableState(useThemesStore, ['theme']),
  },
  created() {
    this.pauseAnimationsUntilLoaded();
  },
  mounted() {
    this.initColorScheme();
  },
  methods: {
    jsLoaded() {
      document.body.classList.remove('js-loading');
    },
    pauseAnimationsUntilLoaded() {
      document.body.classList.add('js-loading');
      window.addEventListener('load', this.jsLoaded, false);
    },
    initColorScheme() {
      // local storage is used to override OS theme settings
      if (localStorage.getItem('theme')) {
        if (localStorage.getItem('theme') === 'dark') {
          this.theme = 'dark';
          return document.documentElement.setAttribute('data-theme', 'dark');
        }
      } else if (!window.matchMedia) {
        // matchMedia method not supported
        return false;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // OS theme setting detected as dark
        this.theme = 'dark';
        return document.documentElement.setAttribute('data-theme', 'dark');
      }
      document.documentElement.setAttribute('data-theme', this.theme || 'light');
    },
  },
};
</script>

<style lang="scss">
@import './assets/scss/variables';
@import 'bootstrap/scss/bootstrap';
@import './assets/scss/app';
</style>
