import React from "react";
import Head from "next/head";
import matter from "gray-matter";
import { decode } from "html-entities";
import Layout from "../components/Layout";
import Container from "../components/Container";
import Section from "../components/Section";
import SingleColumn from "../components/SingleColumn";
import Markdown from "../components/Markdown";
import Sigil from "../components/Sigil";

export default function DynamicPage({ parsed, data }) {
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
            <div
              className="prose lg:prose-lg"
              dangerouslySetInnerHTML={{ __html: decode(parsed) }}
            />
            <div className="prose lg:prose-lg">
              <div className="py-8 grid gap-8 xl:grid-cols-2">
                {data.directory.map((person, i) => (
                  <div className="p-8 rounded-xl bg-wall-100" key={person.patp}>
                    <div className="flex">
                      <div className="mr-4">
                        <Sigil patp={person.patp} />
                      </div>
                      <div>
                        <div className="font-mono font-semibold">
                          {person.patp}
                        </div>
                        <div className="text-sm">{person.job}</div>
                      </div>
                    </div>
                    <div className="mt-4">{person.roles}</div>
                  </div>
                ))}
                <div>
                  Others: <code>~palfun-foslup</code>,{" "}
                  <code>~littel-wolfur</code>, <code>~lavlyn-litmeg</code>,
                  <code>~mocrux-nomdep</code>, <code>~sicdev-pilnup</code>
                </div>
              </div>
            </div>
          </Section>
        </SingleColumn>
      </Container>
    </Layout>
  );
}

export const getServerSideProps = async ({ context }) => {
  const source = require(`../content/community.page.md`);
  const { content, data } = matter(source.default);
  const parsed = await Markdown(content);

  return {
    props: {
      parsed,
      data,
    },
  };
};
