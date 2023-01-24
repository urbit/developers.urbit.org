import Link from "next/link";

export default function TallCard({
  image,
  title,
  description,
  callout,
  href,
  next_cohort,
  className = ""
}) {
  return <div className={"h-full flex flex-col min-h-0 " + className}>
    <div key={title} className="bg-wall-100 rounded-xl h-full">
        <div className="flex flex-col space-y-4 p-6 justify-between items-start lg:items-center relative">
          <div className="rounded-lg w-full">
            {image({ className: "w-full h-full" })}
          </div>
          <div className="flex flex-col space-y-2">
            <h3>{title}</h3>
            <p className="text-sm">{description}</p>
          </div>
          <Link href={href}>
              <a className="button-sm bg-green-400 text-white text-sm  w-fit self-start ph-8">{callout}</a>
          </Link>
        </div>
    </div>
  </div>
}
