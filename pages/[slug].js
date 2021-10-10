import fs from "fs";
import path from "path";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import matter from "gray-matter";
import { decode } from "html-entities";
import { contentFilePaths, CONTENT_PATH } from "../lib/api";
import Markdown from "../components/Markdown";
import Container from "../components/Container";
import Layout from "../components/Layout";
import Section from "../components/Section";
import SingleColumn from "../components/SingleColumn";

export default function DynamicPage({ markdown, data }) {
  const router = useRouter();
  // if (!router.isFallback && !source?.slug) {
  //   return <div>You die</div>;
  // }
  return (
    <Layout>
      <Head>
        <title>{data.title} &bull; Urbit Developers</title>
      </Head>
      <Container>
        <SingleColumn>
          <Section>
            <h1>{data.title}</h1>
          </Section>
          <Section>
            <div className="prose lg:prose-lg">
              <div dangerouslySetInnerHTML={{ __html: decode(markdown) }} />
            </div>
          </Section>
        </SingleColumn>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const pagePath = path.join(CONTENT_PATH, `${params.slug}.md`);
  const source = fs.readFileSync(pagePath);
  const { content, data } = matter(source);
  const markdown = await Markdown(content);

  return {
    props: {
      markdown,
      data,
    },
  };
};

export const getStaticPaths = async () => {
  const paths = contentFilePaths
    .map((path) => path.replace(/\.md?$/, ""))
    .map((slug) => ({ params: { slug } }));

  return {
    paths,
    fallback: false,
  };
};
