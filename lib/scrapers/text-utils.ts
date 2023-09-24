import cheerio from "cheerio";

// replace brs with spaces if they are surrounded by text elements
// otherwise replace brs with newlines
export function extractText($: cheerio.Root, element: cheerio.Cheerio) {
  let result = [];
  //console.log($(element).html());
  $(element)
    .find("br")
    .each((i, br) => {
      //console.log($(br).html(), $(br).prop("tagName"));
      //console.log($(br.prev).html(), $(br.prev).prop("tagName"));
      //console.log($(br.next).html(), $(br.next).prop("tagName"));

      // https://stackoverflow.com/questions/71032890/how-to-get-next-text-node-with-cheerio
      if (
        $(br).get(0).nextSibling?.nodeType === 3 &&
        $(br).get(0).previousSibling?.nodeType === 3
      ) {
        // br surrounded by text nodes
        // <br>s get collapsed when using .text() so turn them into spaces
        $(br).replaceWith("<span>&nbsp;</span>");
        return;
      }

      // in any other case turn it into a newline
      $(br).replaceWith("\n");
    });

  result.push(
    ...$(element)
      .text()
      .split("\n")
      .map((s) => s.trim())
  );
  //console.log([$(element).text()]);
  //console.log($(element).html(), result, "-----");
  //console.log(result)
  return result;
}
