import fs from "fs";
import { join, parse } from "path";
import matter from "gray-matter";
import toml from "@iarna/toml";
import { DateTime } from "luxon";

const options = {
  engines: {
    toml: toml.parse.bind(toml),
  },
  language: "toml",
  delimiters: "+++",
};

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const directories = (dir) => {
  switch (dir) {
    case "/":
      return join(process.cwd(), "content");
    default:
      return join(process.cwd(), `content/${dir}`);
  }
};

export function formatDate(dateTimeObject) {
  return dateTimeObject.toLocaleString(DateTime.DATE_FULL);
}

export function formatTime(dateTimeObject) {
  const dt = dateTimeObject.toLocaleString(DateTime.TIME_SIMPLE);
  return dt.replace(/:00/g, "");
}

export function formatTimeZone(dateTimeObject) {
  return dateTimeObject.offsetNameShort;
}

export function generateDisplayDate(iso8601, zone = "America/Los_Angeles") {
  return DateTime.fromISO(iso8601, { zone });
}

// Takes an ISO 8601 date string
// Returns a time relative to user's current timezone
export function generateRealtimeDate(iso8601) {
  return DateTime.fromISO(iso8601).setZone("system");
}

export function getPostSlugs(key) {
  const dir = fs.existsSync(directories(key))
    ? fs.readdirSync(directories(key), { withFileTypes: true })
    : [];
  return dir
    .filter((f) => f.isFile() && f.name !== "_index.md")
    .map((f) => f.name);
}

export function getPostBySlug(slug, fields = [], key) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(directories(key), `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents, options);
  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }

    if (field === "content") {
      items[field] = content;
    }

    if (data[field]) {
      items[field] = data[field];
    }
  });

  return items;
}

export function getAllEvents(fields = [], key) {
  const slugs = getPostSlugs(key);
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields, key))
    // sort posts by date in descending order
    .sort((post1, post2) =>
      DateTime.fromISO(post1.starts) > DateTime.fromISO(post2.starts) ? -1 : 1
    );
  return posts;
}

export function getAllPosts(fields = [], key, sort = "") {
  const slugs = getPostSlugs(key);
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields, key))
    // sort posts by date in descending order
    .sort((post1, post2) => {
      if (sort === "date") {
        return DateTime.fromISO(post1.date) > DateTime.fromISO(post2.date)
          ? -1
          : 1;
      } else if (sort === "weight") {
        return post1.weight > post2.weight ? -1 : 1;
      }
    });
  return posts;
}

export function getNextPost(slug, fields = [], key, sort = "date") {
  let resultPost = null;

  getAllPosts(fields, key, sort).forEach((post, index, array) => {
    if (post.slug === slug) {
      if (typeof array[index - 1] !== "undefined") {
        resultPost = array[index - 1];
      }
    }
  });
  return resultPost;
}

export function getPreviousPost(slug, fields = [], key, sort = "date") {
  let resultPost = null;

  getAllPosts(fields, key, sort).forEach((post, index, array) => {
    if (post.slug === slug) {
      if (typeof array[index + 1] !== "undefined") {
        resultPost = array[index + 1];
      }
    }
  });
  return resultPost;
}

export const getPage = (path) => {
  try {
    let fileContents = fs.readFileSync(`${path}.md`, "utf8");
    if (fileContents) {
      const { data, content } = matter(fileContents, options);
      return { data, content };
    }
  } catch {
    try {
      let fileContents = fs.readFileSync(`${path}/_index.md`, "utf8");
      if (fileContents) {
        const { data, content } = matter(fileContents, options);
        return { data, content };
      }
    } catch {
      console.error("no md file for slug");
    }
  }
};
