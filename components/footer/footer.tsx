"use client";
import Image from "next/image";
import Text from "../text";
import styles from "./footer.module.scss";
import { useEffect, useState } from "react";
import { getTokenPriceInUSDC } from "@/utils/tokens";
import { useBlockNumber } from "wagmi";
import { CANTO_MAINNET_EVM } from "@/config/networks";
import Analytics from "@/provider/analytics";
import { CropMarks } from "../althea_net/CropMarks";
import Link from "next/link";

const Footer = () => {
  const [altheaPrice, setAltheaPrice] = useState("0");

  async function getTokenPrices() {
    // canto will use WCANTO address
    const [priceCanto] = await Promise.all([
      getTokenPriceInUSDC("0x826551890Dc65655a0Aceca109aB11AbDbD7a07B", 18),
    ]);
    if (!priceCanto.error) {
      setAltheaPrice(priceCanto.data);
    }
  }
  useEffect(() => {
    getTokenPrices();
  }, []);
  return (
    <div className={styles.container}>
      <CropMarks theme={"white"} />
      <Link href="/" className="footer-logo">
        <Image
          src="/altheaLink-white.svg"
          width={160}
          height={24}
          alt="althea"
        />
      </Link>
      <nav>
        <FooterLink href="https://docs.althea.net" text="Docs" />
        <FooterLink href="https://discord.gg/CmdEA2ArVJ" text="Discord" />
        <FooterLink href="https://twitter.com/altheanetwork" text="Twitter" />
        <FooterLink href="https://medium.com/althea-mesh" text="Blog" />
        <FooterLink href="https://althea.net" text="Althea L1" />
      </nav>
      {/* <FooterButton text="theme" /> */}
    </div>
  );
};

interface PropLink {
  href: string;
  text: string;
}
const FooterLink = ({ href, text }: PropLink) => {
  return (
    <Text size="sm" font="nm_plex" className={styles.link}>
      <a
        href={href}
        target="_blank"
        onClick={() =>
          Analytics.actions.events.externalLinkClicked({
            Website: text,
          })
        }
        rel="noreferrer"
      >
        {text}
      </a>
    </Text>
  );
};

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
        width: "160px",
        justifyContent: "center",
      }}
    >
      <span className={styles.status}></span>
      {blockString}
    </Text>
  );
};
export default Footer;
