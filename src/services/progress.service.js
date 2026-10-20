import { reactive } from 'vue';

/**
 * Minimal replacement for vue-progressbar's `$Progress` API, rendered by AppProgressBar.
 */
class ProgressService {
  state = reactive({
    percent: 0,
    visible: false,
    failed: false,
  });

  timer = null;

  start() {
    clearInterval(this.timer);
    Object.assign(this.state, { percent: 0, visible: true, failed: false });
    this.timer = setInterval(() => {
      this.state.percent += (90 - this.state.percent) * 0.1;
    }, 100);
  }

  finish() {
    this.end(false);
  }

  fail() {
    this.end(true);
  }

  end(failed) {
    clearInterval(this.timer);
    Object.assign(this.state, { percent: 100, failed });
    this.timer = setTimeout(() => {
      this.state.visible = false;
    }, 300);
  }
}

export default new ProgressService();
