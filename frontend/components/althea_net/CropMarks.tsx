import { AltheaL } from "./AltheaL";
import { AltheaOne } from "./AltheaOne";
import styles from "./cropmarks.module.scss";

interface CropMarksProps {
  theme: string;
}

export const CropMarks: React.FC<CropMarksProps> = ({ theme }) => {
  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.top_left}>
          <AltheaL theme={"white"} />
        </div>
        <div className={styles.top_right}>
          <AltheaL theme={"white"} />
        </div>
        <div className={styles.bottom_left}>
          <AltheaL theme={"white"} />
        </div>
        <div className={styles.bottom_right}>
          <AltheaOne theme={"white"} />
        </div>
      </div>
    </div>
  );
};
