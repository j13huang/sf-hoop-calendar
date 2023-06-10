import {
  parse,
  tokenize,
  guessAMPMPeriod,
  standardizedExtractedText,
} from "./schedules";

describe("parse", () => {
  it("should parse days correctly for all activities", () => {
    // pulled from sunset rec friday jun 2 2023
    const times = [
      "Tue: 10:00am - 3:30pm & 7:00 - 8:45pm Basketball  10:00am - 12:30pm & 2:30 - 8:45pm Table Tennis ",
      "Wed: 10:00am - 3:00pm Basketball 10:00am - 6:00pm & 7:30pm - 8:45pm Table Tennis  7:00pm - 9:00pm Volleyball ",
      "Thu: 12:30pm - 3:30pm Basketball 10:00am - 8:45pm Table Tennis 10:30am - 12:30pm Badminton",
      "Fri: 10:00am - 3:30pm & 7:00pm - 8:45pm Basketball 10:00am - 8:45pm Table Tennis ",
      "Sat: 9:00am - 5:00pm Basketball and Table Tennis",
    ];
    const expected = {
      Sunday: [],
      Monday: [],
      Tuesday: [
        [600, 930, "basketball"],
        [1140, 1245, "basketball"],
        [600, 750, "table tennis"],
        [870, 1245, "table tennis"],
      ],
      Wednesday: [
        [600, 900, "basketball"],
        [600, 1080, "table tennis"],
        [1170, 1245, "table tennis"],
        [1140, 1260, "volleyball"],
      ],
      Thursday: [
        [750, 930, "basketball"],
        [600, 1245, "table tennis"],
        [630, 750, "badminton"],
      ],
      Friday: [
        [600, 930, "basketball"],
        [1140, 1245, "basketball"],
        [600, 1245, "table tennis"],
      ],
      Saturday: [[540, 1020, "basketball and table tennis"]],
    };

    const result = parse(times);
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });

  it("should parse days correctly with lots of filler", () => {
    // pulled from glen canyon friday jun 2 2023
    const times = [
      "This facility will host day camp from June 12 through August 5. Access to this facility will be limited on week days before 3pm during this time. ",
      " ",
      "This facility offers open gym hours for pickup basketball and other sports. ",
      " ",
      "Tue: 3:00 - 7:30pm BASKETBALL ; 5:00 - 7:30pm BADMINTON (1 Court)",
      "  ",
      "Wed: 2:45pm - 3:45pm ZUMBA; 4:00pm – 6:00pm BASKETBALL; 6:00pm - 8:00pm VOLLEYBALL ",
      "  ",
      "Thu: 3:00pm - 7:30pm BASKETBALL ",
      "  ",
      "Fri: 3:00pm – 4:30pm BASKETBALL; 4:30pm - 7:30pm PICKLEBALL",
      "  ",
      "Sat: 2:00pm - 4:30pm BASKETBALL ",
      "",
      "Open Rock-Climbing Times",
      "Sat: 10:00am - 11:00am; 11:00am - 12:00pm; 1:00pm - 2:00pm; 2:00pm - 3:00pm; 3:00pm - 4:00pm rock climbing ",
      " ",
      "Climbers who have not filled out a waiver in the past two years should first fill out a waiver here. ",
      " ",
      "Starting June 3, rock wall reservations can be made HERE beginning at 9am on Saturdays. One form must be filled out per climber. Fee is $12 per hour per climber.",
      "Natural Area",
    ];
    const expected = {
      Sunday: [],
      Monday: [],
      Tuesday: [
        [900, 1170, "basketball ;"],
        [1020, 1170, "badminton (1 court)"],
      ],
      Wednesday: [
        [885, 945, "zumba;"],
        [960, 1080, "basketball;"],
        [1080, 1200, "volleyball"],
      ],
      Thursday: [[900, 1170, "basketball"]],
      Friday: [
        [900, 990, "basketball;"],
        [990, 1170, "pickleball"],
      ],
      Saturday: [
        [840, 990, "basketball"],
        [600, 660, "rock climbing"],
        [660, 720, "rock climbing"],
        [780, 840, "rock climbing"],
        [840, 900, "rock climbing"],
        [900, 960, "rock climbing"],
      ],
    };

    const result = parse(times);
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });

  it("should filter to activity keyword (single word)", () => {
    const times = [
      "Tue: 10:00am - 3:30pm & 7:00 - 8:45pm Basketball  10:00am - 12:30pm & 2:30 - 8:45pm Table Tennis ",
      //"Wed: 10:00am - 3:00pm Basketball 10:00am - 6:00pm & 7:30pm - 8:45pm Table Tennis  7:00pm - 9:00pm Volleyball ",
      "Wednesday: 10:00am - 6:00 BASKETBALL, 6:00pm - 8:00pm MEN'S 55+BASKETBALL",
      "Thu: 12:30pm - 3:30pm Basketball 10:00am - 8:45pm Table Tennis 10:30am - 12:30pm Badminton",
      "Fri: 10:00am - 3:30pm & 7:00pm - 8:45pm Basketball 10:00am - 8:45pm Table Tennis ",
      "Sat: 9:00am - 5:00pm Basketball and Table Tennis",
    ];
    const expected = {
      Sunday: [],
      Monday: [],
      Tuesday: [
        [600, 930, "basketball"],
        [1140, 1245, "basketball"],
      ],
      Wednesday: [[600, 1080, "basketball"]],
      Thursday: [[750, 930, "basketball"]],
      Friday: [
        [600, 930, "basketball"],
        [1140, 1245, "basketball"],
      ],
      Saturday: [[540, 1020, "basketball"]],
    };

    const result = parse(times, "basketball");
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });

  it("should filter to activity keyword (multiple words)", () => {
    const times = [
      "Tuesday: 6:00PM - 7:30PM Adult Basketball:   ",
      "Wednesday:  2:00PM - 5:00PM Youth Basketball    10:00AM - 2:00 PM Adult Basketball   ",
      "Thursday: 5:30PM - 7:30PM Adult Basketball:   2:00PM - 5:00PM Youth Basketball:   ",
      "Friday:  2:00PM - 3:30PM Youth Basketball    10:00AM - 2:00PM Adult Basketball   ",
      "Saturday:  Resumes in March   ",
    ];
    const expected = {
      Sunday: [],
      Monday: [],
      Tuesday: [[1080, 1170, "adult basketball"]],
      Wednesday: [[600, 840, "adult basketball"]],
      Thursday: [[1050, 1170, "adult basketball"]],
      Friday: [[600, 840, "adult basketball"]],
      Saturday: [],
    };

    const result = parse(times, "adult basketball");
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });
});

