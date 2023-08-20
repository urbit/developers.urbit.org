import Head from "next/head";
import Meta from "../components/Meta";
import {
  Container,
  SingleColumn,
  Section,
  TwoUp,
  getAllPosts
} from "@urbit/foundation-design-system";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TallCard from "../components/TallCard";

import { pair } from "../lib/util";

export default function Courses({ search, courses }) {
  const post = {
    title: "Courses",
    description: "Join the next session of Hoon School or App School.",
  };

  const pairedCourses = pair(courses);

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
          <div class="pt-12 pb-12 sm:pr-32">
            <p className="">The Urbit Foundation offers a variety of cohort courses for those interested in learning development on Urbit. If you prefer to learn as part of a group with a hands-on instructor, regular exercises and discussions, and a completion certification, then these courses will be a good fit for you.</p>
          </div>
          {pairedCourses.map((pair) => {
            return <TwoUp>
              {pair.map((course) => {
                return (
                  <TallCard
                    title={course.title}
                    description={course.description}
                    href={`/courses/${course.slug}`}
                    image={course.image}
                    className="h-full"
                    cohort={course.next_cohort}
                  />
                );
              })}
            </TwoUp>
          })}
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}

export async function getStaticProps() {
  const courses = getAllPosts(
    ["title", "slug", "next_cohort", "weight", "image", "description"],
    "courses","weight"
  );

  return {
    props: { courses },
  };
}

