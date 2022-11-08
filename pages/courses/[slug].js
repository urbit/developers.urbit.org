import BasicPage from "../../components/BasicPage";
import { Markdown, getPostBySlug, getAllPosts } from "@urbit/foundation-design-system";

export default function CoursePage({ post, markdown, search, index }) {
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
        params.slug,
        ["title", "slug", "content", "extra"],
        "courses"
    );

    let { index } = post?.extra || { index: null };

    if (index === undefined) {
        index = null;
    }

    const markdown = JSON.stringify(Markdown.parse({ post: { content: String.raw`${post.content}` } }));

    return {
        props: { post, markdown, index },
    };
}


export async function getStaticPaths() {
    const posts = getAllPosts(["slug", "date"], "courses", "date");

    return {
        paths: posts.map((post) => {
            return {
                params: {
                    slug: post.slug,
                },
            };
        }),
        fallback: false,
    };
}
