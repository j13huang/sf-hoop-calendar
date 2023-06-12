import cheerio from "cheerio";

// DEPRECATED FOR NON-GYM SCRAPERS (i.e. more generalized scrapers)
// upper noe's schedule formatting is a little weird so we want to process the text so that it looks like all the other websites
export function extractUpperNoeSchedule(body): string[] {
  const $ = cheerio.load(body);
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
  let lines = [];
  content.find("p").each((i, p) => {
    $(p)
      .contents()
      .each((j, e) => {
        lines.push($(e).text());
      });
  });

  //console.log(lines);
  return lines.map((l) => l.trim());
}
