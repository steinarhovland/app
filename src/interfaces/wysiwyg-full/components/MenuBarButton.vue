<template>
  <button
    :style="{
      order: orderIndex
    }"
    class="menubar__button"
    :class="{ 'is-active': !!activeCondition }"
    @click="command"
  >
    <span v-if="!!supIcon || !!supType" :class="'sup ' + supType">
      <v-icon
        class="small"
        :size="16"
        :name="supType === 'add' && !supIcon ? 'add_circle' : 'remove_circle' || supIcon"
      />
    </span>
    <span v-if="label" class="label">{{ label }}</span>
    <v-icon
      v-if="!!name && !icon"
      class="icon"
      :name="toolbarIcons[name] ? toolbarIcons[name] : name"
    />
    <v-icon v-else-if="!!icon" class="icon" :name="icon" />
  </button>
</template>
<script>
export default {
  name: "MenuBarButton",
  props: {
    icon: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: ""
    },
    supType: {
      type: String,
      default: ""
    },
    supIcon: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    pluginName: {
      type: String,
      default: null
    },
    command: {
      type: Function,
      default: () => {}
    },
    activeCondition: {
      type: Boolean,
      default: false
    },
    orderIndex: {
      type: Number,
      default: -1
    }
  },

  computed: {
    toolbarIcons() {
      return {
        bold: "format_bold",
        strike: "format_strikethrough",
        underline: "format_underline",
        code: "code",
        code_block: "settings_ethernet",
        italic: "format_italic",
        paragraph: "subject",
        bullet_list: "format_list_bulleted",
        ordered_list: "format_list_numbered",
        blockquote: "format_quote",
        horizontal_rule: "maximize",
        hard_break: "wrap_text",
        table: "table_chart",
        span: "format_shapes",
        iframe: "filter_frames"
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.menubar__button:not(.toggler) {
  position: relative;
  height: 34px;
  min-width: 30px;
  span,
  .icon {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, calc(-50% - 1px));
    color: var(--light-gray);
    transition: color 0.15s ease-in-out;
  }
  .label {
    top: calc(50%);
    left: calc(50%);
    transform: translate(-50%, -50%);
    font-size: 8px;
    letter-spacing: -1px;
  }

  i {
    top: calc(50% + 4px);
    left: calc(50% + 2px);
    color: inherit;
    position: absolute;
    transform: translate(-50%, -50%);
  }

  .sup {
    height: 12px;
    width: 12px;
    position: absolute;
    color: var(--warning);
    z-index: 1;
    font-size: 12px;
    top: 50%;
    left: 0;
    transform: translate(0, calc(-50%));

    &.add {
      color: var(--success);
    }

    &.remove {
      color: var(--danger);
    }

    i {
      height: 12px;
      width: 12px;
      font-size: 16px;
    }
  }
  &.is-active,
  &:hover,
  &:focus {
    * {
      color: var(--dark-gray);
    }
  }

  &.is-active {
    span {
      color: var(--accent);
    }
  }

  &[disabled="disabled"] {
    i {
      color: var(--lighter-gray);
      opacity: 0.6;
    }
    cursor: no-drop;
  }
}
</style>
