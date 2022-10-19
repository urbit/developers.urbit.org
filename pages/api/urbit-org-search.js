export default async (req, res) => {
  const results = await fetch(
    `https://urbit-5cl3gjdl1-urbit.vercel.app/api/search?q=${req.query.q}`
  ).then((res) => res.json());
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(results));
};
