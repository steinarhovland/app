<template>
  <div class="editor-content-wrapper" :class="{ fullscreen: isFullscreen, night: isBlackmode }">
    <editor-content v-show="!showSource" ref="editor" class="editor-content" :editor="editor" />
    <span
      v-if="showImageEdit && !showSource"
      class="options-toggler"
      :style="{
        top: getTopPosition(selectionPosition.target),
        left: getLeftPosition(selectionPosition.target)
      }"
      @click="toggleImageEdit"
    >
      <v-icon name="settings"></v-icon>
    </span>
    <ImageEdit
      :editor="editor"
      :update-value="updateValue"
      :toggle-edit="toggleImageEdit"
      :is-image-edit="editImage"
      :selection-position="selectionPosition"
    />
    <RawHtmlView
      v-if="showSource"
      :type="type"
      :value="!!parentJson ? parentJson : parentValue"
      :options="options"
      @input="updateValue"
    />
    <EmbedEdit
      v-if="showEmbedEdit && !showSource"
      :node="selectionPosition"
      :editor="editor"
      :update-value="
        () => {
          updateValue(editor.view.dom.innerHTML);
        }
      "
      :style="{
        top: getTopPosition(selectionPosition.target)
      }"
    />
  </div>
</template>
<script>
import { EditorContent } from "tiptap";
import ImageEdit from "./ImageEdit";
import EmbedEdit from "./EmbedEdit";
import RawHtmlView from "./RawHtmlView";

