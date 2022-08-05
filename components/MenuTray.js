import classnames from "classnames";
import { useSwipeable } from "react-swipeable";

export default function MenuTray({ isOpen, setTray, search, children }) {
  // Locks document scrolling when menu is open
  if (typeof document !== "undefined") {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: (e) => setTray(false),
  });

  // Slides the tray in or out from the left
  const trayClasses = classnames({
    "tray-menu-open": isOpen,
    "tray-menu-closed": !isOpen,
  });

  // Fades the background overlay in or out
  const overlayClasses = classnames({
    "tray-overlay-open": isOpen,
    "tray-overlay-closed": !isOpen,
  });

  // Hides or shows the menu
  const menuClasses = classnames({
    "menu-open": isOpen,
    "menu-closed": !isOpen,
  });

  return (
    <>
      <nav
        {...handlers}
        className={`z-10 w-screen h-screen top-0 left-0 fixed block md:hidden ${menuClasses}`}
      >
        <div
          onClick={() => setTray(!isOpen)}
          className={`bg-washedWhite w-screen h-screen ${overlayClasses}`}
        />
        <div
          className={`absolute bg-wall-100 h-screen top-0 left-0 tray-menu-width overflow-y-scroll mb-24 ${trayClasses}`}
        >
          <div
            {...handlers}
            className="flex flex-col px-4 md:px-8 pt-8 md:pt-10 lg:pt-12"
          >
            {children}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            search.toggleSearch(e);
          }}
          className={`z-10 fixed px-4 items-center justify-center type-ui rounded-xl h-16 bg-white text-wall-500 left-4 right-4 bottom-4 mobile-search-button-width ${
            isOpen ? "flex" : "hidden"
          }`}
        >
          Search
        </button>
      </nav>
      <button
        onClick={() => setTray(!isOpen)}
        className="z-10 fixed bottom-4 right-4 w-16 h-16 bg-wall-600 flex items-center justify-center rounded-full md:hidden"
      >
        {isOpen ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.39382 13.7045C-0.131273 14.2296 -0.131274 15.081 0.39382 15.6061C0.918913 16.1312 1.77026 16.1312 2.29535 15.6061L7.99999 9.90142L13.7047 15.6061C14.2297 16.1312 15.0811 16.1312 15.6062 15.6061C16.1313 15.081 16.1313 14.2296 15.6062 13.7046L9.90152 7.99989L15.6061 2.29535C16.1312 1.77026 16.1312 0.918913 15.6061 0.39382C15.081 -0.131273 14.2296 -0.131273 13.7045 0.39382L7.99999 6.09836L2.29548 0.393844C1.77038 -0.131249 0.919038 -0.13125 0.393945 0.393844C-0.131148 0.918937 -0.131148 1.77028 0.393945 2.29537L6.09846 7.99989L0.39382 13.7045Z"
              className="fill-white"
            />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 17"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="16" height="3" rx="1.5" className="fill-white" />
            <rect y="7" width="16" height="3" rx="1.5" className="fill-white" />
            <rect
              y="14"
              width="16"
              height="3"
              rx="1.5"
              className="fill-white"
            />
          </svg>
        )}
      </button>
    </>
  );
}
