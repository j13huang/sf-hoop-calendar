import cheerio from "cheerio";

export function siblingsScraper(body): string[] {
  const $ = cheerio.load(body);
  const lines = [];

  //let yo = $("#isPasted").parent("h2.subhead1");

  let heading = $('h2.subhead1:contains("Open Gym Hours")');
  // <br>s get collapsed when using .text() so turn them into spaces
  heading.find("br").each((i, br) => {
    $(br).replaceWith("<span>&nbsp;</span>");
  });
  heading.children().each((i, e) => {
    //console.log("children");
    //console.log($(e).text());
    lines.push($(e).text());
  });
  //let ps = heading.next().find("p");
  //console.log(ps, $.html(ps));
  /*
  console.log(
    "umm",
    $.html(heading.find("#isPasted").first().closest("h2.subhead1"))
  );
  */
  let current = heading.next();

  // extract next 13 elements
  for (let i = 0; i < 13; i++) {
    // <br>s get collapsed when using .text() so turn them into spaces
    current.find("br").each((i, br) => {
      $(br).replaceWith("<span>&nbsp;</span>");
    });
    lines.push($(current).text());
    current = $(current.next());
  }

  //console.log(lines);
  return lines.map((l) => l.trim());
  //let result = parse(times, activityFilter);
  //return result;
}
