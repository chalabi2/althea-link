"use client";

import Container from "@/components/container/container";
import styles from "./home.module.scss";
import Icon from "@/components/icon/icon";
import Button from "@/components/button/button";
import Link from "next/link";
import Image from "next/image";
import Glitch from "@/components/glitch/glitch";
import AnimatedBackgroundHome from "@/components/animated_background_home/animatedBackgroundHome";

export default function Home() {
  return (
    <>
      <AnimatedBackgroundHome initSize="570px" direction="in" time={20} />
      <Container
        className={styles.container}
        center={{
          vertical: true,
          horizontal: true,
        }}
      >
        <section className={styles.hero}>
          <Container direction="column" gap={20} style={{ paddingTop: "25px" }}>
            <Icon
              className={styles["hero-logo"]}
              // style={{ filter: "invert(var(--light-mode))" }}
              icon={{
                url: "/altheaLink.svg",
                size: {
                  width: 374,
                  height: 56,
                },
              }}
            />
            <Link href="/bridge">
              Bridge to Althea
              <Image
                src="/dropdown-blue.svg"
                style={{
                  transform: "translate(0, 2px) rotate(-90deg)",
                }}
                alt="right arrow icon"
                width={16}
                height={12}
              />
            </Link>
            {/* <a href="#ecosystem">
            {" "}
            <Button width={280}>Explore Ecosystem</Button>
          </a> */}
          </Container>

          {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="16"
          viewBox="0 0 28 16"
          fill="none"
        >
          <rect
            x="12.3076"
            y="12.3086"
            width="3.07692"
            height="3.07692"
            fill="var(--primary-90-color)"
          />
          <rect
            x="9.23096"
            y="9.23047"
            width="3.07692"
            height="3.07692"
            fill="var(--primary-90-color)"
          />
          <rect
            x="15.3848"
            y="9.23047"
            width="3.07692"
            height="3.07692"
            fill="var(--primary-90-color)"
          />
          <rect
            x="6.15381"
            y="6.15234"
            width="3.07692"
            height="3.07692"
            fill="var(--primary-90-color)"
          />
          <rect
            x="18.4614"
            y="6.15234"
            width="3.07692"
            height="3.07692"
            fill="var(--primary-90-color)"
          />
          <rect
            x="3.07715"
            y="3.07812"
            width="3.07692"
            height="3.07692"
            fill="var(--primary-90-color)"
          />
          <rect
            x="21.5386"
            y="3.07812"
            width="3.07692"
            height="3.07692"
            fill="var(--primary-90-color)"
          />
          <rect
            width="3.07692"
            height="3.07692"
            fill="var(--primary-90-color)"
          />
          <rect
            x="24.6152"
            width="3.07692"
            height="3.07692"
            fill="var(--primary-90-color)"
          />
        </svg> */}
        </section>

        {/* <section className={styles.ecosystem} id="ecosystem">
        <Text font="macan-font" size="title">
          Ecosystem
        </Text>

        <div className={styles["eco-grid"]}>
          <EcoTile
            name="Blank Rasa"
            description="Buy and Sell NFTs"
            image="/ecosystem/blank-rasa.svg"
            link="https://www.blankrasa.com/"
          />

          <EcoTile
            name="Slingshot"
            description="Swap tokens on Canto and 8 other networks"
            image="/ecosystem/slingshot.svg"
            link="https://slingshot.finance/"
          />

          <EcoTile
            name="Canto Identity Protocol"
            description="Build your onchain identity with expressive traits and NFTs"
            image="/ecosystem/cipp.png"
            link="https://cantoidentity.build/"
          />

          <EcoTile
            name="Vivacity"
            description="Coming Soon"
            image="/ecosystem/coming.svg"
            link=""
          />
        </div>
      </section> */}
      </Container>
    </>
  );
}
