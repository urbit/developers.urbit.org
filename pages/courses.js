import Head from "next/head";
import Meta from "../components/Meta";
import {
  Container,
  SingleColumn,
  Section,
  TwoUp,
} from "@urbit/foundation-design-system";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TallCard from "../components/TallCard";
import AppSchoolLive from "../components/icons/TallCard/appSchoolLive"
import HoonSchoolLive from "../components/icons/TallCard/hoonSchoolLive";
import { pair } from "../lib/util";

export default function Courses({ search }) {
  const post = {
    title: "Courses",
    description: "Join the next session of Hoon School or App School.",
  };

  // We can't just import this information from the content folder,
  // because it uses svg icons for the cards that need to be imported
  // as React components, so they can be detected by Tailwind and
  // restyled for light and dark modes.
  // 
  // The icon components need to be imported, so they can't
  // just be declared as TOML metadata, either.

  const courses = [
    {
      title: "App School Live",
      description: "App School focuses on how to build a backend Gall agent, then on connecting it to a React-based front-end. When you're done, you'll be able to produce and distribute your own Urbit apps.",
      slug: 'asl',
      icon: AppSchoolLive
    },
    {
      title: "Hoon School Live",
      description: "Hoon School Live teaches the fundamentals of Hoon with a hands-on instructor, regular exercises and discussions, and a completion certification.",
      slug: 'hsl',
      icon: HoonSchoolLive
    }
  ]

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
        </Section>
        <Section>
          {pairedCourses.map((pair) => {
            return <TwoUp>
              {pair.map((course) => {
                return (
                  <TallCard
                    title={course.title}
                    description={course.description}
                    callout="Learn More"
                    href={`/courses/${course.slug}`}
                    image={course.icon}
                    className="h-full"
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
