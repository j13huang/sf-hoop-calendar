import { useMemo, useState } from "react";
import clsx from "clsx";
import styles from "../styles/Calendar.module.css";

import CalendarDay, { TIME_INCREMENTS } from "./CalendarDay";
import { minutesToTime } from "../lib/time-utils";

type Props = {
  schedules: any[];
};

export default function Calendar({ schedules }: Props) {
  const [selectedLocations, setLocations] = useState(
    schedules.reduce((acc, s) => {
      //console.log(k, v);
      acc[s.location] = !!s.initiallySelected;
      return acc;
    }, {})
  );

  return (
    <div className={styles.container}>
      <div className={styles.checkboxes}>
        {schedules.map((s) => {
          return (
            <div key={s.location}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={!!selectedLocations[s.location]}
                  onChange={() =>
                    setLocations({
                      ...selectedLocations,
                      [s.location]: !selectedLocations[s.location],
                    })
                  }
                />
                {s.location} (
                <a target="_blank" href={s.url}>
                  website
                </a>
                )
              </label>
            </div>
          );
        })}
      </div>
      <div className={styles.calendarContainer}>
        <div key="times">
          <div>&nbsp;</div>
          <div className={styles.times}>
            {TIME_INCREMENTS.map((timeIncrement, i) => (
              <div key={timeIncrement} className={styles.timeIncrement}>
                {i % 4 === 0 ? minutesToTime(timeIncrement) : ""}
              </div>
            ))}
          </div>
        </div>
        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((day) => {
          return (
            <div key={day} className={styles.day}>
              <div className={styles.dayName}>{day}</div>
              <div className={styles.dayGymSchedules}>
                {schedules.map((s) => {
                  if (!selectedLocations[s.location]) {
                    return null;
                  }
                  return (
                    <div key={s.location} className={styles.dayGymSchedule}>
                      {TIME_INCREMENTS.map((timeIncrement) => {
                        let scheduleInterval = s.timeIntervals[day].find(
                          (s) => {
                            return (
                              timeIncrement >= s[0] && timeIncrement < s[1]
                            );
                          }
                        );
                        if (scheduleInterval == null) {
                          return (
                            <div
                              key={`${s.location}-${timeIncrement}`}
                              className={clsx(
                                styles.timeIncrement,
                                styles.emptyTimeIncrement
                              )}
                            >
                              {" "}
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`${s.location}-${timeIncrement}`}
                            className={clsx(
                              styles.timeIncrement,
                              "active",
                              scheduleInterval[0] === timeIncrement && "first"
                            )}
                          >
                            {scheduleInterval[0] === timeIncrement && (
                              <>
                                <div>{s.location}</div>
                                <div>
                                  {minutesToTime(scheduleInterval[0])} -{" "}
                                  {minutesToTime(scheduleInterval[1])}
                                </div>
                              </>
                            )}
                            <style jsx>{`
                              .active {
                                background-color: ${s.color};
                              }
                              .active.first {
                                z-index: 1;
                                overflow-x: clip;
                                padding: 4px;
                              }
                            `}</style>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div>{/*JSON.stringify(schedules, null, 2)*/}</div>
    </div>
  );
}
