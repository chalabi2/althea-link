import { useQuery } from "react-query";

const fetchBalance = async (address: string) => {
  const response = await fetch(
    `https://nodes.chandrastation.com/testnet/api/althea/cosmos/bank/v1beta1/balances/${address}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const useBalance = (address: string) => {
  return useQuery(["balance", address], () => fetchBalance(address), {
    enabled: !!address,
  });
};

const fetchAccountInfo = async (address: string) => {
  const response = await fetch(
    `https://nodes.chandrastation.com/testnet/api/althea/cosmos/auth/v1beta1/accounts/${address}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return {
    account_number: data.account.base_account.account_number,
    sequence: data.account.base_account.sequence,
  };
};

export const useAccountInfo = (address: string) => {
  return useQuery(["accountInfo", address], () => fetchAccountInfo(address), {
    enabled: !!address,
  });
};
