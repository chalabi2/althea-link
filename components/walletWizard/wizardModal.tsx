import React, { useState, useEffect, useCallback } from "react";
import Modal from "@/components/modal/modal";
import Text from "@/components/text";
import Button from "@/components/button/button";
import styles from "./wizardModal.module.scss";
import Image from "next/image";
import { chainConfig, metamaskChainConfig } from "@/config/networks/canto";
import { truncateAddress } from "@/config/networks/helpers";
import { BroadcastMode, Keplr } from "@keplr-wallet/types";
import { ethToAlthea } from "@gravity-bridge/address-converter";
import { SigningStargateClient, coins } from "@cosmjs/stargate";

interface WalletWizardModalProps {
  isOpen: boolean;
  onOpen: (isOpen: boolean) => void;
  balance: any;
  onClose: () => void;
}

export const WalletWizardModal: React.FC<WalletWizardModalProps> = ({
  isOpen,
  onOpen,
  balance,
  onClose,
}) => {
  const [keplrAddress, setKeplrAddress] = useState("");
  const [metamaskAddress, setMetamaskAddress] = useState("");

  const chainId = "althea_417834-3";

  const metamaskToCosmosAddress = ethToAlthea(metamaskAddress);

  const getKeplr = async (): Promise<Keplr | undefined> => {
    if (window.keplr) {
      return window.keplr;
    }

    if (document.readyState === "complete") {
      return window.keplr;
    }

    return new Promise((resolve) => {
      const documentStateChange = (event: Event) => {
        if (document.readyState === "complete") {
          resolve(window.keplr);
          document.removeEventListener("readystatechange", documentStateChange);
        }
      };

      document.addEventListener("readystatechange", documentStateChange);
    });
  };

  const sendTokens = async () => {
    try {
      const keplr = await getKeplr();
      if (!keplr) {
        alert("Please install Keplr extension.");
        return;
      }

      await keplr.experimentalSuggestChain(chainConfig);
      await keplr.enable(chainId);

      const signer = window.keplr.getOfflineSigner(chainId);

      const amountInMicroDenom = coins(100000000, "aalthea");

      const fee = {
        amount: coins(5000, "aalthea"),
        gas: "200000",
      };

      const cosmJS = await SigningStargateClient.connectWithSigner(
        chainConfig.rpc,
        signer
      );
      const result = await cosmJS.sendTokens(
        keplrAddress,
        metamaskToCosmosAddress,
        amountInMicroDenom,
        fee,
        "Transfer via Keplr"
      );

      console.log("Transaction result:", result);
    } catch (error) {
      console.error("Failed to send tokens:", error);
    }
  };

  const connectToKeplr = async () => {
    try {
      const keplr = await getKeplr();
      if (!keplr) {
        return;
      }

      await keplr.experimentalSuggestChain(chainConfig);
      await keplr.enable(chainId);
      const signer = window.getOfflineSigner(chainId);
      const accounts = await signer.getAccounts();
      setKeplrAddress(accounts[0].address);
    } catch (error) {
      console.error("Error connecting to Keplr:", error);
    }
  };

  const connectToMetamask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setMetamaskAddress(accounts[0]);

        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (currentChainId !== metamaskChainConfig.chainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: metamaskChainConfig.chainId }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [metamaskChainConfig],
                });
              } catch (addError) {
                console.error("Failed to add the chain:", addError);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error connecting to Metamask:", err);
      }
    } else {
      console.error("Metamask is not installed");
    }
  };

  const showNextStep = keplrAddress && metamaskAddress;

  return (
    <Modal
      open={isOpen}
      onClose={() => onOpen(false)}
      height="auto"
      width="30rem"
    >
      <div className={styles["modalContent"]}>
        {!showNextStep && (
          <>
            {/* Migration source wallets */}
            <Text size="lg" font="proto_mono">
              Migrate from
            </Text>
            <div className={styles["buttonGroup"]}>
              {/* Keplr Connect Button */}
              <div className={styles["wallet-connect"]}>
                <Button width={200} height={34} onClick={connectToKeplr}>
                  <Image
                    src="/icons/keplr.png"
                    alt="Keplr"
                    width={24}
                    height={24}
                  />
                  {keplrAddress ? truncateAddress(keplrAddress) : "Keplr"}
                </Button>
              </div>
            </div>
            {/* Metamask Connect Button */}
            <Text size="lg" font="proto_mono">
              Migrate to
            </Text>
            <div className={styles["buttonGroup"]}>
              <div className={styles["wallet-connect"]}>
                <Button width={200} height={34} onClick={connectToMetamask}>
                  <Image
                    src="/icons/metamask.png"
                    alt="Metamask"
                    width={24}
                    height={24}
                  />
                  {metamaskAddress
                    ? truncateAddress(metamaskAddress)
                    : "Metamask"}
                </Button>
              </div>
              {/* Other wallets... */}
            </div>
          </>
        )}
        {showNextStep && (
          <>
            <div className="migration">
              <Text className="text" size="lg" font="proto_mono">
                Migrating your ALTHEA tokens
              </Text>

              <div className="parentContainer">
                <div className="addressBlocks">
                  <Text className="addressLabel" size="sm" font="proto_mono">
                    From:
                  </Text>
                  <Text className="addressText" size="sm" font="proto_mono">
                    {keplrAddress}
                  </Text>
                </div>
                <div className="addressBlocks">
                  <Text className="addressLabel" size="sm" font="proto_mono">
                    To:
                  </Text>
                  <Text className="addressText" size="sm" font="proto_mono">
                    {metamaskAddress}
                  </Text>
                </div>
                <Text>Amount: </Text>
                <Button onClick={sendTokens}>Migrate</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};