<template>
  <div
    :id="name"
    class="interface-wysiwyg-container editor"
    :class="{ fullscreen: distractionFree, night: blackMode }"
    :name="name"
  >
    <EditorContent
      v-if="editor"
      :options="options"
      :parent-value="mdMode ? stagedMD : editorHTML"
      :parent-json="editorJSON"
      :update-value="updateValue"
      :show-source="rawView"
      :editor="editor"
      :is-blackmode="blackMode"
      :is-fullscreen="distractionFree"
    />

    <Bubble
      v-if="editor"
      :options="options"
      :editor="editor"
      :buttons="options.extensions"
      :show-source="rawView"
      :show-link="linkBubble"
      :toggle-source="showSource"
      :toggle-link="toggleLinkBar"
    />

    <!--@todo how to get the field name of the field without $parent?-->
    <!--<p v-if="distractionFree" class="fullscreen-info">
      {{ $parent.$parent.field.name }}
    </p>-->

    <div class="options">
      <button
        v-if="rawView"
        v-tooltip="$t('interfaces-wysiwyg-go_back')"
        type="button"
        class="back"
        @click="showSource"
      >
        <v-icon name="code" />
      </button>
      <button
        v-if="distractionFree"
        v-tooltip="$t('interfaces-wysiwyg-dark_mode')"
        type="button"
        class="black-mode"
        @click="blackMode = !blackMode"
      >
        <v-icon name="iso" />
      </button>
      <button
        v-tooltip="
          !distractionFree
            ? $t('interfaces-wysiwyg-distraction_free_mode')
            : $t('interfaces-wysiwyg-distraction_free_mode_exit')
        "
        type="button"
        class="fullscreen-toggle"
        @click="distractionFree = !distractionFree"
      >
        <v-icon :name="!distractionFree ? 'fullscreen' : 'cancel'" />
      </button>
    </div>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";
import { Editor } from "tiptap";
import EditorContent from "./../wysiwyg-full/components/EditorContent";
import Bubble from "./../wysiwyg-full/components/Bubble";
import showdown from "showdown/dist/showdown.min";

import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
  TableHeader,
  TableRow,
  TableCell,
  Table
} from "tiptap-extensions";

import { Image, Span } from "./../wysiwyg-full/extensions";

