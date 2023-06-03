import { useMemo } from "react";
import clsx from "clsx";
import styles from "../styles/CalendarDay.module.css";

import { minutesToTime } from "../lib/time-utils";

type Props = {
  day: string;
  schedules: any[];
};

// 800 to 2200
export const TIME_INCREMENTS = new Array(52)
  .fill(0)
  .map((_, i) => 480 + i * 15);

// NOTE: not implemented
// potentially more complex rendering scheme for multiple/overlapping schedule blocks between gyms,
// where schedule blocks have variable width depending on how many other blocks overlap with the time interval
export default function CalendarDay({ day, schedules }: Props) {
  let groupedTimeIntervals = useMemo(() => {
    return calculateTimeIntervalGroups(schedules, day);
  }, [schedules, day]);

  return (
    <div className={styles.day}>
      <div>{day}</div>
      <div>
        {TIME_INCREMENTS.map((timeIncrement) => {
          return (
            <div key={timeIncrement} className={styles.timeInterval}>
              {groupedTimeIntervals[timeIncrement] &&
                schedules.map((s, i) => {
                  let timeIntervals =
                    groupedTimeIntervals[timeIncrement][s.location];
                  if (timeIntervals == null) {
                    return null;
                  }
                  return <div key={i}>yo</div>;
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// export for testing
export function calculateTimeIntervalGroups(
  schedules: any[],
  day: string
): {
  [key: number]: (string | null)[];
} {
  // Schedules can overlap within a day, so we want to render them with the proper size in the day's column.
  // Find overlapping time intervals by sorting them and grouping them
  // Since times within a given gym should be sorted, we can use an n-merge to group time intervals together
  // Then each time interval's width can be scaled down based on how many unique locations each time interval is connected to

  // To maintain proper spacing, we will also need to keep note of empty spaces within a column at any given time increment

  // simple implementation just sorts the schedules
  let intervals = [];
  for (let s of schedules) {
    for (let timeInterval of s.timeIntervals) {
      intervals.push({
        location: s.location,
        timeInterval: s.timeIntervals[day],
      });
    }
  }
  intervals.sort((a, b) => {
    return a.timeInterval[0] - b.timeInterval[0];
  });
  //console.log(intervals);

  let result = {};
  let currentGroup = [];
  let visitedLocations = {};
  for (let interval of intervals) {
    //console.log(interval);
    if (
      currentGroup.length === 0 ||
      (currentGroup[currentGroup.length - 1].location !== interval.location &&
        areOverlappingIntervals(
          currentGroup[currentGroup.length - 1].timeInterval,
          interval.timeInterval
        ))
    ) {
      currentGroup.push(interval);
      visitedLocations[interval.location] = true;
      continue;
    }
    //console.log(currentGroup, visitedGroups);

    let groupData = calculateTimeIntervalsForGroup(
      Object.keys(visitedLocations),
      currentGroup
    );
    result = { ...result, ...groupData };
    //console.log(result);

    currentGroup = [interval];
    visitedLocations = { [interval.location]: true };
  }

  let groupData = calculateTimeIntervalsForGroup(
    Object.keys(visitedLocations),
    currentGroup
  );
  result = { ...result, ...groupData };

  console.log(result);
  return result;
}

function areOverlappingIntervals(a: number[], b: number[]): boolean {
  if (a[0] < b[0] && a[1] > b[0]) {
    return true;
  }

  if (a[0] > b[0] && a[0] < b[1]) {
    return true;
  }

  return false;
}

export function calculateTimeIntervalsForGroup(
  visitedLocations: string[],
  currentGroup: any[]
) {
  let { minTime, maxTime } = currentGroup.reduce(
    ({ minTime, maxTime }, group) => {
      return {
        minTime: Math.min(group[0], minTime),
        maxTime: Math.max(group[1], maxTime),
      };
    },
    { minTime: 0, maxTime: 0 }
  );

  let result = {};
  for (
    let timeIncrement = minTime - (minTime % 15);
    timeIncrement < maxTime;
    timeIncrement += 15
  ) {
    for (let group of currentGroup) {
      if (timeIncrement >= group[1]) {
        break;
      }

      // TODO: not implemented yet. needs to expand groups into timeintervals
      if (timeIncrement >= group[0]) {
        result[timeIncrement] = new Array(visitedLocations.length)
          .fill(null)
          .map((_) => {
            return;
          });
      }
    }
  }

  return result;
}
