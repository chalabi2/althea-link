import { ValidationReturn } from "@/config/interfaces";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { getCTokensFromType } from "@/hooks/lending/config/cTokenAddresses";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import useLending from "@/hooks/lending/useLending";
import { listIncludesAddress } from "@/utils/address.utils";
import {
  getCirculatingCNote,
  getCirculatingNote,
} from "@/utils/clm/noteStats.utils";
import {
  addTokenBalances,
  convertTokenAmountToNote,
} from "@/utils/tokens/tokenMath.utils";
import BigNumber from "bignumber.js";
import { useEffect, useMemo, useState } from "react";

interface LendingComboReturn {
  cTokens: {
    cNote: CTokenWithUserData | undefined;
    rwas: CTokenWithUserData[];
  };
  isLoading: boolean;
  clmPosition: {
    position: UserLMPosition;
    general: {
      maxAccountLiquidity: string;
      outstandingDebt: string;
      percentLimitUsed: string;
      netApr: string;
    };
  };
  transaction: {
    performTx: (amount: string, txType: CTokenLendingTxTypes) => void;
    validateParams: (
      amount: string,
      txType: CTokenLendingTxTypes
    ) => ValidationReturn;
  };
  selection: {
    selectedCToken: CTokenWithUserData | undefined;
    setSelectedCToken: (address: string | null) => void;
  };
  lendingStats: {
    circulatingCNote: string;
    circulatingNote: string;
    valueOfAllRWA: string;
    cNotePrice: string;
  };
}

interface LendingComboProps {
  onSuccessTx?: () => void;
}
export function useLendingCombo(props: LendingComboProps): LendingComboReturn {
  // params for useLending hook
  const { chainId, signer, txStore } = useCantoSigner();
  const { cTokens, position, isLoading, transaction, selection } = useLending({
    chainId,
    lmType: "lending",
    userEthAddress: signer?.account.address,
  });

  // sorted tokens
  const cNoteAddress = getCTokensFromType(chainId, "cNote");
  const cNote = cTokens.find((cToken) => cToken.address === cNoteAddress);

  const rwaAddressList = getCTokensFromType(chainId, "rwas");
  const rwas = cTokens.filter((cToken) =>
    listIncludesAddress(rwaAddressList ?? [], cToken.address)
  );

  // relevant user position data to show in UI
  const maxAccountLiquidity = addTokenBalances(
    position.totalBorrow,
    position.liquidity
  );
  const outstandingDebt = position.totalBorrow;
  const percentLimitUsed =
    Number(maxAccountLiquidity) === 0
      ? "0"
      : new BigNumber(position.totalBorrow)
          .dividedBy(maxAccountLiquidity)
          .multipliedBy(100)
          .toFixed(2);
  const netApr = new BigNumber(position.avgApr).toFixed(2);

  // lending stats (only need to call on page load, no need to update)
  const valueOfAllRWA = useMemo(() => {
    const bnValueOfAllRWA = rwas.reduce((acc, rwa) => {
      const { data: addedSupply, error } = convertTokenAmountToNote(
        rwa.underlyingTotalSupply,
        rwa.price
      );
      if (error) return acc;
      return acc.plus(addedSupply);
    }, new BigNumber(0));
    return bnValueOfAllRWA.toString();
  }, [rwas]);
  // circulating note
  const [circulatingNote, setCirculatingNote] = useState("0");
  const [circulatingCNote, setCirculatingCNote] = useState("0");
  useEffect(() => {
    async function getStats() {
      if (cNote?.underlying.address) {
        const [circulatingNote, circulatingCNote] = await Promise.all([
          getCirculatingNote(chainId, cNote.underlying.address),
          getCirculatingCNote(chainId, cNote.address),
        ]);
        if (circulatingNote.error || circulatingCNote.error) {
          console.log(circulatingNote.error ?? circulatingCNote.error);
          return;
        }
        setCirculatingNote(circulatingNote.data);
        setCirculatingCNote(circulatingCNote.data);
      }
    }
    getStats();
  }, [chainId, cNote?.underlying.address]);

  // transaction functions
  function lendingTx(amount: string, txType: CTokenLendingTxTypes) {
    if (!selection.selectedCToken || !signer) return;
    const { data, error } = transaction.createNewLendingFlow({
      chainId: signer.chain.id,
      ethAccount: signer.account.address,
      cToken: selection.selectedCToken,
      amount,
      txType,
    });
    if (error) {
      console.log(error);
      return;
    }
    txStore?.addNewFlow({
      txFlow: data,
      signer,
      onSuccessCallback: props.onSuccessTx,
    });
  }
  const validateParams = (
    amount: string,
    txType: CTokenLendingTxTypes
  ): ValidationReturn => {
    if (!selection.selectedCToken || !signer) return { isValid: false };
    return transaction.validateParams({
      chainId: signer.chain.id,
      ethAccount: signer.account.address,
      cToken: selection.selectedCToken,
      amount,
      txType,
    });
  };

  return {
    cTokens: {
      cNote,
      rwas,
    },
    isLoading,
    clmPosition: {
      position,
      general: {
        maxAccountLiquidity,
        outstandingDebt,
        percentLimitUsed,
        netApr,
      },
    },
    transaction: {
      performTx: lendingTx,
      validateParams,
    },
    selection,
    lendingStats: {
      circulatingCNote: circulatingCNote,
      circulatingNote: circulatingNote,
      valueOfAllRWA: valueOfAllRWA,
      cNotePrice: cNote?.exchangeRate ?? "0",
    },
  };
}
