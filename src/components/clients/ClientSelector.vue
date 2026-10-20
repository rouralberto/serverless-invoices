<template>
    <div class="search-popover__container">
        <div class="editable__item"
             :class="btnClasses"
             ref="button"
             :tabindex="tabindex"
             @click="toggleOpen">
            <span v-if="!value" class="d-print-none">{{ t('client') }}</span>
            <span v-else>{{ value }}</span>
        </div>
        <div class="search-popover__overlay" v-if="isOpen" @click="toggleOpen"></div>
        <div class="search-popover__select" v-show="isOpen">
            <input ref="input"
                   type="text"
                   class="form-control"
                   autocomplete="off"
                   role="combobox"
                   :aria-expanded="isOpen"
                   :placeholder="t('suggest_placeholder')"
                   :value="query"
                   @input="onInput"
                   @change="onChange"
                   @keydown.esc="toggleOpen"
                   @keydown.tab="toggleOpen"
                   @keydown.down.prevent="onKeyDown"
                   @keydown.up.prevent="onKeyUp"
                   @keydown.enter.exact.prevent="selectHighlighted"
                   @keydown.ctrl.enter="createNewClient">
            <div class="autosuggest__results-container">
                <div class="autosuggest__results" v-if="isOpen">
                    <ul role="listbox">
                        <li v-for="(client, index) in suggestions"
                            :key="client.id"
                            role="option"
                            class="autosuggest__results-item"
                            :class="{ 'autosuggest__results-item--highlighted': index === highlighted }"
                            :aria-selected="index === highlighted"
                            @mouseenter="highlighted = index"
                            @mousedown.prevent
                            @click="onSelected(client)">
                            <span>{{ client.company_name }}</span>
                        </li>
                    </ul>
                    <button class="btn btn-link mt-2"
                            ref="createNewButton"
                            @click="createNewClient"
                            @keydown.up="returnToSuggestions">
                        <i class="material-icons material-icons-round md-18">add</i>
                        {{ t('create') }} {{ query ? `"${query}"` : t('new') }}
                        <code class="ms-2 badge text-bg-secondary">ctrl + enter</code>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import { useClientsStore } from '@/store/clients';

export default {
  setup() {
    return useTranslation('client-selector');
  },
  props: {
    value: {},
    btnClass: {},
  },
  emits: ['input', 'change', 'selected'],
  data() {
    return {
      isOpen: false,
      query: '',
      tabindex: 0,
      highlighted: -1,
    };
  },
  computed: {
    ...mapStores(useClientsStore),
    ...mapState(useClientsStore, { clients: 'all' }),
    suggestions() {
      const query = String(this.query).toLowerCase();
      return (this.clients || [])
        .filter(client => !query || (client.company_name || '').toLowerCase()
          .indexOf(query) !== -1);
    },
    btnClasses() {
      return !this.value ? `text-muted ${this.btnClass}` : this.btnClass;
    },
  },
  watch: {
    suggestions() {
      this.highlighted = -1;
    },
  },
  methods: {
    toggleOpen() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },
    open() {
      this.isOpen = true;
      setTimeout(() => {
        this.tabindex = -1;
        this.$refs.input.focus();
      });
    },
    close() {
      this.isOpen = false;
      setTimeout(() => {
        this.tabindex = 0;
      });
      this.query = '';
      this.highlighted = -1;
    },
    onInput(event) {
      this.query = event.target.value;
      this.$emit('input', this.query);
    },
    onChange(event) {
      this.$emit('change', event.target.value);
    },
    onSelected(client) {
      if (client) {
        this.$emit('selected', client);
        this.close();
      }
    },
    selectHighlighted() {
      this.onSelected(this.suggestions[this.highlighted]);
    },
    async createNewClient() {
      if (this.query.length) {
        const client = await this.clientsStore.createNewClient({ company_name: this.query });
        this.$emit('selected', client);
      } else {
        this.clientsStore.openNewClientModal();
      }
      this.close();
    },
    onKeyDown() {
      if (this.suggestions.length === 0) {
        this.$refs.createNewButton.focus();
        return;
      }
      this.highlighted = Math.min(this.highlighted + 1, this.suggestions.length - 1);
    },
    onKeyUp() {
      this.highlighted = Math.max(this.highlighted - 1, -1);
    },
    returnToSuggestions() {
      this.$refs.input.focus();
    },
  },
};
</script>
