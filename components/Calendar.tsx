import { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import styles from "../styles/Calendar.module.css";
import dayGymScheduleStyles from "../styles/DayGymSchedule.module.css";

import LocationCheckbox from "./LocationCheckbox";
import DayGymSchedule from "./DayGymSchedule";
import CalendarDay, { TIME_INCREMENTS } from "./DayGymSchedule";
import { minutesToTime } from "../lib/time-utils";

type Props = {
  initialSelectedLocations: { [key: string]: boolean };
  locationData: { location: string; url: string; color: string }[];
};

export default function Calendar({
  initialSelectedLocations,
  locationData,
}: Props) {
  const [selectedLocations, setLocations] = useState(() => {
    //console.log("hmm", initialSelectedLocations);
    return initialSelectedLocations;
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    let cookieValue = Object.entries(selectedLocations).reduce(
      (acc, [k, v]) => {
        if (!!v) {
          acc[k] = true;
        }
        return acc;
      },
      {}
    );
    document.cookie = `selectedLocations=${encodeURIComponent(
      JSON.stringify(cookieValue)
    )};max-age=${60 * 60 * 24 * 365}`;
  }, [selectedLocations]);

  let now = new Date();
  let nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    <div className={styles.container}>
      <div className={styles.checkboxes}>
        {locationData.map(({ location, url }) => {
          return (
            <LocationCheckbox
              key={location}
              location={location}
              url={url}
              enabled={!!selectedLocations[location]}
              onChange={() => {
                setLocations({
                  ...selectedLocations,
                  [location]: !selectedLocations[location],
                });
              }}
            />
          );
        })}
      </div>
      <div key="times">
        <div>&nbsp;</div>
        <div className={styles.times}>
          {TIME_INCREMENTS.map((timeIncrement, i) => (
            <div
              key={timeIncrement}
              className={dayGymScheduleStyles.timeIncrement}
            >
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
                {locationData.map(({ location, color }) => {
                  if (!selectedLocations[location]) {
                    return null;
                  }
                  return (
                    <DayGymSchedule
                      key={location}
                      location={location}
                      color={color}
                      day={day}
                      isToday={now.getDay() === i}
                      nowTotalMinutes={nowTotalMinutes}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
