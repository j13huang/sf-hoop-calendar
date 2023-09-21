import { defaultScraper } from "./scrapers/default";
import { siblingsScraper } from "./scrapers/siblings";
import { DATE_WORDS, parseTime, timeToMinutes } from "./time-utils";

const SCRAPERS = [defaultScraper, siblingsScraper];

const REC_CENTERS: {
  [key: string]: {
    location: string;
    url: string;
    // css color for frontend
    color: string;
    // specific string matching filter for gym-specific customization
    activityFilters?: string[];
  };
} = {
  Sunset: {
    location: "Sunset",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Sunset-Rec-Center-110",
    color: "#99ccff",
  },
  "Glen Canyon Park": {
    location: "Glen Canyon Park",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Glen-Park-Rec-Center-89",
    color: "lightgreen",
  },
  "Hamilton Rec": {
    location: "Hamilton Rec",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Hamilton-Rec-Center-93",
    color: "orange",
  },
  "Minnie Lovie Ward": {
    location: "Minnie Lovie Ward",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Minnie-Love-Ward-Recreation-Center-97",
    color: "mediumpurple",
  },
  "Upper Noe": {
    location: "Upper Noe",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Upper-Noe-Recreation-Center-112",
    color: "#52efd8",
    activityFilters: ["adult basketball", "all ages basketball"],
  },
  "Bernal Heights": {
    location: "Bernal Heights",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Bernal-Heights-Recreation-Center-83",
    color: "yellowgreen",
  },
  "Potrero Hill": {
    location: "Potrero Hill",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Potrero-Hill-Rec-Center-275",
    color: "#ffff5f",
  },
  //cheerio parser not working
  "Eureka Valley": {
    location: "Eureka Valley",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Eureka-Valley-Recreation-Center-86",
    color: "#ee5959",
    activityFilters: ["basketball", "drop-in basketball", "drop in basketball"],
  },
};

export function getLocationData() {
  return Object.values(REC_CENTERS);
}

// currently unused. only used for potential SSR implementation
async function getSchedules() {
  let schedules = await Promise.all(
    Object.keys(REC_CENTERS).map(async (location) => {
      let schedule = getSchedule(location);
      return {
        ...REC_CENTERS[location],
        timeIntervals: schedule,
      };
    })
  );
  //console.log(schedules);
  return schedules;
}

export async function getSchedule(location: string) {
  let rc = REC_CENTERS[location];
  /*
  console.log("fetching");
  let response = null;
  let body = null;
  try {
    //response = await fetch(rc.url, { signal: AbortSignal.timeout(300) });
    response = await fetch(rc.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
      },
    });
    console.log("fetched");
    body = await response.text();
    console.log("body");
  } catch (e) {
    console.log("fetch failed", e);
    return;
  }
  */
  let response = await fetch(rc.url);
  let body = await response.text();
  while (body.includes("An error has occurred")) {
    //console.log("failed");
    const response = await fetch(rc.url);
    //console.log("re-fetched");
    body = await response.text();
    //console.log("body2");
  }

  let textSchedule: string[] = [];
  let maxFound = 0;
  for (let scraper of SCRAPERS) {
    let scraped = scraper(body);
    //console.log(scraped);
    let dateWordsCount = Object.keys(DATE_WORDS).reduce((count, dateWord) => {
      if (
        scraped.find((line) => line.toLocaleLowerCase().startsWith(dateWord))
      ) {
        return count + 1;
      }
      return count;
    }, 0);
    //console.log(dateWordsCount, standardizedScrapedText(scraped));
    if (dateWordsCount > maxFound) {
      //console.log(scraped);
      textSchedule = scraped;
      maxFound = dateWordsCount;
      //break;
    }
  }
  //console.log(textSchedule);
  let cleaned = standardizedScrapedText(textSchedule);
  //console.log("cleaned", cleaned);
  return parse(cleaned, rc.activityFilters || ["basketball"]);
}

// some schedules have the days on the same lines as their times
// some schedules have the days on preceding lines
// standardized lines to make it so that all schedules have the day names on the same line (e.g. no-op the first case)
// day names should be followed by a ":"
// export for testing
export function standardizedScrapedText(rawLines: string[]) {
  let dayIndexes = [];
  let lines = rawLines
    .filter((l) => l.trim() !== "")
    .map((l) => l.toLocaleLowerCase());
  lines.forEach((l, i) => {
    if (
      Object.keys(DATE_WORDS).find((dw) => l.toLocaleLowerCase().startsWith(dw))
    ) {
      dayIndexes.push(i);
    }
  });

  let results = [];
  for (let i = 0; i < dayIndexes.length; i++) {
    let left = dayIndexes[i];
    let right = dayIndexes[i + 1];
    // make sure if day names are on individual lines that they end with a ":"
    if ((right == null && left < lines.length - 1) || right > left + 1) {
      results.push(
        [
          lines[left].trim() + ":",
          ...lines.slice(left + 1, right).map((l) => l.trim()),
        ].join(" ")
      );
      continue;
    }
    results.push(lines.slice(left, right).join(" "));
  }

  return results;
}

