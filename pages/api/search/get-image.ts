import { NextApiRequest, NextApiResponse } from "next";
import * as jwt from "jsonwebtoken";
import axios from "axios";
import { Stream } from "stream";

type JwtData = {
  resource: string;
  iat: number;
  exp: number;
};

const RELAY_HEADERS = ["content-type", "content-length", "etag"];

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const resource = req.query["r"];

  if (!resource || Array.isArray(resource)) {
    return res.status(400).json({ error: "Bad Request" });
  }

  let decoded: JwtData = undefined;

  try {
    decoded = jwt.verify(resource, process.env.CORS_BUST_SECRET) as JwtData;
  } catch (e) {
    return res.status(400).json({ error: "Bad Request", detail: e.message });
  }

  if (!decoded.resource) {
    return res.status(404).json({ error: "Not Found" });
  }

  const response = await axios.get<Stream>(decoded.resource, { responseType: "stream" });

  // Copy relevant headers
  RELAY_HEADERS.forEach((header) => {
    if (response.headers[header]) {
      res.setHeader(header, response.headers[header]);
    }
  });

  if (decoded.exp) {
    const ttl = Math.max(0, Math.floor(decoded.exp - Date.now() / 1000));
    res.setHeader("Cache-Control", `s-maxage=${ttl}, stale-while-revalidate`);
  }

  // We need to stop next terminating this response on our behalf so wait for the incoming stream to end
  const wait = new Promise((resolve, reject) => response.data.once("end", resolve).once("error", reject));

  response.data.pipe(res, { end: true });

  await wait;
};
