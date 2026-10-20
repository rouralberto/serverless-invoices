<template>
    <div class="app-progress-bar"
         :style="{
           width: `${state.percent}%`,
           opacity: state.visible ? 1 : 0,
           backgroundColor: state.failed ? config.failedColor : config.color,
           height: config.thickness,
         }"></div>
</template>

<script>
import progress from '@/services/progress.service';
import config from '@/config/progressbar.config';

export default {
  data() {
    return {
      state: progress.state,
      config,
    };
  },
};
</script>

<style>
.app-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;
  transition: width .2s, opacity .3s;
}
</style>
