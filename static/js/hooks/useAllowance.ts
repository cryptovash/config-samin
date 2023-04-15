// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { ApprovalType, PoolTokenType, BoostMaxxPoolInfo } from '../types/interfaces';
import usePairAddress from './usePairAddress';
import usePoolToken from './usePoolToken';
import { useRouterCallback } from './useTarotRouter';

export function useAllowance(approvalType: ApprovalType, pendingApproval?: boolean, poolTokenTypeArg?: PoolTokenType) {
  const uniswapV2PairAddress = usePairAddress();
  // TODO: <
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const poolTokenType = poolTokenTypeArg ? poolTokenTypeArg : usePoolToken();
  // TODO: >

  const [allowance, setAllowance] = useState<BigNumber>(null);
  useRouterCallback(async router => {
    router.getAllowance(uniswapV2PairAddress, poolTokenType, approvalType).then(data => setAllowance(data));
  }, [pendingApproval]);

  return allowance;
}

export function useMintAllowance(pendingApproval?: boolean) {
  const [allowance, setAllowance] = useState<BigNumber>(null);
  useRouterCallback(async router => {
    router.getMintAllowance().then(data => setAllowance(data));
  }, [pendingApproval]);
  return allowance;
}

export function useStakeAllowance(toApproveAddress: Address, pendingApproval?: boolean) {
  const [allowance, setAllowance] = useState<BigNumber>(null);
  useRouterCallback(async router => {
    router.getStakeAllowance(toApproveAddress).then(data => setAllowance(data));
  }, [pendingApproval, toApproveAddress]);
  return allowance;
}

export function useXStakeAllowance(pendingApproval?: boolean) {
  const [allowance, setAllowance] = useState<BigNumber>(null);
  useRouterCallback(async router => {
    router.getXStakeAllowance().then(data => setAllowance(data));
  }, [pendingApproval]);
  return allowance;
}

export function useBoostStakeAllowance(poolInfo: BoostMaxxPoolInfo, pendingApproval?: boolean) {
  const [allowance, setAllowance] = useState<BigNumber>(null);
  useRouterCallback(async router => {
    router.getBoostStakeAllowance(poolInfo).then(data => setAllowance(data));
  }, [pendingApproval]);
  return allowance;
}

export function useMigrateAllowance(toApproveAddress: Address, pendingApproval?: boolean) {
  const [allowance, setAllowance] = useState<BigNumber>(null);
  useRouterCallback(async router => {
    router.getMigrateAllowance(toApproveAddress).then(data => setAllowance(data));
  }, [pendingApproval, toApproveAddress]);
  return allowance;
}
