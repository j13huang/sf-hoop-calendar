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
      "tue: 10:00am - 3:30pm & 7:00 - 8:45pm basketball  10:00am - 12:30pm & 2:30 - 8:45pm table tennis ",
      "wed: 10:00am - 3:00pm basketball 10:00am - 6:00pm & 7:30pm - 8:45pm table tennis  7:00pm - 9:00pm volleyball ",
      "thu: 12:30pm - 3:30pm basketball 10:00am - 8:45pm table tennis 10:30am - 12:30pm badminton",
      "fri: 10:00am - 3:30pm & 7:00pm - 8:45pm basketball 10:00am - 8:45pm table tennis ",
      "sat: 9:00am - 5:00pm basketball and table tennis",
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
      "this facility will host day camp from june 12 through august 5. access to this facility will be limited on week days before 3pm during this time. ",
      " ",
      "this facility offers open gym hours for pickup basketball and other sports. ",
      " ",
      "tue: 3:00 - 7:30pm basketball ; 5:00 - 7:30pm badminton (1 court)",
      "  ",
      "wed: 2:45pm - 3:45pm zumba; 4:00pm – 6:00pm basketball; 6:00pm - 8:00pm volleyball ",
      "  ",
      "thu: 3:00pm - 7:30pm basketball ",
      "  ",
      "fri: 3:00pm – 4:30pm basketball; 4:30pm - 7:30pm pickleball",
      "  ",
      "sat: 2:00pm - 4:30pm basketball ",
      "",
      "open rock-climbing times",
      "sat: 10:00am - 11:00am; 11:00am - 12:00pm; 1:00pm - 2:00pm; 2:00pm - 3:00pm; 3:00pm - 4:00pm rock climbing ",
      " ",
      "climbers who have not filled out a waiver in the past two years should first fill out a waiver here. ",
      " ",
      "starting june 3, rock wall reservations can be made here beginning at 9am on saturdays. one form must be filled out per climber. fee is $12 per hour per climber.",
      "natural area",
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
      "tue: 10:00am - 3:30pm & 7:00 - 8:45pm basketball  10:00am - 12:30pm & 2:30 - 8:45pm table tennis ",
      //"wed: 10:00am - 3:00pm basketball 10:00am - 6:00pm & 7:30pm - 8:45pm table tennis  7:00pm - 9:00pm volleyball ",
      "wednesday: 10:00am - 6:00 basketball, 6:00pm - 8:00pm men's 55+basketball",
      "thu: 12:30pm - 3:30pm basketball 10:00am - 8:45pm table tennis 10:30am - 12:30pm badminton",
      "fri: 10:00am - 3:30pm & 7:00pm - 8:45pm basketball 10:00am - 8:45pm table tennis ",
      "sat: 9:00am - 5:00pm basketball and table tennis",
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

    const result = parse(times, ["basketball"]);
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });

  it("should filter to activity keyword (multiple words)", () => {
    const times = [
      "tuesday: 6:00pm - 7:30pm adult basketball:   ",
      "wednesday:  2:00pm - 5:00pm youth basketball    10:00am - 2:00 pm adult basketball   ",
      "thursday: 5:30pm - 7:30pm adult basketball:   2:00pm - 5:00pm youth basketball:   ",
      "friday:  2:00pm - 3:30pm youth basketball    10:00am - 2:00pm adult basketball   ",
      "saturday:  resumes in march   ",
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

    const result = parse(times, ["adult basketball"]);
    //console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual(expected);
  });

  it("should filter to activity keyword (multiple filters)", () => {
    // pulled from eureka valley rec saturday jun 11 2023
    const times = [
      "tue: 9:00am - 12:00pm 55 and better basketball, 12:00pm - 3:30pm drop-in basketball, drop-in open women's run 6:00pm - 8:00pm: ",
      "wed: 9:00am - 3:00pm drop-in basketball, 3:30pm - 6:30pm junior warriors practice (until 2/22/23): ",
      "thu: 9:00am - 12:00pm 55 and better basketball, 12:00pm - 3:00pm pickleball; 3:00pm - 5:30pm drop-in basketball; 5:30pm - 8:00pm drop-in volleyball (advanced players): ",
      "fri: 10:00am - 11:30am tots, 12:00pm - 3:00pm pickleball, 3:00pm - 5:00pm basketball; 5:00pm - 8:00pm pickleball: ",
      "sat: 9:00am - 1:00pm drop-in volleyball (advanced players), 1:00pm - 5:00pm junior warriors games (until 2/25/23):  report a maintenance issue to report a maintenance or vandalism issue at this site, call 311, or click here.  reserve a space at this facility",
    ];
    const expected = {
      Sunday: [],
      Monday: [],
      Tuesday: [[720, 930, "drop-in basketball"]],
      Wednesday: [[540, 900, "drop-in basketball"]],
      Thursday: [[900, 1050, "drop-in basketball"]],
      Friday: [[900, 1020, "basketball"]],
      Saturday: [],
    };

    const result = parse(times, ["drop-in basketball", "basketball"]);
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
      "tuesday: 6:00pm - 7:30pm adult basketball:   ",
      "wednesday:  2:00pm - 5:00pm youth basketball    10:00am - 2:00 pm adult basketball   ",
      "thursday: 5:30pm - 7:30pm adult basketball:   2:00pm - 5:00pm youth basketball:   ",
      "friday:  2:00pm - 3:30pm youth basketball    10:00am - 2:00pm adult basketball   ",
      "saturday:  resumes in march   ",
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
      "tuesday::  adult basketball: 6:00pm - 7:30pm ",
      "wednesday::  adult basketball: 10:00am - 2:00 pm  youth basketball: 2:00pm - 5:00pm ",
      "thursday::  youth basketball: 2:00pm - 5:00pm  adult basketball: 5:30pm - 7:30pm ",
      "friday::  adult basketball: 10:00am - 2:00pm  youth basketball: 2:00pm - 3:30pm ",
      "saturday::  resumes in march hours subject to change.",
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

  it("Handles extraneous semi-colons", () => {
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

  it("Handles long dashes", () => {
    const schedule =
      "2:45pm – 3:45pm ZUMBA 4:00pm – 6:00pm BASKETBALL 6:00pm – 8:00pm VOLLEYBALL";
    const expected = [
      ["2:45pm", "3:45pm"],
      ["ZUMBA"],
      ["4:00pm", "6:00pm"],
      ["BASKETBALL"],
      ["6:00pm", "8:00pm"],
      ["VOLLEYBALL"],
    ];

    const result = tokenize(schedule);
    //console.log(result);
    expect(result).toEqual(expected);
  });

  it("Handles times separated with a dash but no spaces", () => {
    const schedule =
      "2:45pm–3:45pm ZUMBA 4:00pm–6:00pm BASKETBALL 6:00pm–8:00pm VOLLEYBALL";
    const expected = [
      ["2:45pm", "3:45pm"],
      ["ZUMBA"],
      ["4:00pm", "6:00pm"],
      ["BASKETBALL"],
      ["6:00pm", "8:00pm"],
      ["VOLLEYBALL"],
    ];

    const result = tokenize(schedule);
    //console.log(result);
    expect(result).toEqual(expected);
  });

  it("reverses times when activity names come before times", () => {
    // pulled from sunset rec saturday jun 11 2023
    const schedule = "table tennis 9am–4:45pm basketball 9am–4:45pm ";
    const expected = [
      [],
      ["9:00am", "4:45pm"],
      ["basketball"],
      ["9:00am", "4:45pm"],
      ["table", "tennis"],
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
