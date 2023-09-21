import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { TableOfContents } from "@urbit/foundation-design-system";

import { DocSearch } from '@docsearch/react';

export default function ContentArea(props) {
  const [shortcut, setShortcut] = useState("");

  const detectOS = () => {
    const agent = window.navigator.appVersion;
    if (agent.includes("Win")) {
      return "Ctrl+K";
    } else if (agent.includes("Mac")) {
      return "⌘K";
    } else if (agent.includes("Linux")) {
      return "Ctrl+K";
    }
  };

  useEffect(() => {
    setShortcut(detectOS());
  }, []);

  const scrollBox = useRef();

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      if (scrollBox.current === null) return;
      scrollBox.current.scrollTop = 0;
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, []);

  return (
    <div className="w-full min-w-0 flex flex-col items-center bg-white">
      <div
        ref={scrollBox}
        className="px-4 md:px-12 lg:px-24 pt-8 md:pt-10 lg:pt-16 flex flex-col w-full max-w-screen-xl max-h-screen h-screen overflow-y-scroll"
      >
        <div className="flex justify-between w-full items-center shrink-0">
          <div className="font-semibold antialiased text-lg text-black">
            {props.breadcrumbs}
          </div>
          <div className="hidden md:block">
            <DocSearch
              appId="3EVOAL3MOI"
              apiKey="00ccef825c17a672ef1c1a9bea3a9903"
              indexName="developers-urbit"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="min-w-0 max-w-screen-md">
            <div className="mb-16">
              <h2 className="mt-24">{props.title}</h2>
              {props?.description && (
                <p className="text-wall-400 font-bold text-xl">
                  {props.description}
                </p>
              )}
            </div>
            {props.children}
            <div className="pb-24" />
          </div>
          {!props?.disableToC && (
            <TableOfContents
              key={props.params.slug?.join("/") || Math.random()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
