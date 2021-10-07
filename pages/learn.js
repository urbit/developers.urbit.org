import Head from "next/head";
import matter from "gray-matter";
import html from "remark-html";
import { Remark } from "react-remark";
import Layout from "../components/Layout";
import Container from "../components/Container";
import Section from "../components/Section";
import SingleColumn from "../components/SingleColumn";
import Sigil from "../components/Sigil";

export default function Post() {
  const source = require(`../content/learn.page.md`);
  const { content, data } = matter(source.default);

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
              <p>
                We’ve made several self-guided tutorials and guides available to
                get your started on your journey, which should be read in order.
                All-in-all, a programmer with some experience should be able to
                work through this material and become proficient at Urbit
                programming in under a month of regular study.
              </p>
            </div>
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
          {data.courses
            .filter((course) => course.course.includes("101"))
            .map((course, i) => (
              <div className="px-8 rounded-xl bg-wall-100" key={course.link}>
                <h3>
                  <a href={course.link}>{course.title}</a>
                </h3>
                <p>{course.description}</p>
                <p className="text-sm uppercase tracking-wide">
                  {course.duration}
                </p>
              </div>
            ))}
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
          {data.courses
            .filter((course) => course.course.includes("201"))
            .map((course, i) => (
              <div className="px-8 rounded-xl bg-wall-100" key={course.link}>
                <h3>
                  <a href={course.link}>{course.title}</a>
                </h3>
                <p>{course.description}</p>
                <p className="text-sm uppercase tracking-wide">
                  {course.duration}
                </p>
              </div>
            ))}
        </div>
      </Container>
    </Layout>
  );
}
