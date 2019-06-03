import { Mark } from "tiptap";
import { markInputRule, toggleMark } from "tiptap-commands";

export default class Span extends Mark {
  get name() {
    return "span";
  }

  get schema() {
    return {
      attrs: {
        class: {
          default: null
        },
        style: {
          default: null
        }
      },
      inline: true,
      inclusive: true,
      editable: true,
      content: "text*",
      parseDOM: [
        {
          tag: "span",
          getAttrs: dom => ({
            class: dom.getAttribute("class"),
            style: dom.getAttribute("style")
          })
        }
      ],

      toDOM: mark => ["span", mark.attrs, 0]
    };
  }

  commands({ type }) {
    return () => toggleMark(type);
  }

  inputRules({ type }) {
    return [markInputRule(/^<span>(.*)<$/, type)];
  }
}
