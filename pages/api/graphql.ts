import type { NextApiRequest, NextApiResponse } from "next";
import { renderPlaygroundPage } from "graphql-playground-html";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.setHeader("Content-Type", "text/html");
  const playground = renderPlaygroundPage({
    endpoint:
      "http://localhost:8000/subgraphs/name/pendle-finance/pendle-v2-subgraph",
  });
  res.write(playground);
  res.end();
}
