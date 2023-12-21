import cheerio from "cheerio";
import { extractLines } from "./text-utils";

export function defaultAdjacentScraper(body): string[] {
  const $ = cheerio.load(body);

  //let yo = $("#isPasted").parent("h2.subhead1");

  let content = $('h2.subhead1:contains("Open Gym Hours")');
  // MAYBE DO THIS ALSO
  //lines.push(...extractText($, content));

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
  // if it's not nested under the same h2 element, it could be under the adjacent sibling
  content = $(content.next()).find("#isPasted").first().closest("h2.subhead1");
  //console.log(content.html());
  //console.log("yep", $.html(content));

  return extractLines($, content);
}
