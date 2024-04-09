"use client";
import styles from "./walletconnect.module.scss";
import { useEffect, useState } from "react";
import Analytics from "@/provider/analytics";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBalance } from "wagmi";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";

const WalletConnect = () => {
  const { signer } = useCantoSigner();
  const balance = useBalance({
    address: signer?.account.address,
    watch: true,
    chainId: signer?.chain.id,
  });

  useEffect(() => {
    if (signer?.account.address) {
      Analytics.actions.people.registerWallet(signer.account.address);
      Analytics.actions.identify(signer.account.address, {
        account: signer.account.address,
      });
      Analytics.actions.events.connections.walletConnect(true);
    }
  }, [signer]);

  return (
    <div className={styles.wallet_connect}>
      <ConnectButton key={balance.data?.formatted} chainStatus={"none"} />
    </div>
  );
};
export default WalletConnect;
