"use client";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import { ValidationReturn } from "@/config/interfaces";
import {
  GeneralAmbientPairRow,
  GeneralCantoDexPairRow,
  UserAmbientPairRow,
  UserCantoDexPairRow,
} from "./components/pairRow";
import Text from "@/components/text";
import { CantoDexLPModal } from "./components/cantoDexLPModal";
import styles from "./lp.module.scss";
import { CantoDexTransactionParams } from "@/hooks/pairs/cantoDex/interfaces/pairsTxTypes";
import useLP from "@/hooks/pairs/lpCombo/useLP";
import {
  isAmbientPool,
  isCantoDexPair,
} from "@/hooks/pairs/lpCombo/interfaces.ts/pairTypes";
import { AmbientModal } from "./components/ambientLPModal";
import { displayAmount } from "@/utils/tokenBalances.utils";
import Rewards from "./components/rewards";
import Container from "@/components/container/container";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { AmbientTransactionParams } from "@/hooks/pairs/newAmbient/interfaces/ambientPoolTxTypes";
import { addTokenBalances } from "@/utils/tokens/tokenMath.utils";

export default function Page() {
  const { txStore, signer, chainId } = useCantoSigner();
  // all pairs (ambient and cantoDex)
  const { cantoDex, ambient, selection, isLoading, claimRewards } = useLP({
    chainId,
    userEthAddress: signer?.account.address ?? "",
  });

  /** CANTO DEX */
  const { pairs: cantoDexPairs } = cantoDex;
  const sortedPairs = cantoDexPairs?.sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );
  const userCantoDexPairs = cantoDexPairs.filter(
    (pair) =>
      (pair.clmData?.userDetails?.balanceOfCToken !== "0" ||
        pair.clmData?.userDetails?.balanceOfUnderlying !== "0") &&
      pair.clmData?.userDetails?.balanceOfCToken !== undefined
  );

  // transactions
  function sendCantoDexTxFlow(params: Partial<CantoDexTransactionParams>) {
    const { data: flow, error } = cantoDex.transaction.createNewPairsFlow({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as CantoDexTransactionParams);
    if (error) {
      console.log(error);
    } else {
      txStore?.addNewFlow({
        txFlow: flow,
        signer: signer,
        onSuccessCallback: () => selection.setPair(null),
      });
    }
  }
  function canPerformCantoDexTx(
    params: Partial<CantoDexTransactionParams>
  ): ValidationReturn {
    return cantoDex.transaction.validateParams({
      chainId: chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as CantoDexTransactionParams);
  }

  /** AMBIENT */
  const { ambientPools } = ambient;
  const userAmbientPools = ambientPools.filter(
    (pool) => pool.userPositions.length > 0
  );

  //transactions
  function sendAmbientTxFlow(params: Partial<AmbientTransactionParams>) {
    const { data: flow, error } = ambient.transaction.createNewPoolFlow({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as AmbientTransactionParams);
    if (error) {
      console.log(error);
    } else {
      txStore?.addNewFlow({
        txFlow: flow,
        signer: signer,
        onSuccessCallback: () => selection.setPair(null),
      });
    }
  }
  function canPerformAmbientTx(
    params: Partial<AmbientTransactionParams>
  ): ValidationReturn {
    return ambient.transaction.validateParams({
      chainId: chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as AmbientTransactionParams);
  }

  /** general selection */
  const { pair: selectedPair, setPair } = selection;

  function sendClaimRewardsFlow() {
    const { data: flow, error } = claimRewards();
    if (error) {
      console.log(error);
    } else {
      txStore?.addNewFlow({
        txFlow: flow,
        signer: signer,
        onSuccessCallback: () => selection.setPair(null),
      });
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>{""}</div>;
  }

  //main content
  return (
    <div className={styles.container}>
      <Modal open={selectedPair !== null} onClose={() => setPair(null)}>
        {selectedPair && isCantoDexPair(selectedPair) && (
          <CantoDexLPModal
            pair={selectedPair}
            validateParams={canPerformCantoDexTx}
            sendTxFlow={sendCantoDexTxFlow}
          />
        )}
        {selectedPair && isAmbientPool(selectedPair) && (
          <AmbientModal
            pool={selectedPair}
            validateParams={canPerformAmbientTx}
            sendTxFlow={sendAmbientTxFlow}
          />
        )}
      </Modal>

      <Container direction="row" gap={"auto"} width="100%">
        <Text size="x-lg" className={styles.title}>
          LP
        </Text>
        <Spacer height="30px" />

        <Rewards
          onClick={sendClaimRewardsFlow}
          value={displayAmount(
            addTokenBalances(cantoDex.position.totalRewards, ambient.rewards),
            18,
            {
              precision: 4,
            }
          )}
        />
      </Container>
      <Spacer height="30px" />
      {userCantoDexPairs.length + userAmbientPools.length > 0 && (
        <Table
          title="Your Pairs"
          headers={[
            "Pair",
            "APR",
            "Pool Share",
            "Value",
            // "# LP Tokens",
            // "# Staked",
            "Rewards",
            "Edit",
          ]}
          columns={7}
          processedData={[
            ...userAmbientPools.map((pool) => (
              <UserAmbientPairRow
                key={pool.symbol}
                pool={pool}
                onManage={(poolAddress) => {
                  setPair(poolAddress);
                }}
                rewards={ambient.rewards}
              />
            )),
            ...userCantoDexPairs.map((pair) => (
              <UserCantoDexPairRow
                key={pair.symbol}
                pair={pair}
                onManage={(pairAddress) => {
                  setPair(pairAddress);
                }}
              />
            )),
          ]}
        />
      )}
      <Spacer height="40px" />
      <Table
        title="All Pairs"
        headers={["Pair", "APR", "TVL", "Type", "action"]}
        columns={6}
        processedData={[
          ...ambientPools.map((pool) => (
            <GeneralAmbientPairRow
              key={pool.symbol}
              pool={pool}
              onAddLiquidity={(poolAddress) => setPair(poolAddress)}
            />
          )),
          ...sortedPairs.map((pair) => (
            <GeneralCantoDexPairRow
              key={pair.symbol}
              pair={pair}
              onAddLiquidity={(pairAddress) => {
                setPair(pairAddress);
              }}
            />
          )),
        ]}
      />
      <Spacer height="40px" />
    </div>
  );
}