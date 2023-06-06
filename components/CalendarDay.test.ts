import { calculateTimeIntervalsForGroup } from "./DayGymSchedule";

describe("calculateTimeIntervalsForGroup", () => {
  it("calculates groups unique gym counts properly", () => {
    let daySchedules = [
      {
        location: "A",
        schedules: [[0, 2]],
      },
      {
        location: "B",
        schedules: [[1, 3]],
      },
    ];
    let expected = {
      "A-0": 2,
      "B-0": 2,
    };
    let result = calculateTimeIntervalsForGroup(daySchedules);
    expect(result).toEqual(expected);
  });

  it("sorts properly", () => {
    let daySchedules = [
      {
        location: "A",
        schedules: [[1, 3]],
      },
      {
        location: "B",
        schedules: [[0, 2]],
      },
    ];
    let expected = {
      "A-0": 2,
      "B-0": 2,
    };
    let result = calculateTimeIntervalsForGroup(daySchedules);
    expect(result).toEqual(expected);
  });

  it("does not group intervals that are touching but not overlapping", () => {
    let daySchedules = [
      {
        location: "A",
        schedules: [[0, 2]],
      },
      {
        location: "B",
        schedules: [[2, 4]],
      },
    ];
    let expected = {
      "A-0": 1,
      "B-0": 1,
    };
    let result = calculateTimeIntervalsForGroup(daySchedules);
    expect(result).toEqual(expected);
  });

  it("calculates overlapping interval group A->B->C->B->A", () => {
    let daySchedules = [
      {
        location: "A",
        schedules: [
          [0, 2],
          [6, 8],
        ],
      },
      {
        location: "B",
        schedules: [
          [1, 4],
          [5, 7],
        ],
      },
      {
        location: "C",
        schedules: [[3, 6]],
      },
    ];
    let expected = {
      "A-0": 3,
      "A-1": 3,
      "B-0": 3,
      "B-1": 3,
      "C-0": 3,
    };
    let result = calculateTimeIntervalsForGroup(daySchedules);
    expect(result).toEqual(expected);
  });

  it("calculates overlapping interval group A->C->B", () => {
    let daySchedules = [
      {
        location: "A",
        schedules: [[0, 2]],
      },
      {
        location: "B",
        schedules: [[3, 5]],
      },
      {
        location: "C",
        schedules: [[1, 4]],
      },
    ];
    let expected = {
      "A-0": 3,
      "B-0": 3,
      "C-0": 3,
    };
    let result = calculateTimeIntervalsForGroup(daySchedules);
    expect(result).toEqual(expected);
  });

  it("does not group overlapping times under the same gym", () => {
    let daySchedules = [
      {
        location: "A",
        schedules: [
          [0, 2],
          [1, 3],
        ],
      },
      {
        location: "B",
        schedules: [
          [2, 4],
          [3, 5],
        ],
      },
    ];
    let expected = {
      "A-0": 1,
      "A-1": 2,
      "B-0": 2,
      "B-1": 1,
    };
    let result = calculateTimeIntervalsForGroup(daySchedules);
    expect(result).toEqual(expected);
  });
});
