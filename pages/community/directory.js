import Head from "next/head";
import Link from "next/link";
import {
  Markdown,
  Container,
  SingleColumn,
  Section,
  TwoUp,
} from "foundation-design-system";
import Sigil from "../../components/Sigil";
import Card from "../../components/Card";
import Meta from "../../components/Meta";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getAllPosts } from "../../lib/lib";
export default function Directory({ search, directory }) {
  const post = {
    title: "Directory",
    description:
      "Our community is comprised of individuals, all of whom happen to be pretty friendly.",
  };

  const tlon = pair(
    directory
      .filter((e) => e.org === "Tlon")
      .sort((a, b) => a.name.localeCompare(b.name))
  );
  const uf = pair(
    directory
      .filter((e) => e.org === "Urbit Foundation")
      .sort((a, b) => a.name.localeCompare(b.name))
  );
  const additional = pair(
    directory
      .filter((e) => e.org === "Additional Community Members")
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  return (
    <Container>
      <Head>
        <title>Directory • developers.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={search} />
      <SingleColumn>
        <Section>
          <h1>Directory</h1>
        </Section>
        <Section>
          <p class="text-xl">
            Our community is comprised of individuals, all of whom happen to be
            pretty friendly. Here’s a list of prominent groups and figures you’ll likely
            encounter that are open to being contacted.
          </p>
        </Section>
        <Section>
          <h3>Urbit Foundation</h3>
          <div className="mt-4">
            {uf.map((pair) => {
              return (
                <TwoUp>
                  {pair.map((e) => (
                    <Card
                      title={e.name}
                      text={[
                        <code className="block text-green-400 font-semibold">
                          {e.patp}
                        </code>,
                        e.title,
                      ]}
                      icon={
                        <Sigil
                          patp={e.patp}
                          className="rounded-xl overflow-hidden"
                        />
                      }
                      href={`https://urbit.org/ids/${e.patp}`}
                      disableArrow
                      className="lg:basis-1/2"
                    />
                  ))}
                </TwoUp>
              );
            })}
          </div>
        </Section>
        <Section>
          <h3>Tlon Corporation</h3>
          <div className="flex flex-wrap mt-4">
            {tlon.map((pair) => {
              return (
                <TwoUp>
                  {pair.map((e) => (
                    <Card
                      title={e.name}
                      text={[
                        <code className="block text-green-400 font-semibold">
                          {e.patp}
                        </code>,
                        e.title,
                      ]}
                      icon={
                        <Sigil
                          patp={e.patp}
                          className="rounded-xl overflow-hidden"
                        />
                      }
                      href={`https://urbit.org/ids/${e.patp}`}
                      disableArrow
                      className="lg:basis-1/2"
                    />
                  ))}
                </TwoUp>
              );
            })}
          </div>
        </Section>
        <Section>
          <h3>Additional Community Members</h3>
          <div className="flex flex-wrap mt-4">
            {additional.map((pair) => {
              return (
                <TwoUp>
                  {pair.map((e) => (
                    <Card
                      title={e.name}
                      text={[
                        <code className="block text-green-400 font-semibold">
                          {e.patp}
                        </code>,
                        e.title,
                      ]}
                      icon={
                        <Sigil
                          patp={e.patp}
                          className="rounded-xl overflow-hidden"
                        />
                      }
                      href={`https://urbit.org/ids/${e.patp}`}
                      disableArrow
                      className="lg:basis-1/2"
                    />
                  ))}
                </TwoUp>
              );
            })}
          </div>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}

const pair = (arr) =>
  arr.reduce(function (rows, key, index) {
    return (
      (index % 2 == 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) &&
      rows
    );
  }, []);

export async function getStaticProps() {
  const directory = getAllPosts(
    ["name", "title", "patp", "org", "content"],
    "community/directory",
    ""
  ).map((e) => ({
    ...e,
    content: JSON.stringify(Markdown.parse({ post: { content: e.content } })),
  }));

  return {
    props: { directory },
  };
}
