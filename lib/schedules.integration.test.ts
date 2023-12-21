import * as fs from "fs";
import { getSchedule } from "./schedules";
import { clockTimeToMinutes } from "./time-utils";

describe("getSchedule", () => {
  it("parses sunset fall 2023 html using sibling scraper", async () => {
    let htmlString = fs.readFileSync(
      `${__dirname}/integration-test-data/sunset-fall-2023.html`
    );

    jest
      .spyOn(global, "fetch")
      .mockImplementation(
        () =>
          Promise.resolve({ text: () => Promise.resolve(htmlString) }) as any
      );

    let result = await getSchedule("Sunset");
    //console.log(result);
    expect(result).toEqual({
      Sunday: [],
      Monday: [],
      Tuesday: [
        [clockTimeToMinutes("1730"), clockTimeToMinutes("2045"), "basketball"],
        [clockTimeToMinutes("1000"), clockTimeToMinutes("1530"), "basketball"],
      ],
      Wednesday: [
        [clockTimeToMinutes("1000"), clockTimeToMinutes("1730"), "basketball"],
      ],
      Thursday: [
        [clockTimeToMinutes("1730"), clockTimeToMinutes("2100"), "basketball"],
        [clockTimeToMinutes("1230"), clockTimeToMinutes("1530"), "basketball"],
      ],
      Friday: [
        [clockTimeToMinutes("1925"), clockTimeToMinutes("2045"), "basketball"],
        [clockTimeToMinutes("1000"), clockTimeToMinutes("1545"), "basketball"],
      ],
      // saturday doesn't have an activity posted so don't assume it's basketball
      Saturday: [
        //[clockTimeToMinutes("900"), clockTimeToMinutes("1700"), "basketball"],
      ],
    });
  });

  it("parses glen park fall 2023 html using sibling scraper", async () => {
    let htmlString = fs.readFileSync(
      `${__dirname}/integration-test-data/glen-park-fall-2023.html`
    );

    jest
      .spyOn(global, "fetch")
      .mockImplementation(
        () =>
          Promise.resolve({ text: () => Promise.resolve(htmlString) }) as any
      );

    let result = await getSchedule("Glen Canyon Park");
    //console.log(result);
    expect(result).toEqual({
      Sunday: [],
      Monday: [],
      Tuesday: [
        [clockTimeToMinutes("1130"), clockTimeToMinutes("1945"), "basketball"],
      ],
      Wednesday: [
        [clockTimeToMinutes("1600"), clockTimeToMinutes("1800"), "basketball"],
      ],
      Thursday: [
        [clockTimeToMinutes("1600"), clockTimeToMinutes("1930"), "basketball"],
      ],
      Friday: [
        [clockTimeToMinutes("1230"), clockTimeToMinutes("1600"), "basketball"],
      ],
      Saturday: [
        [clockTimeToMinutes("1100"), clockTimeToMinutes("1630"), "basketball"],
      ],
    });
  });

  it("parses hamilton rec fall 2023 html using default scraper", async () => {
    let htmlString = fs.readFileSync(
      `${__dirname}/integration-test-data/hamilton-rec-fall-2023.html`
    );

    jest
      .spyOn(global, "fetch")
      .mockImplementation(
        () =>
          Promise.resolve({ text: () => Promise.resolve(htmlString) }) as any
      );

    let result = await getSchedule("Hamilton Rec");
    //console.log(result);
    expect(result).toEqual({
      Sunday: [],
      Monday: [],
      Tuesday: [
        [clockTimeToMinutes("1700"), clockTimeToMinutes("2030"), "basketball"],
      ],
      Wednesday: [
        [clockTimeToMinutes("1730"), clockTimeToMinutes("2030"), "basketball"],
      ],
      Thursday: [
        [clockTimeToMinutes("1230"), clockTimeToMinutes("2030"), "basketball"],
      ],
      Friday: [
        [clockTimeToMinutes("1030"), clockTimeToMinutes("2030"), "basketball"],
      ],
      Saturday: [],
    });
  });

  it("parses bernal heights fall 2023 html using sibling scraper", async () => {
    let htmlString = fs.readFileSync(
      `${__dirname}/integration-test-data/bernal-fall-2023.html`
    );

    jest
      .spyOn(global, "fetch")
      .mockImplementation(
        () =>
          Promise.resolve({ text: () => Promise.resolve(htmlString) }) as any
      );

    let result = await getSchedule("Bernal Heights");
    //console.log(result);
    expect(result).toEqual({
      Sunday: [],
      Monday: [],
      Tuesday: [
        [clockTimeToMinutes("1200"), clockTimeToMinutes("1400"), "basketball"],
        [clockTimeToMinutes("1700"), clockTimeToMinutes("1945"), "basketball"],
      ],
      Wednesday: [],
      Thursday: [
        [clockTimeToMinutes("1200"), clockTimeToMinutes("1400"), "basketball"],
        [clockTimeToMinutes("1700"), clockTimeToMinutes("1945"), "basketball"],
      ],
      Friday: [
        [clockTimeToMinutes("1300"), clockTimeToMinutes("1400"), "basketball"],
        [clockTimeToMinutes("1700"), clockTimeToMinutes("1945"), "basketball"],
      ],
      Saturday: [
        [clockTimeToMinutes("1015"), clockTimeToMinutes("1645"), "basketball"],
      ],
    });
  });
});
