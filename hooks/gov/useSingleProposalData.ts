import { useQuery } from "react-query";
import {
  ProposalHookParams,
  ProposalHookReturn,
  ProposalHookReturnSingle,
} from "./interfaces/hookParams";
import { getCantoApiData } from "@/config/api";
import { Proposal } from "./interfaces/proposal";

export default function useSiingleProposalData(
  proposalId : number,
  params: ProposalHookParams,
  options?: {
    refetchInterval?: number;
  }
): ProposalHookReturnSingle {
  ///
  /// INTERNAL HOOKS
  ///

  // just need to fetch all proposals for this hook
  const { data: proposalData } = useQuery(
    ["proposals", params.chainId],
    async () => {
      const { data: proposals, error } = await getCantoApiData<Proposal>(
        params.chainId,
        "/v1/gov/proposals"+proposalId
      );
      if (error) throw error;
      //const proposalData = JSON.parse(proposals);
      return proposals;
    },
    {
      onSuccess: (data) => {
        // console.log("data", data);
      },
      onError: (error) => {
        console.log("error", error);
      },
      refetchInterval: options?.refetchInterval ?? 10000,
    }
  );
  //const proposals = proposalsData ? JSON.parse(proposalsData) : [];
  return {
    proposal: proposalData,
  };
}
