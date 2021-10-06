import fs from "fs";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import path from "path";
import remarkSlug from "remark-slug";
import { postFilePaths, POSTS_PATH } from "../lib/api";
import Container from "../components/Container";
import Layout from "../components/Layout";
import Section from "../components/Section";
import SingleColumn from "../components/SingleColumn";

const components = {
  // a: CustomLink,
  // It also works with dynamically-imported components, which is especially
  // useful for conditionally loading components for certain routes.
  // See the notes in README.md for more details.
  // TestComponent: dynamic(() => import('../../components/TestComponent')),
  Head,
};

export default function Post({ source, frontMatter }) {
  const router = useRouter();
  // if (!router.isFallback && !source?.slug) {
  //   return <div>You die</div>;
  // }

  return (
    <Layout>
      <Head>
        <title>{frontMatter.title} &bull; Urbit Developers</title>
      </Head>
      <Container>
        <SingleColumn>
          <Section>
            <h1>{frontMatter.title}</h1>
          </Section>
          <Section>
            <div className="prose lg:prose-lg">
              <MDXRemote {...source} components={components} />
            </div>
          </Section>
        </SingleColumn>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const postFilePath = path.join(POSTS_PATH, `${params.slug}.mdx`);
  const source = fs.readFileSync(postFilePath);
  const { content, data } = matter(source);
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [require("remark-prism"), remarkSlug],
    },
    scope: data,
  });

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    },
  };
};

export const getStaticPaths = async () => {
  const paths = postFilePaths
    .map((path) => path.replace(/\.mdx?$/, ""))
    .map((slug) => ({ params: { slug } }));

  return {
    paths,
    fallback: false,
  };
};
