import clsx from "clsx";
import styles from "../styles/Loader.module.css";

type Props = {
  className?: string;
};

export default function Loader({ className }: Props) {
  return <div className={clsx(styles.loader, className)}></div>;
}
