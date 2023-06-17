import useSchedule from "./hooks/useSchedule";
import clsx from "clsx";
import { minutesToTime } from "../lib/time-utils";
import styles from "../styles/DayGymSchedule.module.css";

type Props = {
  location: string;
  color: string;
  day: string;
  isToday: boolean;
  nowTotalMinutes: number;
};

// 800 to 2200
export const TIME_INCREMENTS = new Array(52)
  .fill(0)
  .map((_, i) => 480 + i * 15);

export default function DayGymSchedule({
  location,
  color,
  day,
  isToday,
  nowTotalMinutes,
}: Props) {
  let { timeIntervals, isLoading } = useSchedule(location, true);
  if (!timeIntervals || isLoading) {
    return null;
  }

  //console.log(location, schedule);
  return (
    <div className={styles.dayGymSchedule}>
      {TIME_INCREMENTS.map((timeIncrement) => {
        let scheduleInterval = timeIntervals[day].find((s) => {
          return timeIncrement >= s[0] && timeIncrement < s[1];
        });
        const currentTimeIntervalStyle = `
            div.currentTimeInterval {
              position: relative;
            }
            .currentTimeInterval::after {
              content: "";
              top: ${((nowTotalMinutes - timeIncrement) / 15) * 24}px;
              left: 0;
              width: 100%;
              height: 100%;
              position: absolute;
              border-top: 1px solid red;
            }
        `;
        let isCurrentTimeInterval =
          isToday &&
          nowTotalMinutes > timeIncrement &&
          nowTotalMinutes - timeIncrement <= 15;
        if (scheduleInterval == null) {
          return (
            <div
              key={`${location}-${timeIncrement}`}
              className={clsx(
                styles.timeIncrement,
                styles.emptyTimeIncrement,
                isCurrentTimeInterval && "currentTimeInterval"
              )}
            >
              <style jsx>{`
                ${currentTimeIntervalStyle}
              `}</style>
            </div>
          );
        }
        return (
          <div
            key={`${location}-${timeIncrement}`}
            className={clsx(
              styles.timeIncrement,
              "active",
              scheduleInterval[0] === timeIncrement && "first",
              isCurrentTimeInterval && "currentTimeInterval"
            )}
          >
            {scheduleInterval[0] === timeIncrement && (
              <>
                <div>{location}</div>
                <div>
                  {minutesToTime(scheduleInterval[0])} -{" "}
                  {minutesToTime(scheduleInterval[1])}
                </div>
              </>
            )}
            {/* not sure why we can't merge these */}
            <style jsx>{`
              ${currentTimeIntervalStyle}
            `}</style>
            <style jsx>{`
              .active {
                background-color: ${color};
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
}
