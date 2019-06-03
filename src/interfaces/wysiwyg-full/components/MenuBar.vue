<template>
  <div class="menubar__wrapper">
    <editor-menu-bar :editor="editor">
      <div
        slot-scope="{ commands, isActive, getMarkAttrs }"
        class="menubar"
        :class="{
          'options-is-open': optionsInclude('table') ? isActive.table() : false
        }"
      >
        <!-- loop for basic buttons  -->
        <MenuButton
          v-for="(button, i) in preparedButtons(buttons)"
          :key="i + button"
          v-tooltip="$tc('editor.' + button)"
          :name="button"
          :label="getLabelConditions(button)"
          :order-index="optionsIndex(button)"
          :command="commands[button] ? commands[button] : () => commands[button]"
          :active-condition="isActive[button] ? isActive[button]() : false"
          :disabled="showSource"
        ></MenuButton>
        <!-- unique buttons (excluded in loop before) -->
        <MenuButton
          v-if="optionsInclude('link')"
          v-tooltip.bottom="$t('editor.link')"
          :order-index="optionsIndex('link')"
          :command="setLink"
          name="link"
          :active-condition="showLink || isActive.link()"
          :disabled="showSource"
        />
        <MenuButton
          v-if="optionsInclude('image')"
          v-tooltip.bottom="$t('editor.image')"
          :order-index="optionsIndex('image')"
          name="image"
          :command="() => (chooseImage = !chooseImage)"
          :active-condition="chooseImage"
          :disabled="showSource"
        />
        <!-- headings -->
        <template v-for="n in 6">
          <template v-if="optionsInclude('h' + n)">
            <MenuButton
              :key="n"
              v-tooltip.bottom="$tc('editor.heading', { level: n }) + ' ' + n"
              :order-index="optionsIndex('h' + n)"
              :label="'H' + n"
              :command="() => commands.heading({ level: n })"
              :active-condition="isActive.heading({ level: n })"
              :disabled="showSource"
            />
          </template>
        </template>
        <!-- table button -->
        <MenuButton
          v-if="optionsInclude('table')"
          v-tooltip.bottom="$t('editor.table')"
          :order-index="optionsIndex('table')"
          name="table"
          :command="
            () =>
              commands.createTable({
                rowsCount: 3,
                colsCount: 3,
                withHeaderRow: options.table_header
              })
          "
          :active-condition="isActive.table()"
          :disabled="showSource"
        />
        <!-- table toolbar -->
        <div
          v-if="optionsInclude('table') && !showSource ? isActive.table() : false"
          class="table-options"
          :class="{ 'is-open': isActive.table(), visible: !hideTableOptions }"
        >
          <MenuButton icon="border_left" :command="commands.deleteTable" sup-type="remove" />
          <MenuButton icon="border_left" :command="commands.addColumnBefore" sup-type="add" />
          <MenuButton icon="border_right" sup-type="add" :command="commands.addColumnAfter" />
          <MenuButton icon="border_outer" sup-type="remove" :command="commands.deleteColumn" />
          <MenuButton icon="border_top" sup-type="add" :command="commands.addRowBefore" />
          <MenuButton icon="border_bottom" sup-type="add" :command="commands.addRowAfter" />
          <MenuButton icon="border_horizontal" sup-type="remove" :command="commands.deleteRow" />
          <MenuButton icon="merge_type" :command="commands.toggleCellMerge" />
          <span @click="hideTableOptions = !hideTableOptions">
            <MenuButton icon="table_chart"></MenuButton>
          </span>
        </div>
        <!-- right aligned option buttons -->
        <div
          v-if="optionsInclude('history')"
          class="history__actions toggler"
          :style="{
            order: 95
          }"
        >
          <MenuButton icon="undo" :command="commands.undo" :disabled="showSource" />
          <MenuButton
            class="menubar__button"
            icon="redo"
            :command="commands.redo"
            :disabled="showSource"
          />
        </div>
        <button
          v-tooltip.bottom="$t('editor.view_source')"
          class="menubar__button source-toggle toggler"
          :style="{
            order: '99'
          }"
          @click="toggleSource"
        >
          <v-icon name="code" :color="showSource ? 'accent' : 'light-gray'" />
        </button>
        <!-- link bar -->
        <template v-if="optionsInclude('link') && showLink">
          <LinkBar
            v-show="!showSource && showLink"
            :commands="commands"
            :get-mark-attrs="getMarkAttrs"
            :toggle-link="toggleLink"
            :is-active="isActive.link()"
            :editor="editor"
          />
        </template>
      </div>
    </editor-menu-bar>
    <!-- image selection modal interface  -->
    <portal v-if="chooseImage" to="modal">
      <v-modal
        ref="imageModal"
        :title="$t('choose_one')"
        :buttons="{
          done: {
            text: $t('done'),
            disabled: !imageUrlRaw || (imageUrlRaw && imageUrlRawBroken)
          }
        }"
        @close="chooseImage = false"
        @done="insertImageUrl(imageUrlRaw)"
      >
        <div class="interface-wysiwyg-modal-url-input" :class="{ 'is-active': imageUrlRaw }">
          <v-input
            v-model="imageUrlRaw"
            placeholder="Paste url to image or select an existing"
            @input="imageUrlRawBroken = false"
          ></v-input>
          <div v-if="imageUrlRaw" class="interface-wysiwyg-modal-url-preview">
            <v-icon
              v-if="imageUrlRawBroken"
              class="material-icons error icon"
              name="broken_image"
            ></v-icon>
            <img
              v-else
              :src="imageUrlRaw"
              alt="preview-url-image"
              class="image"
              @error="imageUrlRawBroken = true"
            />
          </div>
        </div>
        <!-- @todo make selection better (sorting, file selection, multiples, file upload, upload path) -->
        <v-items
          v-if="imageUrlRaw === ''"
          collection="directus_files"
          view-type="cards"
          :filters="viewOptions.defaultFilters"
          :selection="[]"
          :view-options="viewOptions"
          @select="insertItem($event[0])"
        ></v-items>
      </v-modal>
    </portal>
  </div>
