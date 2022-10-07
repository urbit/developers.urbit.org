import Head from "next/head";
import Meta from "../components/Meta";
import {
  Container,
  SingleColumn,
  Section,
} from "@urbit/foundation-design-system";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function NotFound(props) {
  const post = {
    title: "Sign up Confirmed",
  };
  return (
    <Container>
      <Head>
        <title>Sign Up Confirmed • developers.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={props.search} />
      <SingleColumn>
        <Section className="pt-32" narrow>
          <p className="text-lg mb-6">Welcome to</p>
          <img src="https://storage.googleapis.com/media.urbit.org/developers/batterypayload.jpg"/>
          <p className="mt-6 text-lg">Your subscription to our list has been confirmed.</p>
          <p className="mt-6 mb-12 text-lg">Thank you for subscribing!</p>

          <div class="flex flex-col">
                <Link href="/" passHref>
                  <a className="button-lg bg-green-400 text-white w-fit">
                    Home
                  </a>
                </Link>
          </div>

        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}
