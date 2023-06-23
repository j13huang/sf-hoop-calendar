import { useMemo, useState, useEffect } from "react";
import LocationCheckbox from "./LocationCheckbox";
import useMediaQuery from "./hooks/useMediaQuery";
import styles from "../styles/LocationCheckboxes.module.css";

type Props = {
  locationData: { location: string; url: string; color: string }[];
  selectedLocations: { [key: string]: boolean };
  onChange: (location: string) => void;
};

export default function LocationCheckboxes({
  locationData,
  selectedLocations,
  onChange,
}: Props) {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [isMinimized, setIsMinimized] = useState(false);
  return (
    <div className={styles.checkboxesContainer}>
      {isMobile && (
        <div
          className={styles.checkboxesHeader}
          onClick={() => {
            setIsMinimized(!isMinimized);
          }}
        >
          {isMinimized ? "∨ show locations" : "∧ hide locations"}
          <style jsx>{`
          .${styles.checkboxesHeader} {
            border-bottom: ${isMinimized ? "none" : "1px solid black"};
          `}</style>
        </div>
      )}
      {(!isMobile || !isMinimized) && (
        <div className={styles.checkboxes}>
          {locationData.map(({ location, url, color }) => {
            return (
              <LocationCheckbox
                key={location}
                location={location}
                minimized={isMobile && isMinimized}
                minimizedColor={color}
                url={url}
                enabled={!!selectedLocations[location]}
                onChange={() => {
                  onChange(location);
                }}
              />
            );
          })}
          <style jsx>{`
          .${styles.checkboxes} {
            flex-wrap: ${isMobile && isMinimized ? "nowrap" : "wrap"};
          `}</style>
        </div>
      )}
    </div>
  );
}
