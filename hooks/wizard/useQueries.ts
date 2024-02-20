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
