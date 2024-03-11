import React, { useState, useEffect, useCallback } from "react";
import Modal from "@/components/modal/modal";
import Text from "@/components/text";
import Button from "@/components/button/button";
import styles from "./wizardModal.module.scss";
import Image from "next/image";
import { chainConfig, metamaskChainConfig } from "@/config/networks/canto";
import { truncateAddress } from "@/config/networks/helpers";
import { Keplr } from "@keplr-wallet/types";
import { ethToAlthea } from "@gravity-bridge/address-converter";
import {
  Account,
  SignerData,
  SigningStargateClient,
  StdFee,
  coins,
} from "@cosmjs/stargate";

import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { useAccountInfo, useBalance } from "@/hooks/wizard/useQueries";
import { shiftDigits } from "../utils/shiftDigits";
import { cosmos } from "interchain";
import Icon from "../icon/icon";

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

  const balanceData = useBalance(keplrAddress);
  const accountInfoData = useAccountInfo(keplrAddress);
  const keplrBalance = balanceData.data?.balances[0]?.amount ?? "0";

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
      await keplr.enable(chainConfig.chainId);

      const signer = window.keplr.getOfflineSigner(chainConfig.chainId);

      const fee: StdFee = {
        amount: coins(10000, "aalthea"),
        gas: "2000000",
      };

      const cosmJS = await SigningStargateClient.connectWithSigner(
        chainConfig.rpc,
        signer
      );

      const { send } = cosmos.bank.v1beta1.MessageComposer.withTypeUrl;

      const msgSend = send({
        fromAddress: keplrAddress,
        toAddress: metamaskToCosmosAddress,
        amount: coins((keplrBalance - 100000).toString(), "aalthea"),
      });

      const explicitSignerData: SignerData = {
        accountNumber: accountInfoData.data?.account_number,
        sequence: accountInfoData.data?.sequence,
        chainId: chainId,
      };

      const signed = await cosmJS.sign(
        keplrAddress,
        [msgSend],
        fee,
        "",
        explicitSignerData
      );

      const result = await cosmJS.broadcastTx(
        Uint8Array.from(TxRaw.encode(signed).finish())
      );
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
      await keplr.enable(chainConfig.chainId);
      const signer = window.getOfflineSigner(chainConfig.chainId);
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
            <Text size="lg" font="macan-font">
              Wallet Wizard
            </Text>
            <Text size="sm" font="macan-font">
              The wallet wizard is a tool to help you migrate your Althea tokens
              from a wallet with an incorrect key type to another wallet with
              the correct key type.
            </Text>
            <Text size="sm" font="macan-font">
              Ethermint chains, like Althea, use the Ethermint key type while
              non Ethermint enabled Cosmos chains use the Cosmos key type. When
              attempting to utilize the Cosmos key type on Althea you will get
              errors.
            </Text>

            <div className={styles["buttonGroup"]}>
              {/* Keplr Connect Button */}

              <div className={styles["wallet-connect"]}>
                <Text size="md" font="macan-font">
                  Migrate From
                </Text>
                <Button width={200} height={34} onClick={connectToKeplr}>
                  <Image
                    src="/icons/keplr.png"
                    alt="Keplr"
                    width={24}
                    height={24}
                  />
                  {keplrAddress ? truncateAddress(keplrAddress) : "Connect"}
                </Button>
              </div>

              <Icon
                className={styles["pagination"]}
                icon={{
                  url: "/paginationRight.svg",
                  size: {
                    width: 30,
                    height: 15,
                  },
                }}
              />

              <div className={styles["wallet-connect"]}>
                <Text size="md" font="macan-font">
                  Migrate to
                </Text>
                <Button width={200} height={34} onClick={connectToMetamask}>
                  <Image
                    src="/icons/metamask.png"
                    alt="Metamask"
                    width={24}
                    height={24}
                  />
                  {metamaskAddress
                    ? truncateAddress(metamaskAddress)
                    : "Connect"}
                </Button>
              </div>
            </div>
          </>
        )}
        {showNextStep && (
          <>
            <div className={styles["migration"]}>
              <Text className="text" size="lg" font="macan-font">
                Migrating your ALTHEA tokens
              </Text>
              <Text className="text" size="sm" font="macan-font">
                Please review the details below before migrating your tokens.
              </Text>

              <div className={styles["address-blocks"]}>
                <Text weight="bold" size="sm" font="macan-font">
                  From:
                </Text>
                <Text size="sm" font="macan-font">
                  {keplrAddress}
                </Text>
              </div>
              <div className={styles["address-blocks"]}>
                <Text weight="bold" size="sm" font="macan-font">
                  To:
                </Text>
                <Text size="sm" font="macan-font">
                  {metamaskAddress}
                </Text>
              </div>
              <div className={styles["amount"]}>
                <Text
                  weight="bold"
                  size="sm"
                  font="macan-font"
                  className={styles["amount-label"]}
                >
                  Amount:
                </Text>

                <Text size="sm" font="macan-font">
                  {shiftDigits(keplrBalance, -18)}
                </Text>
                <Icon
                  className={styles["amountIcon"]}
                  icon={{
                    url: "/althea.png",
                    size: {
                      width: 20,
                      height: 20,
                    },
                  }}
                />
              </div>

              <Button
                disabled={keplrBalance <= 50000000000000000}
                onClick={sendTokens}
              >
                Migrate
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
