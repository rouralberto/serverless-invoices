<template>
    <div class="btn-group">
        <button ref="toggle"
                type="button"
                class="btn"
                :class="[`btn-${variant}`, size && `btn-${size}`, toggleClass]"
                :popovertarget="menuId"
                aria-haspopup="menu"
                :aria-expanded="isOpen">
            <slot name="button-content"/>
        </button>
        <ul :id="menuId"
            ref="menu"
            popover
            class="dropdown-menu"
            role="menu"
            @toggle="onToggle"
            @click="onMenuClick">
            <slot/>
        </ul>
    </div>
</template>

<script>
import { uuidv4 } from '@/utils/helpers';

/**
 * A Bootstrap-styled dropdown on top of the native Popover API, which handles opening,
 * light dismiss and Escape. Clicking a `.dropdown-item` closes it; form controls don't.
 */
export default {
  props: {
    variant: { type: String, default: 'link' },
    size: { type: String, default: null },
    toggleClass: { default: null },
    // Align the menu's right edge with the toggle (`end`) or its left edge (`start`).
    align: { type: String, default: 'end' },
  },
  data() {
    return {
      menuId: `dropdown-${uuidv4()}`,
      isOpen: false,
    };
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.position, true);
    window.removeEventListener('resize', this.position);
  },
  methods: {
    onToggle(event) {
      this.isOpen = event.newState === 'open';
      if (this.isOpen) {
        this.position();
        window.addEventListener('scroll', this.position, true);
        window.addEventListener('resize', this.position);
      } else {
        window.removeEventListener('scroll', this.position, true);
        window.removeEventListener('resize', this.position);
      }
    },
    position() {
      const toggle = this.$refs.toggle.getBoundingClientRect();
      const { menu } = this.$refs;
      const gap = 2;
      const fitsBelow = toggle.bottom + gap + menu.offsetHeight <= window.innerHeight;
      const top = fitsBelow ? toggle.bottom + gap : toggle.top - gap - menu.offsetHeight;
      const left = this.align === 'end' ? toggle.right - menu.offsetWidth : toggle.left;
      menu.style.top = `${Math.max(gap, top)}px`;
      menu.style.left = `${Math.max(gap, left)}px`;
    },
    onMenuClick(event) {
      if (event.target.closest('.dropdown-item')) {
        this.$refs.menu.hidePopover();
      }
    },
  },
};
</script>
