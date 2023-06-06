import Loader from "./Loader";
import useSchedule from "./hooks/useSchedule";
import styles from "../styles/LocationCheckbox.module.css";

type Props = {
  location: string;
  url: string;
  enabled: boolean;
  onChange: () => void;
};

export default function LocationCheckbox({
  location,
  url,
  enabled,
  onChange,
}: Props) {
  let { isLoading } = useSchedule(location, enabled);
  return (
    <label className={styles.checkbox}>
      <input
        type="checkbox"
        disabled={isLoading}
        checked={enabled}
        onChange={() => onChange()}
      />
      <span>
        {location}
        {isLoading && <Loader className={styles.loader} />}
      </span>
      <br />(
      <a target="_blank" href={url}>
        website
      </a>
      )
    </label>
  );
}
