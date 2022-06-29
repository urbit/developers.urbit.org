import { BackgroundImage } from "foundation-design-system";
import Link from "next/link";
import { generateDisplayDate, formatDate } from "../lib/lib";

export default function BlogPreview({ post }) {
  const date = generateDisplayDate(post.date);
  return (
    <div key={post.slug} className="mb-20 cursor-pointer">
      <Link href={`/blog/${post.slug}`}>
        <div>
          {
            // Not all blog posts have images
            post.extra.image ? (
              <BackgroundImage
                src={post.extra.image}
                className="rounded-lg aspect-w-5 aspect-h-4"
              />
            ) : null
          }
          <h3 className="mt-10">{post.title}</h3>
          {post?.description && <p className="mt-3">{post.description}</p>}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline">
              {post.extra.author ? (
                <div className="type-sub-bold mr-2">{post.extra.author}</div>
              ) : null}
              {post.extra.ship ? (
                <Link
                  href={`https://urbit.org/ids/${post.extra.ship}`}
                  passHref
                >
                  <a className="type-sub-bold text-wall-500 font-mono">
                    {post.extra.ship}
                  </a>
                </Link>
              ) : null}
            </div>
            <div className="text-wall-500 type-sub">{formatDate(date)}</div>
          </div>
        </div>
      </Link>
    </div>
  );
}
