import fs from "fs";
import matter from "gray-matter";
import html from "remark-html";
import { Remark } from "react-remark";
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

const mdxGlobalComponents = {
  Head,
};

export default function Post({ content, frontMatter }) {
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
              <Remark remarkPlugins={[html]}>{content}</Remark>
            </div>
          </Section>
        </SingleColumn>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const postFilePath = path.join(POSTS_PATH, `${params.slug}.md`);
  const source = fs.readFileSync(postFilePath);
  const { content, data } = matter(source);

  return {
    props: {
      content: content,
      frontMatter: data,
    },
  };
};

export const getStaticPaths = async () => {
  const paths = postFilePaths
    .map((path) => path.replace(/\.md?$/, ""))
    .map((slug) => ({ params: { slug } }));

  return {
    paths,
    fallback: false,
  };
};
