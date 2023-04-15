// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// TODO: >

import { BigNumber } from '@ethersproject/bignumber';
import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from 'store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { formatUnits } from '@ethersproject/units';

export default function useXUnstake(poolId: number, amount: BigNumber, decimals: BigNumber, invalidInput: boolean): [ButtonState, () => Promise<void>] {
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const summary = `Unstake ${formatUnits(amount, decimals)} xTAROT`;

  const xUnstakeState: ButtonState = useMemo(() => {
    if (invalidInput) return ButtonState.Disabled;
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [pending, amount, poolId]);

  const xUnstake = useCallback(async (): Promise<void> => {
    if (xUnstakeState !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.xUnstake(amount, poolId, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [addTransaction, amount, poolId, decimals]);

  return [xUnstakeState, xUnstake];
}