</template>
<script>
import MenuButton from "./MenuBarButton";
import { EditorMenuBar } from "tiptap";
import LinkBar from "./LinkBar";

export default {
  components: {
    EditorMenuBar,
    LinkBar,
    MenuButton
  },
  props: {
    options: {
      type: Object,
      defaultValue: {},
      required: true
    },
    editor: {
      type: Object,
      defaultValue: {},
      required: true
    },
    buttons: {
      type: Array,
      defaultValue: []
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
  data() {
    return {
      chooseImage: false,
      imageUrlRaw: "",
      imageUrlRawBroken: false,
      buttonsSimple: [],
      hideTableOptions: false,
      viewOptions: {
        title: "title",
        subtitle: "type",
        content: "description",
        src: "data",
        defaultFilters: [
          {
            field: "type",
            operator: "contains",
            value: "image"
          }
        ]
      }
    };
  },

  methods: {
    setLink() {
      this.toggleLink();
    },

    checkMove(evt) {
      console.log(evt);
      return console.log(evt);
    },
    optionsInclude($val) {
      return this.$props.buttons.includes($val);
    },
    optionsIndex($val) {
      return this.$props.buttons.indexOf($val);
    },
    getLabelConditions($val) {
      // check for h1 - h2
      let pattern = /\/?h[1-6]/gi;
      let str = pattern.test($val) ? $val : null;
      return str ? str.toUpperCase() : null;
    },
    preparedButtons($val) {
      let btn = $val;
      // list to exclude exceptional buttons
      let exclude = ["image", "link", "history", "table", "h1", "h2", "h3", "h4", "h5", "h6"];

      for (let i = 0; i < exclude.length; i++) {
        btn = btn.filter(e => e !== exclude[i]);
      }

      return btn;
    },

    addImageCommand(data) {
      if (data.command !== null && !this.imageUrlRaw) {
        this.editor.commands.image({
          src: data.full_url
        });
        this.chooseImage = false;
      } else if (data.command !== null && this.imageUrlRaw !== "") {
        this.editor.commands.image({
          src: this.imageUrlRaw
        });
        this.chooseImage = false;
      }
    },
    insertItem(item) {
      let image;
      image = item.data ? item.data : null;

      if (this.$props.options && !!this.$props.options.custom_url === undefined) {
        image = `${this.$props.options.custom_url}${item.data.filename}`;
      }
      // // @todo implement image source base url
      // const index = (this.editor.getSelection() || {}).index || this.editor.getLength();
      if (image) {
        this.addImageCommand(image);
      }
    },

    insertImageUrl(image) {
      if (image !== "") {
        this.chooseImage = false;
        this.addImageCommand(image);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.menubar__wrapper {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  color: var(--gray);
  background-color: var(--off-white);
  transition: var(--fast) var(--transition);
  transition-property: color, border-color;
  padding-top: 0;

  .menubar {
    position: relative;
    z-index: 2;
    min-height: 34px;
    display: flex;
    flex-flow: row wrap;
  }
}

.table-options {
  position: absolute;
  right: 1px;
  opacity: 0;
  z-index: 1;
  background-color: var(--off-white);
  border: 0;
  box-shadow: 0 0 2px var(--dark-gray);
  border-radius: 0;
  color: var(--lightest-gray);
  left: auto;
  transition: var(--fast) var(--transition);
  transition-property: color, border-color;
  top: 0;
  height: 34px;

  &.is-open {
    opacity: 1;
  }
  width: auto;

  > button {
    display: none;
    position: absolute;
    right: 0;
  }

  &.visible {
    > button {
      display: inline-block;
    }
  }
}

.toggler {
  height: 31px;
  width: 31px;
  text-align: center;
  margin-left: auto;
}

.history__actions {
  display: inline-flex;
  margin-left: auto;
  width: initial;

  + .toggler {
    margin-left: initial;
  }
}

.editor__button {
  cursor: pointer;
}

.layout-cards {
  .toolbar {
    display: none !important;
  }

  .cards {
    padding-top: 0;
  }

  max-height: calc(100% - 128px);
}

.modal-container {
  .interface-wysiwyg-modal-url-input {
    margin: var(--page-padding);

    &.is-active {
      height: 100%;
    }
  }

  .interface-wysiwyg-modal-url-preview {
    height: inherit;
    padding-top: 20px;
    max-height: 100%;

    img {
      max-width: 100%;
    }

    .error {
      margin: auto;
      position: relative;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -100%);
      font-size: 90px;
      color: var(--lightest-gray);
    }
  }
}
</style>
