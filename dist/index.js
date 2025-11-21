import { attributesTransformer } from './packages/attributes-transformer/index.js';
import { mdastAttributes, mdastAttributesToMarkdown } from './packages/mdast-attributes/index.js';
import { micromarkAttributes } from './packages/micromark-attributes/index.js';
/**
 * Plugin to support attributes like markdown-it-attrs
 * [text](https://test.com){target=_blank}
 */
export default function remarkAttributes(options = { mdx: false }) {
    const data = this.data();
    function add(key, value) {
        data[key] ||= [];
        data[key].unshift(value);
    }
    add('micromarkExtensions', micromarkAttributes({ escaped: options.mdx }));
    add('fromMarkdownExtensions', mdastAttributes());
    add('toMarkdownExtensions', mdastAttributesToMarkdown());
    return (root) => attributesTransformer(root);
}
