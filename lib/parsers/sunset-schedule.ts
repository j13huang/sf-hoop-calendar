import cheerio from "cheerio";
import { DATE_WORDS, isTime, timeToMinutes } from "./time-utils";

export function parseSunsetSchedule(body, activityFilter?: string) {
  const $ = cheerio.load(body);
  const times = [];

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
  content.find("p").each((i, e) => {
    times.push($(e).text());
  });

  //console.log(times);
  let result = parse(times, activityFilter);
  //console.log("done", result);
  return result;
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
    const parts = t.split(":");
    const [day, schedule] = [parts[0], parts.slice(1).join(":").trim()];

    if (DATE_WORDS[day] == null) {
      return;
    }

    //console.log(day, DATE_WORDS[day], times, t);
    const parsedTimes = parseSchedule(schedule, activityFilter);
    //console.log(result, result[DATE_WORDS[day]]);
    if (result[DATE_WORDS[day]] == null) {
      console.log("non-date found", day);
    }
    result[DATE_WORDS[day]].push(...parsedTimes);
  });
  return result;
}

function parseSchedule(schedule: string, activityFilter?: string) {
  const tokenized = tokenizeSchedule(schedule);
  //console.log("tokenized", tokenized);
  return formatTokens(tokenized, activityFilter);
}

export function tokenizeSchedule(schedule: string) {
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

    if (isTime(token)) {
      if (chunk.length > 0 && !isTime(chunk[0])) {
        // we added a label (e.g. "Basketball") and we now found a time so label it and start a new chunk that will hold time
        result.push(chunk);
        chunk = [];
      }
      chunk.push(token);
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
  return result;
}

// adds AM/PM period indicators and joins descriptions together
// formats tokens to be description and times together
function formatTokens(tokenGroups: string[][], activityFilter?: string) {
  let result = [];
  let intervals = [];
  for (let tokenGroup of tokenGroups) {
    if (tokenGroup.length === 0) {
      intervals = [];
      continue;
    }

    if (!isTime(tokenGroup[0])) {
      if (
        activityFilter &&
        !tokenGroup[0].toLocaleLowerCase().includes(activityFilter)
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

    if (!tokenGroup[0].endsWith("m")) {
      // sometimes the first time doesn't have an AM/PM period indicator, so assume it is the same as the ending times's
      intervals.push([tokenGroup[0] + tokenGroup[1].slice(-2), tokenGroup[1]]);
      continue;
    }

    intervals.push(tokenGroup);
  }

  return result;
}
