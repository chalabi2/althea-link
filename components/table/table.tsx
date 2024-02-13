import { useEffect, useState } from "react";
import Text from "../text";
import styles from "./table.module.scss";
import useScreenSize from "@/hooks/helpers/useScreenSize";

interface Props {
  title?: string | React.ReactNode;
  secondary?: React.ReactNode;
  headerFont: "proto_mono" | "rm_mono";
  headers: {
    value: string | React.ReactNode;
    ratio: number;
    hideOnMobile?: boolean | undefined;
  }[];
  content: React.ReactNode[][] | React.ReactNode[];
  textSize?: string;
  onRowsClick?: (() => void)[];
}

const Table = (props: Props) => {
  const [isMobile, setIsMobile] = useState(false);
  const screen = useScreenSize();
  useEffect(() => {
    setIsMobile(screen.width < 768);
  }, [screen.width]);
  return (
    <div className={styles.container} style={{ fontSize: props.textSize }}>
      <div className={styles.title}>
        <Text font="proto_mono" size="lg" opacity={0.7}>
          {props.title}
        </Text>
        {props.secondary}
      </div>
      <div className={styles.table}>
        {isMobile && (
          <div
            className={styles.header}
            style={{
              gridTemplateColumns: props.headers
                .map((header) => {
                  const ratio = header.hideOnMobile ? 0 : header.ratio;
                  return `${ratio}fr`;
                })
                .join(" "),
            }}
          >
            {props.headers
              .filter(
                (header) =>
                  !header.hideOnMobile || header.hideOnMobile === undefined
              )
              .map((header, index) => {
                return (
                  <Text
                    key={index}
                    className={styles.cell}
                    font={props.headerFont}
                  >
                    {header.value}
                  </Text>
                );
              })}
          </div>
        )}
        {!isMobile && (
          <div
            className={styles.header}
            style={{
              gridTemplateColumns: props.headers
                .map((header) => {
                  return `${header.ratio}fr`;
                })
                .join(" "),
            }}
          >
            {props.headers.map((header, index) => {
              return (
                <Text
                  key={index}
                  className={styles.cell}
                  font={props.headerFont}
                >
                  {header.value}
                </Text>
              );
            })}
          </div>
        )}
        <div className={styles.content}>
          {props.content.map((row, index) => {
            //check if an array has been passed in
            if (!Array.isArray(row)) {
              return row;
            }
            return (
              <div
                key={index}
                className={styles.row}
                style={{
                  gridTemplateColumns: props.headers
                    .map((header) => {
                      const ratio =
                        isMobile && header.hideOnMobile ? 0 : header.ratio;
                      return `${ratio}fr`;
                    })
                    .join(" "),
                  cursor: isMobile && props.onRowsClick ? "pointer" : undefined,
                }}
                onClick={
                  isMobile && props.onRowsClick
                    ? props.onRowsClick[index]
                    : undefined
                }
              >
                {row.map((cell, index) => {
                  return (
                    <div key={index} className={styles.cell}>
                      {cell}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Table;
