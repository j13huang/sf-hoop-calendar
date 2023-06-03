import cheerio from "cheerio";

export function extractBernalSchedule(body): string[] {
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
  let current = heading;
  for (let i = 0; i < 13; i++) {
    // extract next 13 elements
    lines.push($(current).text());
    current = $(current.next());
  }

  //console.log(lines);
  return lines;
  //let result = parse(times, activityFilter);
  //return result;
}
