import React from "react";
import Button from "@/components/button/button";
import styles from "./wizardModal.module.scss";
import Container from "../container/container";
import Icon from "../icon/icon";

import Text from "@/components/text";

interface ToastProps {
  isVisible: boolean;
  onOpenModal: () => void;
  onClose: () => void;
}

const ToastWizard: React.FC<ToastProps> = ({
  isVisible,
  onOpenModal,
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.toastContainer}>
      <Container className={styles.close} onClick={onClose}>
        <Icon
          themed
          icon={{
            url: "/close.svg",
            size: 40,
          }}
          style={{ filter: "invert(var(--dark-mode))" }}
        />
      </Container>
      <div className={styles.toastCaption}>
        <Text>Migrate your cosmos wallet?</Text>
      </div>
      <div className={styles.toastButton}>
        <Button onClick={onOpenModal}>Migrate</Button>
      </div>
    </div>
  );
};

export default ToastWizard;
