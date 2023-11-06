import { useState, useEffect } from "react";
import { configure, GlobalHotKeys } from "react-hotkeys";
import { init } from "@socialgouv/matomo-next";
import { Search } from "@urbit/foundation-design-system";
import Head from "next/head";

import "@urbit/foundation-design-system/styles/globals.css";
import "@urbit/foundation-design-system/styles/markdown.css";
import "@urbit/foundation-design-system/styles/prism.css";
import "../styles/developers.css";

const MATOMO_URL = process?.env?.NEXT_PUBLIC_MATOMO_URL || "";
const MATOMO_SITE_ID = process?.env?.NEXT_PUBLIC_MATOMO_SITE_ID || "";

function MyApp({ Component, pageProps }) {
  const [showSearch, setSearch] = useState(false);

  useEffect(() => {
    init({
      url: MATOMO_URL,
      siteId: MATOMO_SITE_ID,
    });
  });

  const closeSearch = (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    setSearch(false);
  };

  const openSearch = (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    setSearch(true);
  };

  const toggleSearch = (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    setSearch((state) => !state);
  };

  const keyMap = {
    closeSearch: ["esc"],
    toggleSearch: ["command+k", "ctrl+k"],
  };

  const handlers = {
    // closeSearch: (event) => closeSearch(event),
    // openSearch: (event) => openSearch(event),
    // toggleSearch: (event) => toggleSearch(event),
  };

  configure({
    // ignoreTags: [],
    ignoreTags: ["input", "select", "textarea"],
    ignoreEventsCondition: function () {},
  });

  return (
    <>
      <GlobalHotKeys keyMap={keyMap} handlers={handlers} />
      <Search
        showSearch={showSearch}
        toggleSearch={toggleSearch}
        closeSearch={closeSearch}
        openSearch={openSearch}
        order={["dev", "org", "ops", "roadmap"]}
        ourSite="https://developers.urbit.org"
      />
      <div className="flex items-center justify-center"
           style={{ backgroundColor: "#5A5A6E" }}
      >
        <div
          className="text-base p-2"
          style={{ color: "#F0FFFF" }}
        >
          This site has been deprecated. Go to{" "}
          <a
            className="font-medium"
            style={{ color: "#A0DCE6" }}
            href="https://docs.urbit.org"
          >
            docs.urbit.org
          </a>
          .
        </div>
      </div>
      <Component
        {...pageProps}
        search={{
          toggleSearch: toggleSearch,
          closeSearch: closeSearch,
          openSearch: openSearch,
        }}
      />
    </>
  );
}

export default MyApp;
