import cheerio from "cheerio";

export function extractSunsetSchedule(body): string[] {
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
  content
    .find("div")
    .first()
    .find("div")
    .first()
    .children()
    .each((i, e) => {
      //console.log("yo", $(e).text());
      lines.push($(e).text());
    });
  content.find("p").each((i, e) => {
    lines.push($(e).text());
  });
  //console.log(lines);

  return lines;
  //console.log(times);
  //let result = parse(times, activityFilter);
  //console.log("done", result);
  //return result;
}
