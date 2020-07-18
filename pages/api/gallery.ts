import { NextApiRequest, NextApiResponse } from "next";
import { getGalleryIndex } from "@/gallery";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return res.json(getGalleryIndex());
};