export default {
  name: "InterfaceWysiwyg",
  components: {
    EditorContent,
    Bubble
  },
  mixins: [mixin],

  data() {
    return {
      blackMode: false,
      distractionFree: false,
      linkBubble: false,
      editorHTML: "",
      editorJSON: this.jsonMode ? (this.value ? this.value : {}) : null,
      stagedJSON: null,
      stagedMD: "",
      editor: null,
      rawView: false,
      showLinkBar: false
    };
  },

  computed: {
    jsonMode() {
      return this.options.output_format === "json";
    },

    htmlMode() {
      return this.options.output_format === "html";
    },

    mdMode() {
      return this.options.output_format === "md";
    },

    converter() {
      let conv = new showdown.Converter({
        tablesHeaderId: false,
        tables: false,
        strikethrough: true,
        omitExtraWLInCodeBlocks: true,
        backslashEscapesHTMLTags: false,
        emoji: true,
        simpleLineBreaks: true,
        metadata: true,
        underline: true,
        parseImgDimensions: false
      });
      return conv;
    }
  },

  watch: {
    value(newVal) {
      if (newVal && !this.rawView) {
        this.editorHTML = newVal;
      }

      if (this.type === "string") {
        // Saving a string schema when json mode is active
        if (this.$props.options.output_format === "json" && this.editorJSON) {
          this.editorHTML = JSON.stringify(this.editorJSON);
          this.$emit("input", this.editorHTML);
        }
      }

      if (this.rawView) {
        if (this.$props.options.output_format !== "json" && this.type === "string") {
          if (this.$props.options.output_format === "md") {
            this.$emit("input", newVal);
          } else {
            this.$emit("input", this.editorHTML ? this.editorHTML : newVal);
          }
        }
      }
    }
  },

  mounted() {
    this.initEditor();
  },
  beforeDestroy() {
    this.editor.destroy();
  },
  methods: {
    convertMarkdown($val) {
      if ($val) {
        // console.log(this.converter)
        // console.log(this.converter.getMetadata())
        // console.log(this.converter.getOptions())
        // this.converter.setOption("tables", false);
        // this.converter.setFlavor("github");
        this.stagedMD = this.converter.makeMd($val);
      }
    },
    convertHtml($val) {
      if ($val) {
        return this.converter.makeHtml($val);
      }
    },

    updateValue: function(value) {
      if (this.htmlMode) {
        if (value !== this.editorHTML) {
          this.editorHTML = value;
          this.editor.view.dom.innerHTML = value;
        }
        // remove empty value on toggle to raw mode and emit empty value to save in DB
        if (value === "<p><br></p>" || value === "<p></p>") {
          this.editorHTML = "";
          this.$emit("input", "");
        }
        // Override Json output for raw view mode in HTML mode
        if (this.type === "json") {
          this.editorJSON = value;
        }
      } else if (this.jsonMode) {
        if (!this.stagedJSON) {
          try {
            JSON.parse(value);
            this.editorJSON = JSON.parse(value);
            this.$emit("input", this.editorJSON);
          } catch (e) {
            this.$emit("input", value);
          }
        } else if (this.stagedJSON) {
          this.$emit("input", this.stagedJSON);
        }
      } else if (this.mdMode) {
        if (!this.rawView) {
          this.$emit("input", this.value);
        } else {
          this.editor.view.dom.innerHTML = this.convertHtml(this.editorHTML);
          this.editorHTML = value;
          this.$emit("input", value);
        }
      }
    },

    toggleLinkBar() {
      this.showLinkBar = !this.showLinkBar;
    },

    showSource: function() {
      if (!this.rawView && !this.jsonMode) {
        this.updateValue(this.editor.view.dom.innerHTML);
      }

      if (this.jsonMode) {
        if (this.rawView) {
          try {
            JSON.parse(this.value);
            this.editor.setContent(JSON.parse(this.value));
          } catch (e) {
            this.editor.setContent(this.value);
          }
        } else {
          this.updateValue(this.editorJSON);
        }
      }

      if (this.mdMode) {
        if (this.rawView) {
          this.stagedMD = this.editorHTML;
        } else {
          this.editor.view.dom.innerHTML = this.convertHtml(this.editorHTML);
        }
      }

      return (this.rawView = !this.rawView);
    },

    initEditor() {
      const extensions = this.options.extensions
        .map(ext => {
          switch (ext) {
            case "blockquote":
              return new Blockquote();
            case "bold":
              return new Bold();
            case "bullet_list":
              return [new ListItem(), new BulletList()];
            case "code":
              return new Code();
            case "code_block":
              return new CodeBlock();
            case "hardbreak":
              return new HardBreak();
            case "history":
              return new History();
            case "horizontal_rule":
              return new HorizontalRule();
            case "image":
              return new Image();
            case "italic":
              return new Italic();
            case "link":
              return new Link();
            case "ordered_list":
              return [new OrderedList(), new ListItem()];
            case "strike":
              return new Strike();
            case "table":
              return [new Table(), new TableHeader(), new TableCell(), new TableRow()];
            case "underline":
              return new Underline();
            case "span":
              return new Span();
            default:
              return new Heading();
          }
        })
        .filter(ext => ext)
        .flat();

      this.editorHTML = this.value ? this.value : "";

      // Handle raw json data in for string schema type
      let stringifiedJson = null;
      if (this.type === "string" && this.value) {
        if (this.jsonMode) {
          try {
            JSON.parse(this.value);
            this.editorJSON = JSON.parse(this.value);
          } catch (e) {
            console.warn(
              "Could not Parse JSON to HTML. Your field schema doesn`t match the editor mode. "
            );
          }
        } else if (this.htmlMode) {
          try {
            // try to convert JSON back to html, previously stored in md JSON mode
            JSON.parse(this.value);
            stringifiedJson = JSON.parse(this.value);
          } catch (e) {
            // try to convert markdown back to html, previously stored in MD mode
            try {
              stringifiedJson = null;
              this.editorHTML = this.convertHtml(this.value);
            } catch (e) {
              console.warn("Could not Parse JSON or Markdown.");
            }
          }
        } else if (this.mdMode) {
          stringifiedJson = null;
          this.stagedMD = this.editorHTML;
          this.editorHTML = this.convertHtml(this.editorHTML);
        }
      }

      // Init editor options block
      const options = {
        extensions: extensions
      };

      if (this.jsonMode) {
        options.content = this.editorJSON ? this.editorJSON : this.value;
        options.onUpdate = ({ getJSON }) => {
          this.editorJSON = getJSON();
          this.$emit("input", getJSON());
        };
      } else {
        options.content = stringifiedJson ? stringifiedJson : this.editorHTML;
        options.onUpdate = ({ getHTML, getJSON }) => {
          this.stagedJSON = getJSON();
          if (this.type === "json") {
            this.$emit("input", this.stagedJSON);
          } else {
            if (this.mdMode) {
              if (this.rawView) {
                this.$emit("input", this.editorHTML);
              } else {
                this.convertMarkdown(getHTML());
                this.$emit("input", this.stagedMD);
              }
            } else {
              this.$emit("input", getHTML());
            }
          }
        };
      }

      this.editor = new Editor(options);
    }
  }
};
</script>

<style lang="scss" scoped>
.interface-wysiwyg-container,
.interface-wysiwyg {
  position: relative;
  width: 100%;
  min-height: inherit;
  max-width: var(--width-x-large);
  --wysiwyg-padding: calc(var(--page-padding) / 2);
  border: var(--input-border-width) solid var(--lighter-gray);
  border-radius: var(--border-radius);
  -webkit-transition: border-color var(--fast) var(--transition);
  transition: border-color var(--fast) var(--transition), background-color var(--slow) ease-in-out,
    color var(--fast) ease-in-out;

  &.fullscreen {
    position: fixed;
    top: 31px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    max-width: 100%;
    max-height: 100%;
    background-color: var(--body-background);

    .editor__content {
      min-height: 100vh;
      textarea {
        min-height: inherit;
      }
    }
    .raw-editor {
      min-height: 100vh;
    }
    &:after {
      transition: inherit;
      content: "";
      z-index: -1;
      position: absolute;
      top: -33px;
      width: 100%;
      height: 35px;
      background-color: var(--darkest-gray);
    }
    &.night {
      &:after {
        background-color: var(--black);
      }

      .fullscreen-info {
        background-color: var(--darkest-gray);
      }
    }
  }
}

.options {
  position: absolute;
  z-index: 9;
  right: 0;
  top: 7px;

  .back {
    float: left;
  }
  > button {
    min-width: 40px;
  }
}

.fullscreen-info {
  position: absolute;
  padding-left: 10px;
  top: -48px;
  z-index: 1;
  width: 100%;
  padding-top: 24px;
  min-height: 24px;
  max-width: 100%;
  font-size: var(--size-2);
  padding-bottom: 6px;
  color: var(--darkest-gray);
  background-color: var(--body-background);
  transition: background-color var(--slow) ease-in-out, color var(--fast) ease-in-out,
    border-bottom 0.3s ease-in-out;
}
</style>
