import BasicPage from "../../components/BasicPage";
import { Markdown, getPostBySlug } from "@urbit/foundation-design-system";

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
    "support",
    ["title", "slug", "content", "extra"],
    "community"
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
