import { parseSunsetSchedule } from "./parsers/sunset-schedule";

const REC_CENTERS: Array<{
  location: string;
  url: string;
  initiallySelected: boolean;
  // css color
  color: string;
  parser: (
    body: string,
    activityFilter?: string
  ) => {
    Sunday: any[];
    Monday: any[];
    Tuesday: any[];
    Wednesday: any[];
    Thursday: any[];
    Friday: any[];
    Saturday: any[];
  };
}> = [
  {
    location: "Sunset",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Sunset-Rec-Center-110",
    color: "#99ccff",
    initiallySelected: true,
    parser: parseSunsetSchedule,
  },
  {
    location: "Glen Canyon Park",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Glen-Park-Rec-Center-89",
    color: "lightgreen",
    initiallySelected: true,
    parser: parseSunsetSchedule,
  },
  {
    location: "Hamilton Rec",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Hamilton-Rec-Center-93",
    color: "orange",
    initiallySelected: false,
    parser: parseSunsetSchedule,
  },
  {
    location: "Minnie Lovie Ward",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Minnie-Love-Ward-Recreation-Center-97",
    color: "mediumpurple",
    initiallySelected: false,
    parser: parseSunsetSchedule,
  },
  /*
  cheerio parser not working
  {
    location: "Eureka Valley",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Eureka-Valley-Recreation-Center-86",
    initiallySelected: false,
      color: "red",
    parser: parseSunsetSchedule,
  },
  */
  /*
  cheerio parser not working
  {
    location: "Bernal Heights",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Bernal-Heights-Recreation-Center-83",
    initiallySelected: false,
      color: "red",
    parser: parseSunsetSchedule,
  },
  */
  /*
  cheerio parser not working
  {
    location: "Upper Noe",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Upper-Noe-Recreation-Center-112",
      color: "red",
    initiallySelected: false,
    parser: parseSunsetSchedule,
  },
  */
  {
    location: "Potrero Hill",
    url: "https://sfrecpark.org/Facilities/Facility/Details/Potrero-Hill-Rec-Center-275",
    color: "yellowgreen",
    initiallySelected: false,
    parser: parseSunsetSchedule,
  },
];

export async function getSchedules() {
  let schedules = await Promise.all(
    REC_CENTERS.map(async (rc) => {
      const response = await fetch(rc.url);
      let body = await response.text();
      while (body.includes("An error has occurred")) {
        const response = await fetch(rc.url);
        body = await response.text();
      }
      //console.log(rc, body.length);

      // omit parser from return value
      const { parser, ...result }: any = rc;
      result.timeIntervals = rc.parser(body, "basketball");
      //if (result.timeIntervals.Tuesday.length === 0) {
      //console.log(rc, body);
      //}
      return result;
    })
  );
  //console.log(schedules);
  return schedules;
}
