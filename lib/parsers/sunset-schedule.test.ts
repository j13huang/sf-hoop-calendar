import { parse, tokenizeSchedule } from "./sunset-schedule";

describe("parse", () => {
  it("should parse days correctly for all activities", () => {
    const times = [
      "Tue: 10:00am - 3:30pm & 7:00 - 8:45pm Basketball  10:00am - 12:30pm & 2:30 - 8:45pm Table Tennis ",
      "Wed: 10:00am - 3:00pm Basketball 10:00am - 6:00pm & 7:30pm - 8:45pm Table Tennis  7:00pm - 9:00pm Volleyball ",
      "Thu: 12:30pm - 3:30pm Basketball 10:00am - 8:45pm Table Tennis 10:30am - 12:30pm Badminton",
      "Fri: 10:00am - 3:30pm & 7:00pm - 8:45pm Basketball 10:00am - 8:45pm Table Tennis ",
      "Sat: 9:00am - 5:00pm Basketball and Table Tennis",
    ];
    const expected = [
      [],
      [],
      [
        [600, 930, "Basketball"],
        [1140, 1245, "Basketball"],
        [600, 750, "Table Tennis"],
        [870, 1245, "Table Tennis"],
      ],
      [
        [600, 900, "Basketball"],
        [600, 1080, "Table Tennis"],
        [1170, 1245, "Table Tennis"],
        [1140, 1260, "Volleyball"],
      ],
      [
        [750, 930, "Basketball"],
        [600, 1245, "Table Tennis"],
        [630, 750, "Badminton"],
      ],
      [
        [600, 930, "Basketball"],
        [1140, 1245, "Basketball"],
        [600, 1245, "Table Tennis"],
      ],
      [[540, 1020, "Basketball and Table Tennis"]],
    ];

    const result = parse(times);
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });

  it("should filter to activity keyword", () => {
    const times = [
      "Tue: 10:00am - 3:30pm & 7:00 - 8:45pm Basketball  10:00am - 12:30pm & 2:30 - 8:45pm Table Tennis ",
      "Wed: 10:00am - 3:00pm Basketball 10:00am - 6:00pm & 7:30pm - 8:45pm Table Tennis  7:00pm - 9:00pm Volleyball ",
      "Thu: 12:30pm - 3:30pm Basketball 10:00am - 8:45pm Table Tennis 10:30am - 12:30pm Badminton",
      "Fri: 10:00am - 3:30pm & 7:00pm - 8:45pm Basketball 10:00am - 8:45pm Table Tennis ",
      "Sat: 9:00am - 5:00pm Basketball and Table Tennis",
    ];
    const expected = [
      [],
      [],
      [
        [600, 930, "basketball"],
        [1140, 1245, "basketball"],
      ],
      [[600, 900, "basketball"]],
      [[750, 930, "basketball"]],
      [
        [600, 930, "basketball"],
        [1140, 1245, "basketball"],
      ],
      [[540, 1020, "basketball"]],
    ];

    const result = parse(times, "basketball");
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });
});

describe("tokenizeSchedule", () => {
  it("should tokenize strings properly", () => {
    const schedule =
      "10:00am - 3:30pm & 7:00 - 8:45pm Basketball  10:00am - 12:30pm & 2:30 - 8:45pm Table Tennis";
    const expected = [
      ["10:00am", "3:30pm"],
      ["7:00", "8:45pm"],
      ["Basketball"],
      ["10:00am", "12:30pm"],
      ["2:30", "8:45pm"],
      ["Table", "Tennis"],
    ];

    const result = tokenizeSchedule(schedule);
    //console.log(result);
    expect(result).toEqual(expected);
  });
});
