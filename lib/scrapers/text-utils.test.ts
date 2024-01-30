import cheerio from "cheerio";
import { extractText } from "./text-utils";

describe("replaceBRs", () => {
  it("no-ops when no BRs", () => {
    let html = `<html><head></head>
  <body>
    <div>hello</div>
  </body></html>`;
    const $ = cheerio.load(html);
    let element = $("div");
    let result = extractText($, element);
    expect(result).toEqual(["hello"]);
  });

  it("trims whitespace", () => {
    let html = `<html><head></head>
  <body>
    <div>
      hello
    </div>
  </body></html>`;
    const $ = cheerio.load(html);
    let element = $("div");
    let result = extractText($, element);
    expect(result).toEqual(["", "hello", ""]);
  });

  it("replaces br within text with &nbsp;", () => {
    let html = `<html><head></head>
  <body>
    <div>hello<br/>world</div>
  </body></html>`;
    const $ = cheerio.load(html);
    let element = $("div");
    extractText($, element);

    let result = extractText($, element, false);
    expect(result).toEqual(["hello\u00A0world"]);
  });
});
