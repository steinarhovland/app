<template>
  <div
    v-if="selectionPosition.target && isImageEdit"
    class="image-options"
    :style="{
      top: '50%',
      width: 'var(--width-x-large)'
    }"
    @keyup.esc="quit()"
  >
    <h1 class="title image-options-item">Edit image attributes</h1>
    <button type="button" class="top-close" :disabled="false" @click="quit()">
      <v-icon name="close" />
    </button>
    <div v-if="selectionPosition.src" class="image-options-preview image-options-item half">
      <v-icon
        v-if="!selectionPosition.src || imageUrlRawBroken"
        class="material-icons error icon"
        name="broken_image"
      ></v-icon>
      <img
        v-else
        :src="selectionPosition.src"
        alt="image-options-preview"
        class="image"
        @error="imageUrlRawBroken = true"
      />
    </div>
    <div class="image-options-item half">
      <v-input
        v-if="!!selectionPosition.target"
        ref="editedTitle"
        v-model.lazy="selectionPosition.title"
        class="image-options-item"
        :placeholder="$t('interfaces-wysiwyg-full-image_title')"
        :value="selectionPosition.title"
        @keyup.13="setAll()"
      />
      <v-input
        v-if="!!selectionPosition.target"
        ref="editedAlt"
        v-model.lazy="selectionPosition.alt"
        :placeholder="$t('interfaces-wysiwyg-full-image_alt')"
        class="image-options-item"
        :value="selectionPosition.alt"
        @keyup.13="setAll()"
      />
      <div class="v-input image-options-item dimension">
        <div class="image-options-item quart">
          <label class="">
            <small>{{ $t("interfaces-wysiwyg-full-image_width_px") }}</small>
          </label>
          <v-input
            v-if="!!selectionPosition"
            ref="editedClasses"
            v-model.lazy="selectionPosition.target.width"
            :placeholder="$t('interfaces-wysiwyg-full-image_width_px')"
            :value="trimDimension(selectionPosition.target.width.toString())"
            @keyup.13="setAll()"
          />
        </div>
        <div class="image-options-item quart">
          <label>
            <small>{{ $t("interfaces-wysiwyg-full-image_height_px") }}</small>
          </label>
          <v-input
            v-if="!!selectionPosition"
            ref="editedClasses"
            :placeholder="$t('interfaces-wysiwyg-full-image_height_px')"
            class="image-options-item quart"
            :disabled="true"
            :value="selectionPosition.target.height"
          />
        </div>
      </div>
    </div>
    <v-input
      v-if="!!selectionPosition.target"
      ref="editedSource"
      v-model.lazy="selectionPosition.src"
      class="image-options-item"
      :placeholder="$t('interfaces-wysiwyg-full-image_source')"
      :value="selectionPosition.src"
      @input="imageUrlRawBroken = false"
      @keyup.13="setAll()"
    />
    <v-input
      v-if="!!selectionPosition"
      ref="editedClasses"
      v-model.lazy="selectionPosition.classes"
      :placeholder="$t('interfaces-wysiwyg-full-image_css_classes')"
      class="image-options-item"
      :value="selectionPosition.classes"
      @keyup.13="setAll()"
    />
    <div class="image-options-footer">
      <v-button type="button withe" :disabled="false" @click="quit()">
        <v-icon name="close" />
        {{ $t("cancel") }}
      </v-button>
      <v-button type="button" :disabled="imageUrlRawBroken" @click="setAll()">
        <v-icon name="check" />
        {{ $t("confirm") }}
      </v-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    selectionPosition: {
      required: true,
      type: Object
    },
    isImageEdit: {
      required: true,
      type: Boolean,
      default: false
    },
    updateValue: {
      type: Function,
      default: () => {}
    },
    toggleEdit: {
      type: Function,
      required: true
    },
    editor: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      imageUrlRawBroken: false
    };
  },
  methods: {
    trimDimension($str) {
      if ($str) {
        return $str.match(/[a-z%]+|[^a-z%]+/gi);
      }
    },
    quit() {
      if (this.toggleEdit) {
        return this.toggleEdit();
      }
    },
    setAll() {
      // Apply changes to real target in editor, collected by observer
      // $parent is here supposed to reflect the original dom object due the observer is located in the $parent
      this.selectionPosition.target.className = this.selectionPosition.classes;
      this.selectionPosition.target.alt = this.selectionPosition.alt;
      this.selectionPosition.target.src = this.selectionPosition.src;
      this.selectionPosition.target.title = this.selectionPosition.title;
      // Emit all changes manually due @input is not triggered in the edit modal
      this.updateValue(this.editor.view.dom.innerHTML);
      // Hide image edit modal by property function
      if (this.toggleEdit) {
        return this.toggleEdit();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.image-options {
  display: flex;
  z-index: 99;
  flex-flow: row wrap;
  background-color: var(--lightest-gray);
  padding: calc(var(--page-padding) / 2);
  position: fixed;
  left: calc(var(--page-padding) * 1.2);
  transform: translateY(-50%);
  right: calc(var(--page-padding) * 1.2);
  max-width: 100%;
  overflow-y: auto;
  top: 50%;
  width: 100%;
  margin-top: var(--header-height);
  border-radius: var(--border-radius);
  border: 2px solid var(--lighter-gray);
  max-height: 100vh;
  opacity: 1;
  animation: FadeInImageEdit 0.3s ease-in-out;

  .title {
    font-size: var(--size-2);
    margin-bottom: 10px;
    color: var(--darkest-gray);
  }

  @media (min-width: 480px) {
    right: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 390px;
    width: calc(100% - var(--page-padding) * 2);
  }

  @media (min-width: 800px) {
    min-width: 440px;
    left: calc(50% - var(--nav-sidebar-width));
    margin-left: calc(var(--nav-sidebar-width) + var(--page-padding));
  }
}

.v-input {
  width: initial;
  padding-bottom: calc(var(--page-padding) / 2);
  &:last-of-type {
    padding-bottom: 0;
  }
}

.top-close {
  position: absolute;
  right: calc(var(--page-padding) / 2);
  top: calc(var(--page-padding) / 3.25);
}

.image-options-item {
  flex: 1 0 100%;
  &.half {
    flex: 1 0 100%;
    @media (min-width: 480px) {
      flex: 1 0 40%;
    }
  }
  .dimension {
    display: inline-flex;
    margin-bottom: calc(var(--page-padding) / 2);
    .quart {
      flex: 1 0 20%;
      float: left;
      margin-right: 10px;

      &:last-of-type {
        margin-right: 0;
      }
    }
  }
}

.image-options-preview {
  width: 100%;
  position: relative;
  height: 180px;
  background-color: var(--off-white);
  margin-bottom: calc(var(--page-padding) / 2);

  @media (min-width: 480px) {
    width: 40%;
    margin-right: calc(var(--page-padding) / 2);
  }
  img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 180px;
    height: 180px;
    object-fit: contain;
    max-width: 100%;
  }

  .icon {
    color: var(--lightest-gray);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(4);
  }
}

.image-options-footer {
  display: block;
  @media (min-width: 480px) {
    display: inline-flex;
  }
  width: 100%;
  button {
    margin-bottom: calc(var(--page-padding) / 2);
    width: 100%;

    &:last-of-type {
      margin-bottom: 0;
    }

    @media (min-width: 480px) {
      width: auto;
      margin-bottom: 0;
      &:last-of-type {
        margin-left: auto;
        float: right;
        align-self: end;
      }
    }
  }
}
@keyframes FadeInImageEdit {
  0% {
    opacity: 0;
    max-height: 0;
  }
  100% {
    opacity: 1;
    max-height: 100vh;
  }
}
@keyframes FadeOutImageEdit {
  0% {
    opacity: 1;
    max-height: 100vh;
  }
  99% {
    opacity: 0;
    max-height: 20%;
  }
  100% {
    max-height: 0;
    opacity: 0;
  }
}
</style>
