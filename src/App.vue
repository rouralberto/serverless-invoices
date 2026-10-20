<template>
    <div id="app"
         class="min-vh-100"
         :class="$route.name">
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component"/>
            </transition>
        </router-view>
        <notifications position="bottom center" classes="snackbar" width="332"/>
        <AppConfirm/>
    </div>
</template>

<script>
import AppConfirm from '@/components/ui/AppConfirm.vue';
import { raiseToasts } from '@/services/notification.service';

export default {
  name: 'app',
  components: {
    AppConfirm,
  },
  created() {
    this.pauseAnimationsUntilLoaded();
  },
  mounted() {
    raiseToasts();
  },
  methods: {
    jsLoaded() {
      document.body.classList.remove('js-loading');
    },
    pauseAnimationsUntilLoaded() {
      // The app mounts after translations load, which is often after the page's `load` event.
      if (document.readyState === 'complete') {
        return;
      }
      document.body.classList.add('js-loading');
      window.addEventListener('load', this.jsLoaded, { once: true });
    },
  },
};
</script>

<style lang="scss">
@import './assets/scss/variables';
@import 'bootstrap/scss/bootstrap';
@import './assets/scss/app';
</style>
