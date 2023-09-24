import cheerio from "cheerio";
import { extractText } from "./text-utils";

export function siblingsScraper(body): string[] {
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
  let current = heading.next();
  let hasSeenNonH2s = false;
  let i = 0;
  while (true) {
    if (current.length === 0) {
      break;
    }

    let isH2 = current.closest("h2.subhead1").length > 0;
    //console.log(isH2, current.html());
    if (isH2 && hasSeenNonH2s) {
      // if we have seen non-h2s then this h2 should mark the end of the schedule section
      break;
    }

    if (!hasSeenNonH2s && i > 12) {
      // if we haven't seen any non-h2s then just grab some number N of them
      break;
    }

    if (!hasSeenNonH2s && !isH2) {
      hasSeenNonH2s = true;
    }

    /*
    current.children().each((i, e) => {
      console.log("html", $(e).html());
      console.log("text", $(e).text());
    });
    //console.log("---------------");
    //current.contents().each((i, e) => {
    current.children().each((i, e) => {
      //console.log("html", $(e).html());
      //console.log("text", $(e).text());
      // <br>s get collapsed when using .text() so turn them into spaces
      $(e)
        .find("br")
        .each((i, br) => {
          //$(br).replaceWith("<span>&nbsp;</span>");
          $(br).replaceWith("\n");
        });
    });
    lines.push(...$(current).text().split("\n"));
    */
    let text = extractText($, current);
    lines.push(...text);

    //console.log("\n+\n");
    //console.log($(current).text());
    current = current.next();
    i++;
  }

  /*
  // extract next 13 elements
  for (let i = 0; i < 13; i++) {
    // <br>s get collapsed when using .text() so turn them into spaces
    current.find("br").each((i, br) => {
      $(br).replaceWith("<span>&nbsp;</span>");
    });
    lines.push($(current).text());

    current = $(current.next());
  }
  */

  //console.log("sibling", lines);
  return lines.map((l) => l.trim());
}
