import { extractSunsetSchedule } from "./scrapers/sunset";
import { extractBernalSchedule } from "./scrapers/bernal";
import { extractUpperNoeSchedule } from "./scrapers/upper-noe";
import { DATE_WORDS, parseTime, timeToMinutes } from "./time-utils";

const REC_CENTERS: {
  [key: string]: {
    location: string;
    url: string;
    // css color for frontend
    color: string;
    // specific string matching filter for gym-specific customization
    activityFilter?: string;
    extract: (body: string) => string[];
  };
} = {
  Sunset: {
    location: "Sunset",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Sunset-Rec-Center-110",
    color: "#99ccff",
    extract: extractSunsetSchedule,
  },
  "Glen Canyon Park": {
    location: "Glen Canyon Park",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Glen-Park-Rec-Center-89",
    color: "lightgreen",
    extract: extractSunsetSchedule,
  },
  "Hamilton Rec": {
    location: "Hamilton Rec",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Hamilton-Rec-Center-93",
    color: "orange",
    extract: extractSunsetSchedule,
  },
  "Minnie Lovie Ward": {
    location: "Minnie Lovie Ward",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Minnie-Love-Ward-Recreation-Center-97",
    color: "mediumpurple",
    extract: extractSunsetSchedule,
  },
  "Upper Noe": {
    location: "Upper Noe",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Upper-Noe-Recreation-Center-112",
    color: "#52efd8",
    activityFilter: "adult basketball",
    extract: extractUpperNoeSchedule,
  },
  "Bernal Heights": {
    location: "Bernal Heights",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Bernal-Heights-Recreation-Center-83",
    color: "yellowgreen",
    extract: extractBernalSchedule,
  },
  "Potrero Hill": {
    location: "Potrero Hill",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Potrero-Hill-Rec-Center-275",
    color: "#ffff5f",
    extract: extractSunsetSchedule,
  },
  /*
  cheerio parser not working
     "Eureka Valley": {
    location: "Eureka Valley",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Eureka-Valley-Recreation-Center-86",
      color: "red",
    extract: extractSunsetSchedule,
  },
  */
};

export function getLocationData() {
  return Object.values(REC_CENTERS).map((rc) => {
    // omit extract function from return value
    const { extract, ...result }: any = rc;
    //console.log(result);
    return result;
  });
}

// currently unused. only used for potential SSR implementation
async function getSchedules() {
  let schedules = await Promise.all(
    Object.keys(REC_CENTERS).map(async (location) => {
      let schedule = getSchedule(location);
      // omit extract function from return value
      const { extract, ...result }: any = REC_CENTERS[location];
      return {
        ...result,
        timeIntervals: schedule,
      };
    })
  );
  //console.log(schedules);
  return schedules;
}

export async function getSchedule(location: string) {
  let rc = REC_CENTERS[location];
  const response = await fetch(rc.url);
  let body = await response.text();
  while (body.includes("An error has occurred")) {
    const response = await fetch(rc.url);
    body = await response.text();
  }
  //console.log(rc, body.length);

  // omit extract function from return value
  //const { extract, ...result }: any = rc;
  //let textSchedule = rc.extract(body);
  //console.log(textSchedule);
  //result.timeIntervals = parse(textSchedule, rc.activityFilter || "basketball");
  //console.log("done", result.timeIntervals);
  //if (result.timeIntervals.Tuesday.length === 0) {
  //console.log(rc, body);
  //}
  //return result;
  let textSchedule = rc.extract(body);
  //console.log(textSchedule);
  let cleaned = standardizedExtractedText(textSchedule);
  //console.log("cleaned", cleaned);
  return parse(cleaned, rc.activityFilter || "basketball");
}

// some schedules have the days on the same lines as their times
// some schedules have the days on preceding lines
// standardized lines to make it so that all schedules have the day names on the same line (e.g. no-op the first case)
// day names should be followed by a ":"
// export for testing
export function standardizedExtractedText(lines: string[]) {
  let dayIndexes = [];
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
export function parse(textSchedule: string[], activityFilter?: string) {
  // can't use new Array(7).fill([]) because every sub-array references the single sub-array in the fill parameter
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
    const parts = t.toLocaleLowerCase().split(":");
    const [day, schedule] = [parts[0], parts.slice(1).join(":").trim()];

    if (DATE_WORDS[day] == null) {
      return;
    }

    const tokenized = tokenize(schedule);
    //console.log("tokenized", day, tokenized);
    const processedSchedule = processTokens(tokenized, activityFilter);
    //console.log("parsed", processedSchedule);
    result[DATE_WORDS[day]].push(...processedSchedule);
  });
  return result;
}

// export for testing
export function tokenize(schedule: string) {
  const result = [];
  const tokens = schedule
    // 	"\u45" and 	"\u2013"
    .replace(/(-|–)/g, " - ")
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
      chunk.push(parsedTime);
    } else if (token === "-") {
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
function processTokens(tokenGroups: string[][], activityFilter?: string) {
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

    if (activityFilter && !matchesActivityFilter(tokenGroup, activityFilter)) {
      intervals = [];
      continue;
    }

    intervals.forEach((interval) => {
      result.push([
        ...interval.map((i) => timeToMinutes(i)),
        activityFilter || tokenGroup.join(" "),
      ]);
    });
    intervals = [];
  }

  return result;
}

function matchesActivityFilter(tokenGroup: string[], activityFilter: string) {
  if (activityFilter.includes(" ")) {
    return tokenGroup.join(" ").includes(activityFilter);
  }

  //return !!tokenGroup.find((tg) => tg.startsWith(activityFilter));
  return tokenGroup[0].includes(activityFilter);
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
