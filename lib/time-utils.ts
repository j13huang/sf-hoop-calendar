export const DATE_WORDS = {
  Sun: "Sunday",
  Sunday: "Sunday",
  sun: "Sunday",
  sunday: "Sunday",
  Mon: "Monday",
  Monday: "Monday",
  mon: "Monday",
  monday: "Monday",
  Tue: "Tuesday",
  Tuesday: "Tuesday",
  tue: "Tuesday",
  tuesday: "Tuesday",
  Wed: "Wednesday",
  Wednesday: "Wednesday",
  wed: "Wednesday",
  wednesday: "Wednesday",
  Thu: "Thursday",
  Thursday: "Thursday",
  thu: "Thursday",
  thursday: "Thursday",
  Fri: "Friday",
  Friday: "Friday",
  fri: "Friday",
  friday: "Friday",
  Sat: "Saturday",
  Saturday: "Saturday",
  sat: "Saturday",
  saturday: "Saturday",
};

export const TIME_REGEX = /\d{1,2}:\d{2}(?:am|pm)?/i;

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

// only for testing
export function stripTimeFormattingReadable(time: string): number {
  let number = 0;
  if (time.endsWith("pm")) {
    number += 1200;
  }

  let nums = time.split(":");
  number += (nums[0] === "12" ? 0 : parseInt(nums[0])) * 100;
  number += parseInt(nums[1]);

  return number;
}
