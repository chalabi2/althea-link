import React from "react";
import Button from "@/components/button/button";
import styles from "./wizardModal.module.scss";

import Text from "@/components/text";

interface ToastProps {
  isVisible: boolean;
  onOpenModal: () => void;
}

const ToastWizard: React.FC<ToastProps> = ({ isVisible, onOpenModal }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.toastContainer}>
      <Text>Migrate your Cosmos Wallet?</Text>
      <div className="toastButton">
        <Button onClick={onOpenModal}>Migrate</Button>
      </div>
    </div>
  );
};

export default ToastWizard;
