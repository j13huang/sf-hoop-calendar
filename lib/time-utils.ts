// upper and lowercase keys are added at runtime below
export const DATE_WORDS = {
  Sun: "Sunday",
  Sunday: "Sunday",
  Mon: "Monday",
  Monday: "Monday",
  Tue: "Tuesday",
  Tuesday: "Tuesday",
  Wed: "Wednesday",
  Wednesday: "Wednesday",
  Thu: "Thursday",
  Thursday: "Thursday",
  Fri: "Friday",
  Friday: "Friday",
  Sat: "Saturday",
  Saturday: "Saturday",
};

Object.keys(DATE_WORDS).forEach((dw) => {
  DATE_WORDS[dw.toLocaleLowerCase()] = DATE_WORDS[dw];
  DATE_WORDS[dw.toLocaleUpperCase()] = DATE_WORDS[dw];
});

export const TIME_REGEX = /\d{1,2}:\d{2}(am|pm)?/i;
export const SHORT_TIME_REGEX = /(1[0-2]|[1-9])(am|pm)/i;

// returns properly formatted time version of time if time
export function parseTime(time: string) {
  if (time.match(TIME_REGEX)) {
    return time;
  }

  let shortMatch = time.match(SHORT_TIME_REGEX);
  if (shortMatch) {
    return `${shortMatch[1]}:00${shortMatch[2]}`;
  }

  return null;
}

// convert to minutes from midnight
export function timeToMinutes(time: string): number {
  let number = 0;
  let matchedTime = time.match(TIME_REGEX);
  if (matchedTime && matchedTime[0].endsWith("pm")) {
    number += 720;
  }

  let nums = time.split(":");
  number += (nums[0] === "12" ? 0 : parseInt(nums[0])) * 60;
  number += parseInt(nums[1]);

  //console.log(time, number);
  return number;
}

export function minutesToTime(minutes: number) {
  let h = Math.floor(minutes / 60);
  let m = minutes % 60;
  return `${h}:${m.toLocaleString("en-US", { minimumIntegerDigits: 2 })}`;
}
