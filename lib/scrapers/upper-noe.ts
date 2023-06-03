import cheerio from "cheerio";
import { DATE_WORDS, TIME_REGEX } from "../time-utils";

// upper noe's schedule formatting is a little weird so we want to process the text so that it looks like all the other websites
export function extractUpperNoeSchedule(body): string[] {
  const $ = cheerio.load(body);
  const lines = [];

  //let yo = $("#isPasted").parent("h2.subhead1");

  let heading = $('h2.subhead1:contains("Open Gym Hours")');
  //let ps = heading.next().find("p");
  //console.log(ps, $.html(ps));
  /*
  console.log(
    "umm",
    $.html(heading.find("#isPasted").first().closest("h2.subhead1"))
  );
  */
  let content = heading.find("#isPasted").first().closest("h2.subhead1");
  if (!$(content).length) {
    //console.log("nope");
    // if it's not nested under the same h2 element, it could be under the adjacent sibling
    content = $(heading.next())
      .find("#isPasted")
      .first()
      .closest("h2.subhead1");
  }
  //console.log("yep", $.html(content));
  // parse each
  content.find("p").each((i, e) => {
    let fullText = $(e).text();
    let fullTextSplit = fullText.split(":");
    if (fullTextSplit.length > 0 && !DATE_WORDS[fullTextSplit[0]]) {
      return;
    }

    let line = "";
    //console.log("------", $(e).text());
    $(e)
      .contents()
      .each((i, e) => {
        if (i === 0) {
          return;
        }
        let text = $(e).text().trim();
        //console.log("yoooo", text);
        let match = text.match(TIME_REGEX);
        if (text.endsWith(":") || (match != null && match.index === 0)) {
          line = `${text} ${line}`;
          //console.log(line);
          return;
        }

        let split = text.split(":");
        line = `${split.slice(1).join(":")} ${split[0]} ${line}`;
        //console.log(line);
        return;
      });

    lines.push(`${fullTextSplit[0]}: ${line}`);
  });

  //console.log(lines);
  return lines;
}
