import cheerio from "cheerio";

// DEPRECATED FOR NON-GYM SCRAPERS (i.e. more generalized scrapers)
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
      $(e)
        .find("br")
        .each((i, br) => {
          $(br).replaceWith("<span>&nbsp;</span>");
        });
      lines.push($(e).text());
    });
  content.find("p").each((i, e) => {
    // <br>s get collapsed when using .text() so turn them into spaces
    $(e)
      .find("br")
      .each((i, br) => {
        $(br).replaceWith("<span>&nbsp;</span>");
      });
    lines.push($(e).text());
  });
  //console.log(lines);

  return lines.map((l) => l.trim());
  //console.log(times);
  //let result = parse(times, activityFilter);
  //console.log("done", result);
  //return result;
}
