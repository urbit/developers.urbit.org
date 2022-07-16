import Head from "next/head";
import { DateTime } from "luxon";
import Meta from "../../../components/Meta";
import { Container, SingleColumn, Section } from "foundation-design-system";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import EventPreview from "../../../components/EventPreview";
import { eventKeys } from "../../../lib/constants";
import { getAllEvents, generateRealtimeDate } from "../../../lib/lib";

export default function Events({ events, search }) {
  const post = {
    title: "Events",
    description: "In-person, remote, and recorded events about Urbit.",
  };

  const now = DateTime.now();

  const pastEvents = events.filter((event) => {
    const ends = generateRealtimeDate(event.ends);
    return ends < now;
  });

  const futureEvents = events
    .filter((event) => {
      const starts = generateRealtimeDate(event.starts);
      return starts > now;
    })
    .sort((a, b) => {
      const aStarts = generateRealtimeDate(a.starts).ts;
      const bStarts = generateRealtimeDate(b.starts).ts;
      if (aStarts > bStarts) {
        return 1;
      } else if (aStarts === bStarts) {
        return 0;
      }
      return -1;
    });

  const happeningNow = events.filter((event) => {
    const starts = generateRealtimeDate(event.starts);
    const ends = generateRealtimeDate(event.ends);
    return starts < DateTime.now() && ends > now;
  });

  return (
    <Container>
      <Head>
        <title>Developer Events • developer.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={search} />
      <SingleColumn>
        <Section short narrow>
          <h1 className="pb-16">Developer Events</h1>
        </Section>

        <Section narrow>
          {happeningNow.length > 0 ? (
            <>
              <div className="mb-8 mt-16 table">
                <h3 className="text-green-400">Happening Now</h3>
              </div>
              {happeningNow.map((post) => {
                return <EventPreview big event={post} className="mb-8" />;
              })}
            </>
          ) : null}
          {futureEvents.length > 0 ? (
            <>
              <div className="mb-8 mt-16 table">
                <h3 className="text-green-400">Coming Soon</h3>
              </div>
              {futureEvents.map((post) => {
                return <EventPreview big event={post} className="mb-8" />;
              })}
            </>
          ) : null}
          <div className="mb-8 mt-16 table">
            <h3 className="text-wall-500">Past Events</h3>
          </div>

          {pastEvents.map((post) => {
            return <EventPreview big event={post} className="mb-8" />;
          })}
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}

export async function getStaticProps() {
  const events = getAllEvents(eventKeys, "community/events");

  return {
    props: { events },
  };
}
