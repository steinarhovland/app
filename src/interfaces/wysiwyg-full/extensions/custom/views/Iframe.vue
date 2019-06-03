<template>
  <div
    v-if="view.editable"
    class="iframe__wrapper"
    :class="{ selected: toggleEdit, empty: !src, active: selected }"
    @click="toggleEdit = !toggleEdit"
  >
    <iframe
      :class="className ? className : false"
      :style="style"
      :frameborder="0"
      :src="src"
    ></iframe>
  </div>
</template>
<script>
export default {
  props: ["node", "updateAttrs", "view", "selected"],
  data() {
    return {
      toggleEdit: false
    };
  },

  computed: {
    src: {
      get() {
        return this.node.attrs.src;
      },
      set(src) {
        // we cannot update `src` itself because `this.node.attrs` is immutable
        this.updateAttrs({
          src
        });
      }
    },
    style: {
      get() {
        return this.node.attrs.style;
      },
      set(style) {
        this.updateAttrs({
          style
        });
      }
    },
    className: {
      get() {
        return this.node.attrs.class ? this.node.attrs.class : "";
      },
      set(className) {
        this.updateAttrs({
          className
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.iframe__wrapper {
  position: relative;
  max-width: 100%;
  cursor: pointer;
  border: 10px solid transparent;
  box-shadow: 0 0 1px var(--dark-gray);
  background-color: transparent;
  transition: background-color var(--slow) var(--transition-in);

  &:hover,
  &:focus,
  &:focus-within {
    background-color: var(--lightest-gray);
  }

  &.empty {
    iframe {
      visibility: hidden;
    }
  }
}
</style>
