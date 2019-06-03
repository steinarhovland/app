<template>
  <codemirror
    v-if="options"
    class="code-editor"
    :class="{ json: options.output_format === 'json' }"
    :value="options.output_format === 'json' ? JSON.stringify(value, null, 2) : value"
    @input="$emit('input', $event)"
    :options="options.output_format === 'json' ? jsonOptions : cmOptions"
    ref="codeMirror"
  ></codemirror>
</template>
<script>
import "codemirror/lib/codemirror.css";
import "codemirror/addon/display/autorefresh.js";
import "codemirror/mode/xml/xml.js";

import { codemirror } from "vue-codemirror";

export default {
  components: {
    codemirror
  },
  props: {
    value: {
      type: [String, Object],
      required: true
    },
    options: {
      type: [String, Object]
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      loaded: false
    };
  },
  computed: {
    cmOptions() {
      return {
        tabSize: 4,
        autoRefresh: true,
        indentUnit: 4,
        mode: "text/html",
        showCursorWhenSelecting: true,
        theme: "default",
        lineWrapping: true
      };
    },
    jsonOptions() {
      return {
        tabSize: 4,
        autoRefresh: false,
        indentUnit: 4,
        readOnly: this.readonly ? "nocursor" : false,
        line: false,
        lineNumbers: true,
        mode: "application/json",
        showCursorWhenSelecting: true,
        theme: "default",
        lint: true
      };
    }
  }
};
</script>

<style lang="scss">
.code-editor {
  &:not(.json) {
    .CodeMirror {
      padding: calc(var(--page-padding) / 2);
    }
  }
  .CodeMirror {
    margin-bottom: 0;
    border: 0;
  }
}
</style>
