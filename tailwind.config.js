const { Markdown } = require("@urbit/foundation-design-system");
const markdoc = require("@urbit/markdoc");

module.exports = {
  presets: [require("@urbit/foundation-design-system/tailwind.config")],
  content: {
    files: [
      "./node_modules/@urbit/foundation-design-system/dist/**/*.js",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./content/**/*.md",
    ],
    transform: {
      md: (content) => {
        const parsed = Markdown.parse({ post: { content } });
        return markdoc.renderers.html(parsed);
      },
    },
  },
};
