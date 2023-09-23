import cheerio from "cheerio";

export function defaultScraper(body): string[] {
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
  //console.log(content.html());
  if (!$(content).length) {
    //console.log("nope");
    // if it's not nested under the same h2 element, it could be under the adjacent sibling
    content = $(heading.next())
      .find("#isPasted")
      .first()
      .closest("h2.subhead1");
  }
  //console.log(content.html());
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
        //$(br).replaceWith("<span>&nbsp;</span>");
        $(br).replaceWith("\n");
        //console.log($(br).html(), $(br).prop("tagName"));
        //console.log($(br.prev).html(), $(br.prev).prop("tagName"));
        //console.log($(br.next).html(), $(br.next).prop("tagName"));
      });
    lines.push(...$(e).text().split("\n"));
  });
  //console.log("defaultScraper", lines);

  return lines.map((l) => l.trim());
}
