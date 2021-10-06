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
  const source = require(`../content/community.md`);
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
              <Remark>{content}</Remark>
            </div>
            <div className="prose lg:prose-lg">
              <div className="py-8 grid gap-8 lg:grid-cols-2">
                {data.directory.map((person, i) => (
                  <div className="p-8 rounded-xl bg-wall-100" key={person.patp}>
                    <Sigil patp={person.patp} />
                    <div>
                      <code>{person.patp}</code>
                    </div>
                    <div>{person.job}</div>
                    <div>{person.roles}</div>
                  </div>
                ))}
                <div>
                  Others: `~palfun-foslup`, `~littel-wolfur`, `~lavlyn-litmeg`,
                  `~mocrux-nomdep`, `~sicdev-pilnup`
                </div>
              </div>
            </div>
          </Section>
        </SingleColumn>
      </Container>
    </Layout>
  );
}
