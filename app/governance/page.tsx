"use client";

import { useMemo } from "react";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import useProposals from "@/hooks/gov/useProposals";
import ProposalTable from "./components/ProposalTable/ProposalTable";
import styles from "./gov.module.scss";
import Text from "@/components/text";
import Spacer from "@/components/layout/spacer";
import Button from "@/components/button/button";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import Splash from "@/components/splash/splash";
import Link from "next/link";
import Container from "@/components/container/container";
import LoadingComponent from "@/components/animated/loader";

export default function GovernancePage() {
  const { chainId } = useCantoSigner();
  const { proposals, isProposalsLoading } = useProposals({ chainId: chainId });

  const sorted_proposals = useMemo(
    () =>
      proposals.sort(
        (a: Proposal, b: Proposal) => b.proposal_id - a.proposal_id
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [proposals.length]
  );

  return isProposalsLoading ? (
    <div className={styles.loaderContainer}>
      <LoadingComponent size="lg" />
    </div>
  ) : (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <Text font="macan-font" className={styles.title}>
            Governance
          </Text>
          <Text size="sm" opacity={0.4} className={styles.middleText}>
            Stake your $ALTHEA to participate in governance
          </Text>
          <Link href="/staking">
            <Button>Go to Staking</Button>
          </Link>
        </div>

        <Spacer height="40px" />

        <ProposalTable proposals={sorted_proposals} />
        <Spacer height="40px" />
      </div>
    </div>
  );
}
