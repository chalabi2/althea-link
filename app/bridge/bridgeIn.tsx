import React, { useState } from "react";
import Text from "@/components/text";
import Button from "@/components/button/button";
import styles from "./bridge.module.scss";
import Image from "next/image";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import Icon from "@/components/icon/icon";
import Modal from "@/components/modal/modal";

const BridgeIn = () => {
  const mockNetworks = [
    {
      name: "Ethereum",
      iconUrl: "/networks/ethereum.svg",
      balance: 0.43,
    },
    {
      name: "Layer Zero",
      iconUrl: "/networks/layer_zero.png",
      balance: 0.43,
    },
    {
      name: "Gravity Bridge",
      iconUrl: "/networks/graviton.svg",
      balance: 0.43,
    },
  ];

  const [selectedNetwork, setSelectedNetwork] = useState(mockNetworks[0]);

  const [choosingNetwork, setChoosingNetwork] = useState(false);
  const [choosingToken, setChoosingToken] = useState(false);

  return (
    <>
      <Modal
        open={choosingNetwork}
        onClose={() => {
          setChoosingNetwork(false);
        }}
        width="30rem"
        height="36rem"
      >
        <Text>Choose a Network</Text>
      </Modal>
      <Modal
        open={choosingToken}
        onClose={() => setChoosingToken(false)}
        width="30rem"
        height="36rem"
      >
        <Text>Choose a Token</Text>
      </Modal>

      <section className={styles.container}>
        <div className={styles["network-selection"]}>
          <Text size="sm">Select Network</Text>
          <div className={styles["networks-box"]}>
            <Button
              color="secondary"
              height={64}
              width="fill"
              onClick={() => {
                setChoosingNetwork(true);
              }}
            >
              <Container width="50px">
                <Text size="x-sm" theme="secondary-dark">
                  From
                </Text>
              </Container>
              <div className={styles.token}>
                <Image
                  src={selectedNetwork.iconUrl}
                  alt={`${selectedNetwork.name} icon`}
                  width={30}
                  height={30}
                />
                <Text size="md" font="proto_mono">
                  {selectedNetwork.name}
                </Text>
              </div>
              <Icon
                icon={{
                  url: "dropdown.svg",
                  size: 24,
                }}
              />
            </Button>
            <div className={styles["network-box"]}>
              <Container width="50px">
                <Text size="x-sm" theme="secondary-dark">
                  To
                </Text>
              </Container>
              <div className={styles.token}>
                <Image
                  src={"/networks/canto.svg"}
                  alt={"canto icon"}
                  width={30}
                  height={30}
                />
                <Text size="md" font="proto_mono">
                  Canto
                </Text>
              </div>
            </div>
          </div>
        </div>
        <Spacer height="100px" />

        <div className={styles["token-selection"]}>
          <Text size="sm">Select Token</Text>
          <div className={styles["token-box"]}>
            <Container width="50%">
              <Button
                color="secondary"
                width="fill"
                height="large"
                onClick={() => {
                  setChoosingToken(true);
                }}
              >
                <Container
                  width="100%"
                  direction="row"
                  gap={20}
                  center={{
                    vertical: true,
                  }}
                >
                  <Image
                    src={"/networks/graviton.svg"}
                    alt={"graviton icon"}
                    width={30}
                    height={30}
                  />
                  <Text size="md" font="proto_mono">
                    Graviton
                  </Text>
                </Container>
                <Icon
                  icon={{
                    url: "dropdown.svg",
                    size: 24,
                  }}
                />
              </Button>
            </Container>
          </div>
        </div>
        <Spacer height="100%" />
        <Button width="fill">BRIDGE IN</Button>
      </section>
    </>
  );
};

export default BridgeIn;