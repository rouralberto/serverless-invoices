<template>
    <div class="tabs">
        <div :class="navWrapperClass">
            <ul class="nav nav-tabs" :class="navClass" role="tablist">
                <li v-for="tab in tabs" :key="tab.key" class="nav-item" role="presentation">
                    <button type="button"
                            class="nav-link"
                            :class="{ active: tab.key === activeKey }"
                            role="tab"
                            :aria-selected="tab.key === activeKey"
                            @click="activeKey = tab.key">
                        {{ tab.title }}
                    </button>
                </li>
            </ul>
        </div>
        <div class="tab-content" :class="contentClass">
            <div class="tab-pane active" role="tabpanel">
                <slot :name="activeKey"/>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * Bootstrap-styled tabs. Pass `tabs` as [{ key, title }] and one named slot per key.
 */
export default {
  props: {
    tabs: { type: Array, required: true },
    navClass: { default: null },
    navWrapperClass: { default: null },
    contentClass: { default: null },
  },
  data() {
    return {
      activeKey: this.tabs[0]?.key,
    };
  },
};
</script>
