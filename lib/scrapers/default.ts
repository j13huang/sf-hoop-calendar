import cheerio from "cheerio";
import { extractLines } from "./text-utils";

export function defaultScraper(body): string[] {
  const $ = cheerio.load(body);
  const lines = [];

  //let yo = $("#isPasted").parent("h2.subhead1");

  let content = $('h2.subhead1:contains("Open Gym Hours")');
  //let ps = heading.next().find("p");
  //console.log(ps, $.html(ps));
  /*
  console.log(
    "umm",
    $.html(heading.find("#isPasted").first().closest("h2.subhead1"))
  );
  */
  //let content = content.find("#isPasted").first().closest("h2.subhead1");
  //console.log(content.html());
  return extractLines($, content);
}
