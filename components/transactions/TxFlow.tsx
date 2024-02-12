import React, { useEffect, useState, useRef } from "react";
import styles from "./transactions.module.scss";
import Image from "next/image";
import Text from "../text";
import TxItem from "./TxItem";
import Spacer from "../layout/spacer";
import Button from "../button/button";
import { formatError } from "@/utils/formatting";
import { BridgeStatus } from "@/transactions/interfaces";
import {
  TRANSACTION_FLOW_MAP,
  TX_PLACEHOLDER,
  TransactionFlow,
  TransactionFlowType,
} from "@/transactions/flows";
import { importERC20Token } from "@/utils/tokens";
import InfoPop from "../infopop/infopop";
import Analytics from "@/provider/analytics";
import { useToast } from "@/components/toast";
import useStaking from "@/hooks/staking/useStaking";

interface Props {
  txFlow?: TransactionFlow;
  onRetry: () => void;
  setBridgeStatus: (txIndex: number, status: BridgeStatus) => void;
  closeModal: () => void;
}

const TxFlow = (props: Props) => {
  const [canRetry, setCanRetry] = React.useState<{
    valid: boolean;
    error: string | undefined;
  }>({ valid: false, error: undefined });

  const [inProgress, setInProgress] = useState<boolean>(
    !(props.txFlow?.status === "ERROR" || props.txFlow?.status === "SUCCESS")
  );
  const toast = useToast();
  useEffect(() => {
    async function checkRetryParams() {
      if (props.txFlow?.status === "ERROR") {
        // check if we can retry
        const { data, error } = await TRANSACTION_FLOW_MAP[
          props.txFlow.txType
        ].validRetry(props.txFlow.params);
        if (error) {
          setCanRetry({ valid: false, error: error.message });
        }
        setCanRetry({
          valid: !data.error,
          error: data.error ? data.reason : undefined,
        });
      }
    }
    checkRetryParams();
  }, [props.txFlow?.status]);

  useEffect(() => {
    if (props.txFlow?.txType == TransactionFlowType.BRIDGE && inProgress) {
      if (props.txFlow?.status == "ERROR") {
        toast.add({
          toastID: new Date().getTime().toString(),
          primary: props.txFlow.title + " failed",
          state: "failure",
        });
      } else if (props.txFlow?.status == "SUCCESS") {
        toast.add({
          toastID: new Date().getTime().toString(),
          primary: props.txFlow.title + " successful",
          state: "success",
        });
      }
    }
  }, [props.txFlow?.status]);

  return (
    <div className={styles.container}>
      {props.txFlow && (
        <>
          <Image
            src={props.txFlow.icon ?? ""}
            width={50}
            height={50}
            alt={"Transaction"}
          />
          <Spacer height="30px" />

          <Text font="proto_mono" size="lg">
            {props.txFlow.title}
          </Text>
          <Spacer height="40px" />
          {props.txFlow?.error && (
            <Text>{formatError(props.txFlow.error)}</Text>
          )}
          {!props.txFlow.error && (
            <>
              {props.txFlow.transactions.map((tx, idx) => (
                <TxItem
                  key={idx}
                  tx={tx}
                  analyticsTxFlowInfo={
                    props.txFlow?.analyticsTransactionFlowInfo
                  }
                  idx={idx + 1}
                  setBridgeStatus={(status) =>
                    props.setBridgeStatus(idx, status)
                  }
                />
              ))}
              {props.txFlow.placeholderFlow && (
                <TxItem
                  tx={TX_PLACEHOLDER(props.txFlow.placeholderFlow)}
                  idx={props.txFlow.transactions.length + 1}
                  setBridgeStatus={() => false}
                />
              )}
            </>
          )}
          {props.txFlow.tokenMetadata && (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row-reverse",
                marginRight: "-6px",
              }}
            >
              <InfoPop>
                <Text size="xx-sm">
                  {
                    "Import token into wallet to view its balance. This only needs to be done once."
                  }
                </Text>
              </InfoPop>
              <Text
                size="xx-sm"
                weight="bold"
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  paddingTop: "3px",
                }}
              >
                <a
                  onClick={() => {
                    if (props.txFlow?.analyticsTransactionFlowInfo) {
                      Analytics.actions.events.transactionFlows.tokensImported(
                        props.txFlow?.analyticsTransactionFlowInfo
                      );
                    }
                    for (const token of props.txFlow?.tokenMetadata ?? []) {
                      importERC20Token(token);
                    }
                  }}
                >
                  Import Token
                </a>
              </Text>
            </div>
          )}
          {props.txFlow.status === "ERROR" && (
            <>
              <Spacer height="20px" />
              <Button
                disabled={!canRetry.valid}
                onClick={() => {
                  if (props.txFlow?.analyticsTransactionFlowInfo) {
                    const timeDifferenceInSeconds = Math.floor(
                      (new Date().getTime() - props.txFlow.createdAt) / 1000
                    );
                    Analytics.actions.events.transactionFlows.retry({
                      ...props.txFlow?.analyticsTransactionFlowInfo,
                      txRetryTimeInSeconds: timeDifferenceInSeconds,
                    });
                  }
                  setInProgress(true);
                  props.onRetry();
                }}
                width="fill"
              >
                RETRY
              </Button>
            </>
          )}
          {props.txFlow.status === "SUCCESS" && (
            <>
              <Spacer height="20px" />
              <Button
                width={"fill"}
                onClick={() => {
                  props.closeModal();
                  if (props.txFlow?.onSuccessCallback) {
                    props.txFlow.onSuccessCallback();
                  }
                }}
              >
                CLOSE
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TxFlow;
