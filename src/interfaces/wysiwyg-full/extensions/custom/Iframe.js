import { Node } from "tiptap";
import { nodeInputRule } from "tiptap-commands";

import Iframe from "./views/Iframe";

// example from https://github.com/scrumpy/tiptap#create-a-node-as-a-vue-component
// a bit extend to support classes and styles

export default class IframeNode extends Node {
  get name() {
    return "iframe";
  }

  get schema() {
    return {
      // here you have to specify all values that can be stored in this node
      attrs: {
        src: {
          default: null
        },
        style: {
          default: null
        },
        class: {
          default: null
        }
      },
      selectable: false,
      draggable: true,
      group: "block",
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [
        {
          tag: "iframe",
          getAttrs: dom => ({
            src: dom.getAttribute("src"),
            style: dom.getAttribute("style"),
            class: dom.getAttribute("class")
          })
        }
      ],
      toDOM: node => [
        "div",
        {
          class: "iframe__wrapper"
        },
        [
          "iframe",
          {
            frameborder: 0,
            allowfullscreen: "true",
            src: node.attrs.src,
            style: node.attrs.style,
            class: node.attrs.class
          }
        ]
      ]
    };
  }

  inputRules({ type }) {
    return [nodeInputRule(/^<iframe(.*)<$/, type)];
  }

  // commands({type}) {
  //   return () => toggleBlockType(type);
  // }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      const { selection } = state;
      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos;
      const node = type.create(attrs);
      const transaction = state.tr.insert(position, node);
      dispatch(transaction);
    };
  }

  get view() {
    return Iframe;
  }
}