describe("standardizedExtractedText", () => {
  it("no-ops for lines where the entire day schedule is on one line", () => {
    const lines = [
      "Tuesday: 6:00PM - 7:30PM Adult Basketball:   ",
      "Wednesday:  2:00PM - 5:00PM Youth Basketball    10:00AM - 2:00 PM Adult Basketball   ",
      "Thursday: 5:30PM - 7:30PM Adult Basketball:   2:00PM - 5:00PM Youth Basketball:   ",
      "Friday:  2:00PM - 3:30PM Youth Basketball    10:00AM - 2:00PM Adult Basketball   ",
      "Saturday:  Resumes in March   ",
    ];
    const expected = [
      "Tuesday: 6:00PM - 7:30PM Adult Basketball:   ",
      "Wednesday:  2:00PM - 5:00PM Youth Basketball    10:00AM - 2:00 PM Adult Basketball   ",
      "Thursday: 5:30PM - 7:30PM Adult Basketball:   2:00PM - 5:00PM Youth Basketball:   ",
      "Friday:  2:00PM - 3:30PM Youth Basketball    10:00AM - 2:00PM Adult Basketball   ",
      "Saturday:  Resumes in March   ",
    ];

    const result = standardizedExtractedText(lines);
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });

  it("joins lines where the day is specified on its own line", () => {
    const lines = [
      "This facility offers open gym hours for pickup basketball, pickleball, volleyball, and more! Contact Facility Coordinator to confirm times.",
      "",
      "Tuesday:",
      "",
      "Adult Basketball:",
      " 6:00PM - 7:30PM",
      "",
      "Wednesday:",
      "",
      "Adult Basketball: 10:00AM - 2:00 PM",
      "",
      "Youth Basketball: 2:00PM - 5:00PM",
      "",
      "Thursday: ",
      "",
      "Youth Basketball:",
      " 2:00PM - 5:00PM",
      "",
      "Adult Basketball:",
      " 5:30PM - 7:30PM",
      "",
      "Friday: ",
      "",
      "Adult Basketball: 10:00AM - 2:00PM",
      "",
      "Youth Basketball: 2:00PM - 3:30PM",
      "",
      "Saturday:",
      "",
      "Resumes in March",
      "Hours subject to change.",
    ];
    const expected = [
      "Tuesday::  Adult Basketball: 6:00PM - 7:30PM ",
      "Wednesday::  Adult Basketball: 10:00AM - 2:00 PM  Youth Basketball: 2:00PM - 5:00PM ",
      "Thursday::  Youth Basketball: 2:00PM - 5:00PM  Adult Basketball: 5:30PM - 7:30PM ",
      "Friday::  Adult Basketball: 10:00AM - 2:00PM  Youth Basketball: 2:00PM - 3:30PM ",
      "Saturday::  Resumes in March Hours subject to change.",
    ];

    const result = standardizedExtractedText(lines);
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });
});

describe("tokenize", () => {
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

    const result = tokenize(schedule);
    //console.log(result);
    expect(result).toEqual(expected);
  });

  it("Handles extraneous colons", () => {
    const schedule =
      "2:45pm - 3:45pm ZUMBA; 4:00pm – 6:00pm BASKETBALL; 6:00pm - 8:00pm VOLLEYBALL";
    const expected = [
      ["2:45pm", "3:45pm"],
      ["ZUMBA;"],
      ["4:00pm", "6:00pm"],
      ["BASKETBALL;"],
      ["6:00pm", "8:00pm"],
      ["VOLLEYBALL"],
    ];

    const result = tokenize(schedule);
    //console.log(result);
    expect(result).toEqual(expected);
  });
});

describe("guessAMPMPeriod", () => {
  it("no-ops properly formatted times", () => {
    let tests = [
      {
        input: ["10:00am", "2:00pm"],
        expected: ["10:00am", "2:00pm"],
      },
    ];

    tests.forEach(({ input, expected }) => {
      const result = guessAMPMPeriod(input[0], input[1]);
      expect(result).toEqual(expected);
    });
  });

  it("when missing starting time period, sets time period to starting time period", () => {
    const input = ["2:00", "6:00pm"];
    const expected = ["2:00pm", "6:00pm"];
    const result = guessAMPMPeriod(input[0], input[1]);
    //console.log(result);
    expect(result).toEqual(expected);
  });

  it("when missing ending time period, guesses time period properly", () => {
    let tests = [
      {
        input: ["10:00am", "6:00"],
        expected: ["10:00am", "6:00pm"],
      },
      {
        input: ["10:00am", "2:00"],
        expected: ["10:00am", "2:00pm"],
      },
    ];

    tests.forEach(({ input, expected }) => {
      const result = guessAMPMPeriod(input[0], input[1]);
      expect(result).toEqual(expected);
    });
  });
});
