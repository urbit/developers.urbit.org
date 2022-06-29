import { glossary } from "../../lib/glossary";
const levenSort = require("leven-sort");

export default (req, res) => {
  const entries = glossary.filter((entry) => {
    return (
      entry.name.includes(req.query.q.toLowerCase()) ||
      entry.symbol.includes(req.query.q)
    );
  });
  const sorted = levenSort(entries, req.query.q, ["symbol"]);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ results: sorted }));
};
