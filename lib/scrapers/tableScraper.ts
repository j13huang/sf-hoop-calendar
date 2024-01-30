import cheerio from "cheerio";
import { extractText } from "./text-utils";

export function tableScraper(body): string[] {
  const $ = cheerio.load(body);

  let content = $('h2.subhead1:contains("Open Gym")');
  //console.log($(content).html());

  let lines = [];
  content
    .find("tbody")
    .find("tr")
    .each((trIndex, tr) => {
      //console.log($(tr).html());
      $(tr)
        .find("td")
        .each((i, td) => {
          //console.log("----", i, $(td).html());
          if (trIndex === 0) {
            lines.push([`${$(td).text().trim()}: `]);
            return;
          }

          let text = extractText($, $(td), false);
          lines[i].push(...text);
        });
    });

  return lines.map((l) => l.join("\n"));
}
