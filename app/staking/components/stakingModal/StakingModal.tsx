"use client";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import {
  UnbondingDelegation,
  UserUnbondingDelegation,
  Validator,
  ValidatorWithDelegations,
} from "@/hooks/staking/interfaces/validators";
import { GetWalletClientResult } from "wagmi/actions";
import styles from "./StakingModal.module.scss";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import { displayAmount } from "@/utils/formatting/balances.utils";
import Button from "@/components/button/button";
import { useState } from "react";
import { StakingTxTypes } from "@/transactions/staking/interfaces/stakingTxTypes";
import { StakingTabs } from "../stakingTab/StakingTabs";
import Selector from "@/components/selector/selector";
import Amount from "@/components/amount/amount";

export interface StakingModalParams {
  validator: ValidatorWithDelegations | null;
  userStaking?: {
    validators: ValidatorWithDelegations[];
    unbonding: UnbondingDelegation[];
    cantoBalance: string;
  };
  signer: GetWalletClientResult | undefined;
  onConfirm: (
    validator: Validator | null,
    inputAmount: string,
    selectedTx: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ) => void;
  validators: Validator[];
}
export const StakingModal = (props: StakingModalParams) => {
  const [inputAmount, setInputAmount] = useState("");
  //const [isMaxClicked, setMaxClicked] = useState<boolean>(false);

  const [selectedTx, setSelectedTx] = useState<StakingTxTypes>(
    StakingTxTypes.DELEGATE
  );
  const [activeTab, setActiveTab] = useState<
    "delegate" | "undelegate" | "redelegate"
  >("delegate");
  const [validatorToRedelegate, setValidatorToRedelegate] =
    useState<Validator | null>();

  const splicedValidators = props.validators.filter(
    (validator) =>
      validator.operator_address !== props.validator?.operator_address
  );

  const dropdownItems = splicedValidators.map((validator) => {
    return {
      name: validator.description.moniker,
      id: validator.operator_address,
    };
  });

  const handleTabChange = (tab: "delegate" | "undelegate" | "redelegate") => {
    setActiveTab(tab);
    setInputAmount("");
    if (tab == "delegate") {
      setSelectedTx(StakingTxTypes.DELEGATE);
    }
    if (tab == "undelegate") {
      setSelectedTx(StakingTxTypes.UNDELEGATE);
    }
    if (tab == "redelegate") {
      setSelectedTx(StakingTxTypes.REDELEGATE);
    }
  };
  if (!props.validator) {
    return;
  }

  const userDelegationBalance: string | undefined =
    props.validator.userDelegation.balance;

  const userMaxBalance = userDelegationBalance ? userDelegationBalance : "0";

  const userCantoBalance =
    props.userStaking && props.userStaking.cantoBalance
      ? props.userStaking.cantoBalance
      : "0";

  const maxBalance =
    selectedTx == StakingTxTypes.DELEGATE ? userCantoBalance : userMaxBalance;
  const userStakedValidatorsAddressList = props.userStaking?.validators.map(
    (validatorWithDelegation) => validatorWithDelegation.operator_address
  );
  const hasUserStaked = userStakedValidatorsAddressList
    ? userStakedValidatorsAddressList.includes(props.validator.operator_address)
    : false;

  return (
    <Container className={styles.modalContainer}>
      <Spacer />
      <Container className={styles.spacer}>
        <Spacer></Spacer>
      </Container>
      <Spacer height="40px" />
      <Text weight="bold">{props.validator?.description.moniker}</Text>
      <Spacer height="20px"></Spacer>
      <div className={styles.modalInfoRow}>
        <div>
          <Text>Available Balance</Text>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: "5px" }}>
            <Text>
              {displayAmount(
                props.userStaking && props.userStaking.cantoBalance
                  ? props.userStaking.cantoBalance
                  : "0",
                18,
                { commify: true, short: false, precision: 2 }
              )}
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Icon themed icon={{ url: "/tokens/canto.svg", size: 16 }} />
          </div>
        </div>
      </div>
      <Spacer height="10px"></Spacer>
      <div className={styles.modalInfoRow}>
        <Text>Delegation</Text>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: "5px" }}>
            <Text>
              {displayAmount(
                userDelegationBalance ? userDelegationBalance : "0",
                18,
                { commify: true, short: false, precision: 2 }
              )}
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Icon themed icon={{ url: "/tokens/canto.svg", size: 16 }} />
          </div>
        </div>
      </div>
      <Spacer height="10px"></Spacer>
      <div className={styles.modalInfoRow}>
        <Text>Commission</Text>
        <Text>
          {displayAmount(props.validator.commission, -2, {
            commify: true,
            precision: 2,
          })}
          %
        </Text>
      </div>
      <Spacer height="20px"></Spacer>
      {hasUserStaked && (
        <StakingTabs
          handleTabChange={handleTabChange}
          activeTab={activeTab}
        ></StakingTabs>
      )}
      <Spacer height="20px"></Spacer>
      {selectedTx == StakingTxTypes.REDELEGATE && (
        <div>
          <Selector
            title="Redelegate"
            items={dropdownItems}
            activeItem={
              validatorToRedelegate
                ? {
                    name: validatorToRedelegate?.description.moniker,
                    id: validatorToRedelegate.operator_address,
                  }
                : {
                    name: "Select Validator",
                    id: "",
                  }
            }
            label={{ text: "", width: "10px" }}
            onChange={(selectedValidator) => {
              setValidatorToRedelegate(
                props.validators.find(
                  (e) => e.operator_address == selectedValidator
                )
              );
            }}
          />

          <Spacer height="20px"></Spacer>
        </div>
      )}
      <div className={styles.modalInfoRow}>
        <div>
          <Text>Enter Amount</Text>
        </div>
        <div className={styles.modalInfoRow2}></div>
      </div>
      <div>
        <Amount
          IconUrl={"/canto.svg"}
          title={"CANTO"}
          symbol={"CANTO"}
          onChange={(val) => {
            setInputAmount(val.target.value);
          }}
          decimals={18}
          value={inputAmount}
          min={""}
          max={maxBalance}
        ></Amount>
      </div>
      <Spacer height="10px" />
      <div style={{ width: "100%" }} className={styles.modalInfoRow}>
        <Text size="x-sm" color="#EE4B2B">
          Please Note: Undelegation period is 21 days
        </Text>
      </div>
      <Spacer height="20px"></Spacer>
      <div className={styles.buttonContainer}>
        <Button
          width="fill"
          onClick={() => {
            props.onConfirm(
              props.validator,
              inputAmount,
              selectedTx,
              validatorToRedelegate
            );
          }}
          disabled={
            Number(inputAmount) <= 0 ||
            (selectedTx == StakingTxTypes.REDELEGATE &&
              !validatorToRedelegate) ||
            Number(inputAmount) >
              Number(
                displayAmount(maxBalance, 18, {
                  commify: false,
                  short: false,
                  precision: 10,
                })
              )
          }
        >
          {selectedTx}
        </Button>
      </div>
    </Container>
  );
};
