"use client";
import Text from "../text";
import styles from "./statustext.module.scss";
import { useEffect, useState } from "react";
import { useBlockNumber } from "wagmi";
import { CANTO_MAINNET_EVM } from "@/config/networks";

const StatusText = () => {
  const { data: blockNumber } = useBlockNumber({
    chainId: CANTO_MAINNET_EVM.chainId,
    watch: true,
  });

  const [blockString, setBlockString] = useState("Loading....");
  useEffect(() => {
    setBlockString(blockNumber?.toString() ?? "Loading....");
  }, [blockNumber?.toString()]);
  return (
    <Text
      size="x-sm"
      font="nm_plex"
      className={styles.item}
      style={{
        justifyContent: "center",
      }}
    >
      <span className={styles.status}></span>
      {blockString}
    </Text>
  );
};
export default StatusText;
