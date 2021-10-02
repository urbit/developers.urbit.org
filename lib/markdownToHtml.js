import remark from "remark";
import html from "remark-html";
import prism from "remark-prism";
import remarkSlug from "remark-slug";

export default async function markdownToHtml(markdown) {
  const result = await remark()
    .use(html)
    .use(prism)
    .use(remarkSlug)
    .process(markdown);
  return result.toString();
}
