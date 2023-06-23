import clsx from "clsx";
import useSchedule from "./hooks/useSchedule";
import Loader from "./Loader";
import styles from "../styles/LocationCheckbox.module.css";

type Props = {
  location: string;
  url: string;
  minimized: boolean;
  minimizedColor: string;
  enabled: boolean;
  onChange: () => void;
};

export default function LocationCheckbox({
  location,
  minimized,
  minimizedColor,
  url,
  enabled,
  onChange,
}: Props) {
  let { isLoading } = useSchedule(location, enabled);
  /*
  if (minimized) {
    return (
      <div className={clsx(styles.checkbox, enabled && "minimizedChecked")}>
        <span>{location}</span>
        <style jsx>{`
          .minimizedChecked {
            background-color: ${minimizedColor};
            opacity: .8;
            color: black;
          `}</style>
      </div>
    );
  }
  */

  return (
    <label className={clsx(styles.checkbox, enabled && "minimizedChecked")}>
      <input
        type="checkbox"
        disabled={isLoading}
        checked={enabled}
        onChange={() => (isLoading ? null : onChange())}
      />
      {!minimized && (
        <>
          <span>
            {location}
            {isLoading && <Loader className={styles.loader} />}
          </span>
          <br />(
          <a target="_blank" href={url}>
            website
          </a>
          )
        </>
      )}
      {/*
      <style jsx>{`
          .minimizedChecked {
            background-color: ${minimizedColor};
            opacity: .8;
            color: #323232;
          `}</style>
          */}
    </label>
  );
}