export default {
  components: {
    EditorContent,
    ImageEdit,
    EmbedEdit,
    RawHtmlView
  },
  props: {
    editor: {
      type: Object,
      required: true
    },
    options: {
      type: [String, Object],
      default: () => {}
    },
    type: {
      type: String,
      default: "html"
    },
    showSource: {
      type: Boolean,
      default: false,
      required: true
    },
    parentValue: {
      type: [String, Object],
      default: "" || {}
    },
    parentJson: {
      type: [String, Object],
      default: () => null
    },
    updateValue: {
      type: Function,
      default: () => {}
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    isBlackmode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editorHTML: "",
      editImage: false,
      showImageEdit: false,
      showEmbedEdit: false,
      selectionPosition: {
        pos: null,
        editorPos: null,
        alt: {
          value: null
        },
        classes: null,
        style: null,
        title: null,
        src: null,
        target: null
      }
    };
  },
  beforeUpdate() {
    if (this.showImageEdit) {
      this.editor.view.dom.onscroll = () => (this.showImageEdit = false);
    }
    if (this.showEmbedEdit) {
      this.editor.view.dom.onscroll = () => (this.showEmbedEdit = false);
    }
  },
  mounted() {
    this.$nextTick(function() {
      // creating observer outside of proseMirror context to direct eventListener interaction
      this.updateObserver();
    });
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  destroyed() {
    if (this.editor) {
      this.editor.destroy();
    }
  },
  methods: {
    toggleImageEdit() {
      return (this.editImage = !this.editImage);
    },
    getTopPosition($elem) {
      let editorTop = this.$refs.editor.$el.getBoundingClientRect().top;
      if (editorTop) {
        return $elem.getBoundingClientRect().top
          ? $elem.getBoundingClientRect().top -
              editorTop +
              ($elem.getBoundingClientRect().height / 2 + 70) +
              "px"
          : "19px";
      }
    },
    getLeftPosition($elem) {
      return $elem.getBoundingClientRect().width
        ? $elem.getBoundingClientRect().width / 2 - 12 + "px"
        : "0";
    },

    updateObserver: async function() {
      if (this.$refs.editor.$el && this.editor && !this.observer) {
        this.observer = new MutationObserver(mutations => {
          for (const m of mutations) {
            if (m.type === "attributes" && m.target.localName === "img") {
              this.selectionPosition = {
                title: m.target.attributes.title ? m.target.attributes.title.value : "",
                alt: m.target.attributes.alt ? m.target.attributes.alt.value : "",
                target: m.target,
                src: m.target.src,
                classes: m.target.className.includes("ProseMirror-selectednode")
                  ? m.target.className.replace(/ProseMirror-selectednode/gi, "")
                  : m.target.className,
                height: m.target.height,
                width: m.target.width
              };
              this.showImageEdit = true;
            } else if (
              m.type === "attributes" &&
              m.target.firstChild &&
              m.target.firstChild.localName === "iframe"
            ) {
              this.selectionPosition = {
                target: m.target.firstChild,
                style: m.target.firstChild.attributes.style
                  ? m.target.firstChild.attributes.style.value
                  : "",
                src: m.target.firstChild.src ? m.target.firstChild.src : "",
                className: m.target.firstChild.className ? m.target.firstChild.className : ""
              };
              this.showEmbedEdit = true;
            } else if (m.type !== "attributes") {
              this.showImageEdit = false;
              this.showEmbedEdit = false;
            }
          }
        });
      }
      await this.$nextTick(function() {
        // define detached observer for editor default html element
        if (this.$refs.editor.$el) {
          this.observer.observe(this.$refs.editor.$el, {
            nodeList: false,
            childList: true,
            subtree: true, // observe deep
            attributeFilter: ["class"] // filter attributes to observer for better performance
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.options-toggler {
  position: absolute;
  cursor: pointer;
  text-align: center;
  max-width: 300px;
  z-index: 1;
  transform: translateY(-50%);
  border: var(--input-border-width) solid var(----accent);
  border-radius: var(--border-radius);
  color: var(--off-white);
  padding: calc(var(--page-padding) / 8);
  transition: opacity 0.3s ease-in-out, right 0.2s ease-in-out;

  i {
    background-color: var(--accent);
    padding: calc(var(--page-padding) / 4);

    &:after {
      z-index: -1;
      content: "";
      position: absolute;
      width: 180px;
      height: 180px;
      background-color: var(--off-white);
      opacity: 0.5;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &.active {
    z-index: 1;
    opacity: 1;
    left: 0;
  }
}
</style>

<style lang="scss">
.editor-content-wrapper {
  min-height: 300px;
  transition: background-color var(--slow) ease-in-out, color var(--fast) ease-in-out;

  &.fullscreen {
    min-height: 100vh;

    &.night {
      background-color: var(--black);
    }

    .editor-content {
      //overflow-y: auto;
      margin-left: auto;
      margin-right: auto;
      width: 720px;
      max-width: 100%;
    }
  }
}

.editor-content {
  min-height: inherit;

  .ProseMirror {
    min-height: inherit;
    padding: var(--wysiwyg-padding);
    max-height: 60vh;
    overflow-y: auto;

    table {
      background-color: var(--white);
      border: solid var(--lighter-gray) 1px;
      width: 100%;

      tbody {
        tr,
        td {
          min-width: 70px;
          border: 1px solid var(--lighter-gray);
          transition: var(--slow) var(--transition);
          transition-property: border-color;

          &:focus,
          &:active,
          &:focus-within {
            border-color: var(--black);
          }
        }

        td {
          position: relative;

          &:after {
            z-index: 0;
            position: absolute;
            content: "";
            top: 0;
            right: 0;
            height: 100%;
            width: 5px;
            cursor: ew-resize;
          }
        }
      }

      border-spacing: 0;
      -webkit-border-horizontal-spacing: 0;
      -webkit-border-vertical-spacing: 0;

      .selectedCell {
        background-color: var(--lightest-gray);
      }
    }

    img {
      max-width: 100%;
    }

    code {
      display: inline-block;
      padding: 0 3px;
      font-family: var(--family-monospace);
      background-color: var(--lightest-gray);
      color: var(--dark-gray);
      border-radius: var(--border-radius);
      border: 1px solid var(--lighter-gray);
    }

    pre {
      max-width: 100%;
      overflow-x: scroll;
      margin: 3px auto;
    }

    blockquote {
      padding-left: 7px;
      border-left: 2px solid var(--lighter-gray);
      color: var(--light-gray);
      font-size: 140%;
    }

    a {
      cursor: pointer;
    }

    strong {
      font-weight: bolder;
    }

    h1 {
      font-size: calc(var(--size-1) * 2);
    }

    h2 {
      font-size: calc(var(--size-2) * 2);
    }

    h3 {
      font-size: calc(var(--size-3) * 2);
    }

    h4 {
      font-size: calc(var(--size-4) * 2);
    }

    p + p {
      margin-bottom: 0;

      &:last-of-type {
        margin-bottom: 15px;
      }
    }

    hr {
      background-color: var(--lightest-gray);
      height: 2px;
      border-color: transparent;
      margin-top: 5px;
      margin-bottom: 5px;
    }

    ul,
    ol {
      padding-left: 28px;
      margin-bottom: 20px;
    }

    .tableWrapper {
      max-width: 100%;
      overflow-x: auto;

      table {
        background-color: var(--white);
        border: solid var(--lighter-gray) 1px;
        width: 100%;

        tbody {
          tr,
          td {
            min-width: 70px;
            border: 1px solid var(--lighter-gray);
            transition: var(--slow) var(--transition);
            transition-property: border-color;

            &:focus,
            &:active,
            &:focus-within {
              border-color: var(--black);
            }
          }

          td {
            position: relative;

            &:after {
              z-index: 0;
              position: absolute;
              content: "";
              top: 0;
              right: 0;
              height: 100%;
              width: 5px;
              cursor: ew-resize;
            }
          }
        }

        border-spacing: 0;
        -webkit-border-horizontal-spacing: 0;
        -webkit-border-vertical-spacing: 0;
      }

      .selectedCell {
        background-color: var(--lightest-gray);
      }
    }
  }

  p.is-empty:first-child::before {
    content: attr(data-empty-text);
    float: left;
    color: #aaa;
    pointer-events: none;
    height: 0;
    font-style: italic;
  }
}
</style>
