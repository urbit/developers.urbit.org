import Head from "next/head";
import Meta from "../components/Meta";
import {
  Container,
  Markdown,
  SingleColumn,
  Section,
  TwoUp,
  getAllPosts,
} from "@urbit/foundation-design-system";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Courses({ search, courses }) {
  const post = {
    title: "Courses",
    description: "Join the next session of Hoon School or App School.",
  };
  return (
    <Container>
      <Head>
        <title>Courses • developers.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={search} />
      <SingleColumn>
        <Section>
          <h1>Courses</h1>
        </Section>
        <Section>
          <TwoUp>
            {courses.sort((a, b) => a.weight > b.weight ? 1 : -1).map((course) => {
              return (
                <div className="flex flex-col space-y-4 h-full">
                  <h3>{course.title}</h3>
                  <div className="markdown">
                    <Markdown.render content={JSON.parse(course.content)} />
                  </div>
                </div>
              );
            })}
          </TwoUp>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}

export async function getStaticProps() {
  const courses = getAllPosts(
    ["title", "slug", "weight", "description", "extra", "content"],
    "courses",
    "weight"
  ).map((e) => ({
    ...e,
    content: JSON.stringify(Markdown.parse({ post: { content: e.content } })),
  }));

  return {
    props: { courses },
  };
}
