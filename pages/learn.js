import { useEffect, useState } from "react";
import Head from "next/head";
import matter from "gray-matter";
import { decode } from "html-entities";
import Layout from "../components/Layout";
import Container from "../components/Container";
import Section from "../components/Section";
import SingleColumn from "../components/SingleColumn";
import Sigil from "../components/Sigil";
import Markdown from "../components/Markdown";

const getPageMarkdown = async () => {
  const source = require(`../content/learn.page.md`);
  const { content, data } = matter(source.default);
  const parsed = await Markdown(content);
  return { parsed, data };
};

export default function StaticLearnPage() {
  const [pageData, setPageData] = useState({});
  const [pageContent, setPageContent] = useState("");
  useEffect(() => {
    getPageMarkdown().then((result) => {
      setPageContent(result.parsed);
      setPageData(result.data);
    });
  }, []);
  return (
    <Layout>
      <Head>
        <title>{pageData?.title} &bull; Urbit Developers</title>
      </Head>
      <Container>
        <SingleColumn>
          <Section>
            <h1>{pageData?.title}</h1>
          </Section>
          <Section>
            <div
              className="prose lg:prose-lg"
              dangerouslySetInnerHTML={{ __html: decode(pageContent) }}
            />
          </Section>
        </SingleColumn>
        <SingleColumn>
          <Section>
            <div className="prose lg:prose-lg">
              <h2 id="urbit-101">Urbit 101</h2>
            </div>
          </Section>
        </SingleColumn>
        <div className="px-8 lg:px-16 grid gap-8 lg:grid-cols-2 2xl:grid-cols-4 prose">
          {pageData?.courses?.map((course, i) => {
            if (course.course === "Urbit 101")
              return (
                <div className="px-8 rounded-xl bg-wall-100" key={course.link}>
                  <h3>
                    <a href={course.link}>{course.title}</a>
                  </h3>
                  <p>{course.description}</p>
                  <p className="text-sm uppercase tracking-wide">
                    {course.duration}
                  </p>
                </div>
              );
            return <></>;
          })}
        </div>
        <SingleColumn>
          <Section>
            <div className="prose lg:prose-lg">
              <h2 id="urbit-201">Urbit 201</h2>
              <p>
                Equipped with knowledge of the basics of all parts of the stack,
                there are a number of additional supplementary tutorials and
                guides to deepen your knowledge:
              </p>
            </div>
          </Section>
        </SingleColumn>
        <div className="px-8 lg:px-16 grid gap-8 lg:grid-cols-2 2xl:grid-cols-4 prose pb-16">
          {pageData?.courses?.map((course, i) => {
            if (course.course === "Urbit 201")
              return (
                <div className="px-8 rounded-xl bg-wall-100" key={course.link}>
                  <h3>
                    <a href={course.link}>{course.title}</a>
                  </h3>
                  <p>{course.description}</p>
                  <p className="text-sm uppercase tracking-wide">
                    {course.duration}
                  </p>
                </div>
              );
            return <></>;
          })}
        </div>
      </Container>
    </Layout>
  );
}
