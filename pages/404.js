import Head from "next/head";
import Meta from "../components/Meta";
import { Container, SingleColumn, Section } from "foundation-design-system";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function NotFound(props) {
  const post = {
    title: "404",
  };
  return (
    <Container>
      <Head>
        <title>404 • developers.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={props.search} />
      <SingleColumn>
        <Section className="pt-48">
          <h1>404</h1>
          <p className="mt-12">It looks like nothing is here.</p>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}
