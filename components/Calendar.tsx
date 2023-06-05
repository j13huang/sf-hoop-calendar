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

  let now = new Date();
  let nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    <div className={styles.container}>
      <div className={styles.checkboxes}>
        {schedules.map((s) => {
          return (
            <label key={s.location} className={styles.checkbox}>
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
              {s.location}
              <br />(
              <a target="_blank" href={s.url}>
                website
              </a>
              )
            </label>
          );
        })}
      </div>
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
      <div className={styles.calendarContainer}>
        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((day, i) => {
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
                        let isCurrentTimeInterval =
                          now.getDay() === i &&
                          nowTotalMinutes > timeIncrement &&
                          nowTotalMinutes - timeIncrement <= 15;
                        if (scheduleInterval == null) {
                          return (
                            <div
                              key={`${s.location}-${timeIncrement}`}
                              className={clsx(
                                styles.timeIncrement,
                                styles.emptyTimeIncrement,
                                isCurrentTimeInterval && "currentTimeInterval"
                              )}
                            >
                              {/* not sure how to move these style tags up because I get an error*/}
                              <style jsx>{`
                                div.currentTimeInterval {
                                  position: relative;
                                }
                                .currentTimeInterval::after {
                                  content: "";
                                  top: ${((nowTotalMinutes - timeIncrement) /
                                    15) *
                                  24}px;
                                  left: 0;
                                  width: 100%;
                                  height: 100%;
                                  position: absolute;
                                  border-top: 1px solid red;
                                }
                              `}</style>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`${s.location}-${timeIncrement}`}
                            className={clsx(
                              styles.timeIncrement,
                              "active",
                              scheduleInterval[0] === timeIncrement && "first",
                              isCurrentTimeInterval && "currentTimeInterval"
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
                            {/* not sure how to move these style tags up because I get an error*/}
                            <style jsx>{`
                              div.currentTimeInterval {
                                position: relative;
                              }
                              .currentTimeInterval::after {
                                content: "";
                                top: ${((nowTotalMinutes - timeIncrement) /
                                  15) *
                                24}px;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                position: absolute;
                                border-top: 1px solid red;
                              }
                              .active {
                                background-color: ${s.color};
                                color: black;
                              }
                              .active.first {
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
