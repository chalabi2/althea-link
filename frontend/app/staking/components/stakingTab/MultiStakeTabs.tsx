import styles from "./StakingTabs.module.scss";
import Text from "@/components/text";

interface StakingTabsProps {
  handleTabChange: (txType: "delegate" | "undelegate") => void;
  activeTab: "delegate" | "undelegate";
}

export const StakingTabs = (props: StakingTabsProps) => {
  return (
    <div className={styles.Tabs}>
      <div
        onClick={() => props.handleTabChange("delegate")}
        className={
          props.activeTab === "delegate" ? styles.activeTab : styles.Tab
        }
      >
        <Text font="macan-font">Delegate</Text>
      </div>
      <div
        onClick={() => props.handleTabChange("undelegate")}
        className={
          props.activeTab === "undelegate" ? styles.activeTab : styles.Tab
        }
      >
        <Text font="macan-font">Undelegate</Text>
      </div>
    </div>
  );
};
