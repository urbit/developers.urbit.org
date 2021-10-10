import remark from 'remark'
import gfm from 'remark-gfm'
import slug from 'remark-slug'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'

const options = {
  handlers: {}
}

export default async function Markdown (content) {
  const result = await remark()
    .use(remarkParse, options)
    .use(gfm)
    .use(slug)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content)

  return result.toString()
}
