import Link from "next/link";

export default function TallCard({
  image,
  title,
  description,
  callout,
  href,
  className = ""
}) {
  return <div className={"cursor-pointer h-full flex flex-col min-h-0 " + className}>
    <div key={title} className="bg-wall-100 rounded-xl h-full">
      <Link href={href}>
        <div className="flex flex-col space-y-4 p-6 justify-between items-start lg:items-center relative">
          <div className="rounded-lg w-full">
            {image({ className: "w-full h-full" })}
          </div>
          <div className="flex flex-col space-y-2">
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <a className="button-sm bg-green-400 text-white w-fit self-start">{callout}</a>
        </div>
      </Link>
    </div>
  </div>
}
