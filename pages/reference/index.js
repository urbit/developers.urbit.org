import { getPostBySlug } from "../../lib/lib";
import BasicPage from "../../components/BasicPage";
import { Markdown } from "foundation-design-system";

export default function Post({ post, markdown, search, index }) {
  return (
    <BasicPage
      wide
      post={post}
      markdown={markdown}
      search={search}
      index={index}
    />
  );
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(
    "_index",
    ["title", "slug", "content", "extra"],
    "reference"
  );

  let { index } = post?.extra || { index: null };

  if (index === undefined) {
    index = null;
  }
  const markdown = JSON.stringify(Markdown.parse({ post }));
  return {
    props: { post, markdown, index },
  };
}
