import {
  BackgroundImage,
  generateDisplayDate,
  formatDate,
} from "@urbit/foundation-design-system";
import Link from "next/link";

export default function BlogPreview({ post }) {
  const date = generateDisplayDate(post.date);
  return (
    <div key={post.slug} className="mb-20 cursor-pointer">
      <Link href={`/blog/${post.slug}`}>
        <div className="flex items-center md:flex-row flex-col">
          <div className="flex w-full">
            {
              // Not all blog posts have images
              post.extra.image ? (
                <BackgroundImage
                  src={post.extra.image}
                  className="rounded-lg aspect-w-5 aspect-h-4 w-full"
                />
              ) : (
                <div className="rounded-lg aspect-w-5 aspect-h-4 w-full bg-wall-100" />
              )
            }
          </div>

          <div className="w-full md:pl-6 ">
            <h3 className="mt-6 md:mt-0">{post.title}</h3>
            <div className="flex items-center justify-between mt-2">
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
            </div>
            <div className="text-wall-500 type-sub mt-1">
              {formatDate(date)}
            </div>

            {post?.description && <p className="mt-6">{post.description}</p>}
          </div>
        </div>
      </Link>
    </div>
  );
}
