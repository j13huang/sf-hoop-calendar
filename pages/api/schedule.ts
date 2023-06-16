import type { NextApiRequest, NextApiResponse } from "next";
import { getSchedule } from "../../lib/schedules";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let location = req.query.location;
  console.log("start", new Date());
  let result = await getSchedule(
    typeof location === "string" ? location : location[0]
  );
  console.log("end", new Date());
  res.status(200).json(result);
}
