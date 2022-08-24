import Head from "next/head";
import Header from "../components/Header";
import Meta from "../components/Meta";
import BlogPreview from "../components/BlogPreview";
import {
  Container,
  SingleColumn,
  Section,
} from "@urbit/foundation-design-system";
import { getAllPosts } from "@urbit/foundation-design-system";
import Footer from "../components/Footer";

export default function Blog({ posts, search }) {
  const post = {
    title: "Developer Blog",
    description: "Technical-oriented posts by Urbit engineers.",
  };

  return (
    <Container>
      <Head>
        <title>Blog • developers.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={search} />
      <SingleColumn>
        <Section>
          <h1 className="">Developer Blog</h1>
        </Section>
        <Section>
          {posts.map((post) => (
            <BlogPreview post={post} />
          ))}
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}

export async function getStaticProps() {
  const posts = getAllPosts(
    ["title", "slug", "date", "description", "extra"],
    "blog",
    "date"
  );

  return {
    props: { posts },
  };
}
