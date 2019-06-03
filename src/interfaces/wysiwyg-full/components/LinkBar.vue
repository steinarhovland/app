<template>
  <div class="menu-sub-bar" :class="{ 'is-active': isActive }">
    <button @click="setLinkUrl(commands.link, null)">
      <v-icon v-tooltip="$t('interfaces-wysiwyg-full-link_delete')" name="delete" />
    </button>
    <button class="close" @click="quit">
      <v-icon v-tooltip="$t('interfaces-wysiwyg-full-link_cancel')" name="close" />
    </button>

    <form @submit.prevent="setLinkUrl(commands.link, linkUrl)">
      <input
        ref="input"
        :value="getMarkAttrs('link').href"
        :placeholder="$t('editor.link_placeholder')"
        @input="linkUrl = $event.target.value"
      />
    </form>
  </div>
</template>
<script>
export default {
  props: {
    editor: {
      type: Object,
      defaultValue: {},
      required: true
    },
    commands: {
      type: Object || Function,
      default: {}
    },
    isActive: {
      type: Boolean,
      default: false
    },
    getMarkAttrs: {
      type: Function,
      default: () => {}
    },
    toggleLink: {
      type: Function,
      default: () => false
    }
  },
  data() {
    return {
      linkUrl: null,
      submitted: false
    };
  },
  mounted() {
    this.submitted = this.$props.isActive;
    this.$refs.input.focus();
  },
  methods: {
    quit() {
      return this.$props.toggleLink();
    },
    setLinkUrl(command, linkUrl) {
      try {
        command({ href: linkUrl });
        this.submitted = true;
        this.quit();
      } catch (e) {
        console.log(e.message);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.menu-sub-bar {
  position: absolute;
  left: 0;
  top: 100%;
  width: calc(100% + var(--input-border-width) * 2);
  height: 34px;
  background-color: var(--off-white);
  border: var(--input-border-width) solid var(--light-gray);
  //border-bottom: var(--input-border-width) solid var(--lighter-gray);
  display: flex;
  margin-left: calc(var(--input-border-width) * -1);
  margin-right: calc(var(--input-border-width) * -1);
  &:focus-within {
    border: var(--input-border-width) solid var(--dark-gray);
  }

  button {
    width: 32px;
    &.close {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  form {
    flex-grow: 1;
  }

  input {
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: 0;
    color: var(--dark-gray);
  }
}
</style>
