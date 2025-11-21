import type {FromMarkdownExtension} from 'mdast-util-directive/lib/index.js'
import type {Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
import {defaultHandlers} from 'mdast-util-to-markdown'

/**
 * Fully-configured extension to add Heading ID nodes to Markdown.
 **/
export function mdastAttributes(): FromMarkdownExtension {
  return {
    enter: {
      attrs(token) {
        // @ts-expect-error Assume `token` is a `Token`.
        this.enter({type: 'attrs', value: null}, token)
        this.buffer()
      }
    },
    exit: {
      attrs(token) {
        const attrs = this.resume()
        const node = this.stack[this.stack.length - 1]
        this.exit(token)
        // @ts-expect-error Assume `node` is a `AttrsNode`.
        node.value = attrs
      }
    }
  }
}

function propertiesToString(properties: Record<string, unknown>): string {
  const parts = []
  const {className, class: classProp, id, ...rest} = properties

  if (typeof id === 'string') {
    parts.push('#' + id)
  }

  const classes = className || classProp
  if (Array.isArray(classes)) {
    classes.forEach((c) => parts.push('.' + c))
  }

  for (const [key, value] of Object.entries(rest)) {
    parts.push(`${key}="${value}"`)
  }

  return parts.length ? '{' + parts.join(' ') + '}' : ''
}

function wrap(handler: any) {
  return function (node: any, parent: any, context: any, safeOptions: any) {
    const value = handler(node, parent, context, safeOptions)
    if (node.data && node.data.hProperties) {
      const attrs = propertiesToString(node.data.hProperties)
      if (attrs) {
        return value + attrs
      }
    }
    return value
  }
}

export function mdastAttributesToMarkdown(): ToMarkdownExtension {
  const handlers: Record<string, any> = {}
  const nodesToWrap = [
    'paragraph',
    'heading',
    'blockquote',
    'listItem',
    'link',
    'image',
    'strong',
    'emphasis',
    'inlineCode'
  ]

  for (const type of nodesToWrap) {
    if (defaultHandlers[type]) {
      handlers[type] = wrap(defaultHandlers[type])
    }
  }

  return {
    handlers
  } as any
}
