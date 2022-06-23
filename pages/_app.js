import { useState, useEffect } from "react";
import { configure, GlobalHotKeys } from "react-hotkeys";
import Search from "../components/Search";

import "foundation-design-system/styles/globals.css";
import "foundation-design-system/styles/markdown.css";
import "foundation-design-system/styles/prism.css";
import "../styles/developers.css";

function MyApp({ Component, pageProps }) {
  const [showSearch, setSearch] = useState(false);
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
    closeSearch: (event) => closeSearch(event),
    openSearch: (event) => openSearch(event),
    toggleSearch: (event) => toggleSearch(event),
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
      />
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
