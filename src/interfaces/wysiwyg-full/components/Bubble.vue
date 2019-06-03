<template>
  <editor-menu-bubble v-if="editor" class="menububble" :editor="editor">
    <div
      slot-scope="{ commands, isActive, getMarkAttrs, menu }"
      class="menububble__frame"
      :visible="menu.isActive"
      :class="{ visible: menu.isActive && !showSource }"
      :style="
        `left:${menu.left - 210}px
        transform:translateX(${menu.left > calcWidth() ? '-50%' : '0'});
        bottom: ${menu.bottom + 10}px;
        width: ${calcWidth()}px;
        max-width: 100%;
        min-width: 220px;`
      "
    >
      <template v-if="buttons">
        <Menubar
          :options="options"
          :buttons="options.extensions"
          :editor="editor"
          :show-source="showSource"
          :toggle-source="toggleSource"
          :show-link="showLink"
          :toggle-link="toggleLink"
        />
      </template>
    </div>
  </editor-menu-bubble>
</template>
<script>
const Menubar = () => import("./MenuBar");
import { EditorMenuBubble } from "tiptap";
export default {
  components: {
    EditorMenuBubble,
    Menubar
  },

  props: {
    options: {
      type: [String, Object],
      defaultValue: () => {},
      required: true
    },
    buttons: {
      type: Array,
      defaultValue: [],
      required: true
    },
    editor: {
      type: Object,
      defaultValue: () => {},
      required: true
    },
    showSource: {
      type: Boolean,
      default: false
    },
    toggleSource: {
      type: Function,
      default: () => false
    },
    showLink: {
      type: Boolean,
      default: false
    },
    toggleLink: {
      type: Function,
      default: () => false
    }
  },

  methods: {
    calcWidth() {
      if (this.options.toolbarOptions) {
        return this.options.toolbarOptions.length * 24 + 120;
      }
    },
    setLinkUrl(command, url) {
      command({ href: url });
      this.hideLinkMenu();
      this.editor.focus();
    }
  }
};
</script>
<style lang="scss" scoped>
.menububble {
  position: absolute;
  background-color: var(--lightest-gray);
  padding: 0;
  opacity: 0;
  visibility: hidden;
  margin-top: -100vh;
  transition: top 0.2s ease-in-out, bottom 0.2s ease-in-out, left 0.2s ease-in-out,
    opacity 0.4s ease-in-out, opacity 0.3s ease-in-out;
  border-radius: var(--border-radius);

  &.visible {
    transform: translateY(0);
    visibility: visible;
    opacity: 1;
    z-index: 99;
  }

  .menubar__wrapper {
    border: var(--input-border-width) solid var(--lighter-gray);
    border-radius: var(--border-radius);
    .menubar {
      overflow-y: auto;
    }
  }
  .menubar__button.toggler {
    min-height: 34px;
    border-color: var(--darkest-gray);
    background-color: var(--darker-gray);
  }
}
</style>
