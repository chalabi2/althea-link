"use client";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import {
  Validator,
  ValidatorWithDelegations,
} from "@/hooks/staking/interfaces/validators";
import styles from "./MultiStakingModal.module.scss";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import { displayAmount } from "@/utils/formatting/balances.utils";
import Button from "@/components/button/button";
import { useMemo, useState, useCallback } from "react";
import { StakingTxTypes } from "@/transactions/staking";
import { StakingTabs } from "../stakingTab/MultiStakeTabs";
import Selector from "@/components/selector/selector";
import Amount from "@/components/amount/amount";
import { Validation } from "@/config/interfaces";
import { levenshteinDistance } from "@/utils/staking/searchUtils";
import { Fee } from "@/transactions/interfaces";
import {
  CLAIM_STAKING_REWARD_FEE,
  DELEGATE_FEE,
  REDELEGATE_FEE,
  UNDELEGATE_FEE,
} from "@/config/consts/fees";
import BigNumber from "bignumber.js";

import styled from "styled-components";

interface StakingModalParams {
  validators: Validator[];
  cantoBalance: string;
  txValidation: (
    amount: string,
    selectedTx: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ) => Validation;
  onConfirm: (
    amount: string,
    selectedTx: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ) => void;
}

interface ValidatorRowProps {
  validator: Validator;
  isSelected: boolean;
  onSelectionChange: (validatorAddress: string) => void;
}

const ValidatorRow: React.FC<ValidatorRowProps> = ({
  validator,
  isSelected,
  onSelectionChange,
}) => {
  return (
    <tr
      key={validator.operator_address}
      className={isSelected ? "selected" : ""}
      onClick={() => onSelectionChange(validator.operator_address)}
      style={{ cursor: "pointer" }}
    >
      <td>{validator.description.moniker}</td>
      <td>
        {displayAmount(
          BigNumber(validator.commission).multipliedBy(10000).toFixed(2),
          2,
          {
            short: true,
            commify: true,
            precision: 2,
          }
        )}
        %
      </td>
      <td>
        {displayAmount(
          BigNumber(validator.token_ratio).multipliedBy(10000).toFixed(2),
          2,
          {
            short: true,
            commify: true,
            precision: 2,
          }
        )}
        %
      </td>
    </tr>
  );
};

export const MultiStakingModal = (props: StakingModalParams) => {
  const [inputAmount, setInputAmount] = useState("");

  const [inputAmounts, setInputAmounts] = useState<{ [key: string]: string }>(
    {}
  );

  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);

  const [selectedTx, setSelectedTx] = useState<StakingTxTypes>(
    StakingTxTypes.DELEGATE
  );
  const [activeTab, setActiveTab] = useState<"delegate" | "undelegate">(
    "delegate"
  );
  const [validatorToRedelegate, setValidatorToRedelegate] =
    useState<Validator | null>();
  const [searchQuery, setSearchQuery] = useState("");

  const feeMap = (txType: StakingTxTypes) => {
    switch (txType) {
      case StakingTxTypes.DELEGATE:
        return DELEGATE_FEE.amount;
      case StakingTxTypes.UNDELEGATE:
        return UNDELEGATE_FEE.amount;
      case StakingTxTypes.CLAIM_REWARDS:
        return CLAIM_STAKING_REWARD_FEE.amount;
      default:
        return "0";
    }
  };

  const handleValidatorSelection = useCallback((validatorAddress: string) => {
    setSelectedValidators((prev) => {
      if (prev.includes(validatorAddress)) {
        return prev.filter((address) => address !== validatorAddress);
      }
      return [...prev, validatorAddress];
    });
  }, []);

  const handleAmountChange = (validatorAddress: string, amount: string) => {
    setInputAmounts((prev) => ({ ...prev, [validatorAddress]: amount }));
  };

  const validatorOptions = (
    <ValidatorTable>
      <table>
        <thead>
          <tr>
            <th>Moniker</th>
            <th>Commission</th>
            <th>Voting Power</th>
          </tr>
        </thead>
        <tbody>
          {props.validators
            .filter(
              (validator) =>
                validator.status === "BOND_STATUS_BONDED" && !validator.jailed
            )
            .map((validator) => (
              <ValidatorRow
                key={validator.operator_address}
                validator={validator}
                isSelected={selectedValidators.includes(
                  validator.operator_address
                )}
                onSelectionChange={handleValidatorSelection}
              />
            ))}
        </tbody>
      </table>
    </ValidatorTable>
  );

  const handleTabChange = (tab: "delegate" | "undelegate") => {
    setActiveTab(tab);
    setInputAmount("");
    if (tab == "delegate") {
      setSelectedTx(StakingTxTypes.DELEGATE);
    }
    if (tab == "undelegate") {
      setSelectedTx(StakingTxTypes.UNDELEGATE);
    }
  };

  const txValidation = useMemo(
    () => props.txValidation(inputAmount, selectedTx, validatorToRedelegate),
    [inputAmount, selectedTx, validatorToRedelegate, props]
  );

  return (
    <Container className={styles.modalContainer}>
      <Spacer />
      <Container className={styles.spacer}>
        <Spacer></Spacer>
      </Container>

      <Spacer height="20px"></Spacer>

      <StakingTabs handleTabChange={handleTabChange} activeTab={activeTab} />
      <Spacer height="20px"></Spacer>
      {validatorOptions}

      <Spacer height="20px"></Spacer>
      <div className={styles.modalInfoRow}>
        <div>
          <Text>Enter Amount</Text>
        </div>
        <div className={styles.modalInfoRow2}></div>
      </div>
      <div>
        <Amount
          IconUrl={"/althea.png"}
          title={"Althea"}
          symbol={"ALTHEA"}
          onChange={(val) => {
            setInputAmount(val.target.value);
          }}
          decimals={18}
          value={inputAmount}
          min={"0"}
          max={"100000000000000000000"}
        />
      </div>
      <Spacer height="10px" />
      <div style={{ width: "100%" }} className={styles.modalInfoRow}>
        <Text size="x-sm" color="#EE4B2B">
          Please Note: Undelegation period is 21 days
        </Text>
      </div>
      <Spacer height="20px" />
      <div>
        <Text size="x-sm" font="macan-font">
          GAS FEES :{" "}
          {displayAmount(feeMap(selectedTx), 18, {
            short: false,
            commify: false,
          })}{" "}
          ALTHEA
        </Text>
      </div>
      <Spacer height="20px"></Spacer>
      <div className={styles.buttonContainer}>
        <Button
          width="fill"
          onClick={() => {
            props.onConfirm(inputAmount, selectedTx, validatorToRedelegate);
          }}
          disabled={txValidation.error}
        >
          {selectedTx}
        </Button>
      </div>
    </Container>
  );
};

const ValidatorTable = styled.div`
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  margin: 10px 0;
  border-radius: 4px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  table {
    font:
      400 14px/20px "Macan",
      sans-serif;
    width: 100%;
    color: var(--darken-color);
    border-collapse: collapse;

    table-layout: fixed;
  }

  thead {
    text-align: center;
    background-color: var(--primary-light-color);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  th,
  td {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid var(--highlights);
  }

  th {
    font-weight: 600;
  }

  tbody tr:hover {
  }

  tbody tr.selected {
    background-color: var(--background-color-start);
  }
`;