// export for testing
export function parse(textSchedule: string[], activityFilters?: string[]) {
  const result = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };
  textSchedule.forEach((t) => {
    // t.split(':', 1) but preserve the remaining text
    const parts = t.split(":");
    const [day, schedule] = [parts[0], parts.slice(1).join(":").trim()];

    if (DATE_WORDS[day] == null) {
      return;
    }

    const tokenized = tokenize(schedule);
    //console.log("tokenized", day, tokenized);
    const processedSchedule = processTokens(tokenized, activityFilters);
    //console.log("processed", processedSchedule);
    result[DATE_WORDS[day]].push(...processedSchedule);
  });
  return result;
}

// export for testing
export function tokenize(schedule: string) {
  const result = [];
  const tokens = schedule
    // "\u45" and "\u2013"
    //.replace(/(-|–)/g, " - ")
    .replace(/\s+/g, " ")
    .split(" ");
  let chunk = [];
  let i = 0;
  //console.log(tokens);
  while (i < tokens.length) {
    let token = tokens[i];
    //console.log(token, chunk);
    if (token === "" || token === "&") {
      i++;
      continue;
    }

    let parsedTime = parseTime(token);
    if (parsedTime) {
      if (chunk.length > 0 && !parseTime(chunk[0])) {
        // the current chunk contains a label (e.g. "Basketball") and this token is a time so we can start with a new chunk
        //console.log("labelled", chunk, token);
        result.push(chunk);
        chunk = [];
      }

      if (token.includes("-") || token.includes("–")) {
        // might be two times without spaces in between them
        // "\u45" and "\u2013"
        let splitTimes = token.replace(/(-|–)/g, "-").split("-");
        chunk.push(parseTime(splitTimes[0]));
        chunk.push(parseTime(splitTimes[1]));
        result.push(chunk);
        chunk = [];
      } else {
        chunk.push(parsedTime);
      }
    } else if (token === "-" || token === "–") {
      // "\u45" and "\u2013"
      // '-' should indicate separator between two times, so just add the next time and skip
      i++;
      chunk.push(tokens[i]);
      result.push(chunk);
      chunk = [];
    } else {
      chunk.push(token);
    }

    i++;
  }

  result.push(chunk);
  //console.log(result);

  if (result.length > 0 && !parseTime(result[0][0])) {
    // we want to have activities follow times
    result.reverse();
  }
  return result;
}

// adds AM/PM period indicators and joins descriptions together with times
function processTokens(tokenGroups: string[][], activityFilters?: string[]) {
  let result = [];
  let intervals = [];
  for (let tokenGroup of tokenGroups) {
    if (tokenGroup.length === 0) {
      intervals = [];
      continue;
    }

    //console.log("hey", parseTime(tokenGroup[0]));
    if (parseTime(tokenGroup[0])) {
      intervals.push(guessAMPMPeriod(tokenGroup[0], tokenGroup[1]));
      continue;
    }

    let matchedFilter = matchActivityFilters(tokenGroup, activityFilters);
    if (activityFilters && !matchedFilter) {
      intervals = [];
      continue;
    }

    intervals.forEach((interval) => {
      result.push([
        ...interval.map((i) => timeToMinutes(i)),
        matchedFilter ? matchedFilter : tokenGroup.join(" "),
      ]);
    });
    intervals = [];
  }

  return result;
}

function matchActivityFilters(
  tokenGroup: string[],
  activityFilters?: string[]
) {
  return (activityFilters || []).find((filter) => {
    if (filter.includes(" ")) {
      return tokenGroup.join(" ").includes(filter);
    }

    //return !!tokenGroup.find((tg) => tg.startsWith(activityFilter));
    return tokenGroup[0].includes(filter);
  });
}

// export for testing
export function guessAMPMPeriod(a: string, b: string) {
  if (!a.endsWith("m")) {
    // sometimes the first time doesn't have an AM/PM period indicator, so assume it is the same as the ending times's
    return [a + b.slice(-2), b];
  }

  if (!b.endsWith("m")) {
    // sometimes the second time doesn't have an AM/PM period indicator, so guess it based on the hour number
    let hoursA = a.split(":")[0];
    let timePeriodA = a.slice(-2);
    let hoursB = a.split(":")[0];
    if (hoursB > hoursA) {
      return [a, b + timePeriodA];
    }

    return [a, b + "pm"];
  }

  return [a, b];
}
