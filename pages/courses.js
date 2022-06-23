import Head from "next/head";
import Meta from "../components/Meta";
import {
  Container,
  SingleColumn,
  Section,
  TwoUp,
} from "foundation-design-system";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Courses({ search }) {
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
      <Header />
      <SingleColumn>
        <Section>
          <h1>Courses</h1>
        </Section>
        <Section>
          <TwoUp>
            <div className="flex flex-col space-y-4">
              <h3>Hoon School Live</h3>
              <a className="button-sm bg-green-400 text-white w-fit" href="#">
                Register
              </a>
            </div>
            <div className="flex flex-col space-y-4">
              <h3>App School Live</h3>
              <a className="button-sm bg-green-400 text-white w-fit" href="#">
                Register
              </a>
            </div>
          </TwoUp>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}
