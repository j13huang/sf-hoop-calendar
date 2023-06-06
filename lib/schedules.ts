import { extractSunsetSchedule } from "./scrapers/sunset";
import { extractBernalSchedule } from "./scrapers/bernal";
import { extractUpperNoeSchedule } from "./scrapers/upper-noe";
import { DATE_WORDS, TIME_REGEX, timeToMinutes } from "./time-utils";

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

export async function getSchedules() {
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
  return parse(textSchedule, rc.activityFilter || "basketball");
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

    //console.log(day, DATE_WORDS[day], times, t);
    const tokenized = tokenize(schedule);
    //console.log("tokenized", tokenized);
    const parsedTimes = formatTokens(tokenized, activityFilter);
    result[DATE_WORDS[day]].push(...parsedTimes);
  });
  return result;
}

// export for testing
export function tokenize(schedule: string) {
  const result = [];
  const tokens = schedule.replace(/\s+/g, " ").split(" ");
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

    if (!!token.match(TIME_REGEX)) {
      if (chunk.length > 0 && !chunk[0].match(TIME_REGEX)) {
        // the current chunk contains a label (e.g. "Basketball") and this token is a time so we can start with a new chunk
        //console.log("labelled", chunk, token);
        result.push(chunk);
        chunk = [];
      }
      chunk.push(token);
    } else if (token === "-" || token === "–") {
      // 	"\u45" and 	"\u2013"
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
  return result;
}

// adds AM/PM period indicators and joins descriptions together with times
function formatTokens(tokenGroups: string[][], activityFilter?: string) {
  let result = [];
  let intervals = [];
  for (let tokenGroup of tokenGroups) {
    if (tokenGroup.length === 0) {
      intervals = [];
      continue;
    }

    //console.log("hey", tokenGroup[0].match(TIME_REGEX));
    if (!tokenGroup[0].match(TIME_REGEX)) {
      if (
        activityFilter &&
        !matchesActivityFilter(tokenGroup, activityFilter)
      ) {
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
      continue;
    }

    intervals.push(guessAMPMPeriod(tokenGroup[0], tokenGroup[1]));
  }

  return result;
}

function matchesActivityFilter(tokenGroup: string[], activityFilter: string) {
  if (activityFilter.includes(" ")) {
    return tokenGroup.join(" ").includes(activityFilter);
  }

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
