// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// TODO: >

import QuestionHelper from 'components/QuestionHelper';
import { useBorrowedUSD, useCurrentLeverage, useFullLendingPool, useLeverageAmounts, useNextBorrowAPY, useNextFarmingAPY } from 'hooks/useData';
import usePairAddress from 'hooks/usePairAddress';
import { PoolTokenType } from 'types/interfaces';
import { formatPercentage } from 'utils/format';
interface BorrowPositionAPRInfoProps {
  poolDetailPage?: boolean;
}

export default function BorrowPositionAPRInfo({ poolDetailPage }: BorrowPositionAPRInfoProps): JSX.Element {
  const lendingPoolId = usePairAddress();
  const pool = useFullLendingPool(lendingPoolId.toLowerCase()) || {};
  const slippage = 0;
  const currentLeverage = useCurrentLeverage();
  const changeAmounts = useLeverageAmounts(currentLeverage, slippage);
  const borrowedUSDA = useBorrowedUSD(PoolTokenType.BorrowableA);
  const borrowedUSDB = useBorrowedUSD(PoolTokenType.BorrowableB);
  const totalBorrowedUSD = borrowedUSDA + borrowedUSDB;
  const pctA = totalBorrowedUSD > 0 ? borrowedUSDA / totalBorrowedUSD : 0;
  const pctB = totalBorrowedUSD > 0 ? borrowedUSDB / totalBorrowedUSD : 0;

  let farmingPoolAPYA = useNextFarmingAPY(changeAmounts.bAmountA, PoolTokenType.BorrowableA);
  let farmingPoolAPYB = useNextFarmingAPY(changeAmounts.bAmountB, PoolTokenType.BorrowableB);

  let borrowAPYA = useNextBorrowAPY(changeAmounts.bAmountA, PoolTokenType.BorrowableA);
  let borrowAPYB = useNextBorrowAPY(changeAmounts.bAmountB, PoolTokenType.BorrowableB);

  if (isNaN(borrowAPYA)) {
    borrowAPYA = 0;
  }
  if (isNaN(borrowAPYB)) {
    borrowAPYB = 0;
  }
  if (isNaN(farmingPoolAPYA)) {
    farmingPoolAPYA = 0;
  }
  if (isNaN(farmingPoolAPYB)) {
    farmingPoolAPYB = 0;
  }

  const dexAPY = (pool.dexAPR || 0) * currentLeverage;
  const vaultAPY = (pool.vaultAPR || 0) * currentLeverage;

  const borrowAPY = (((pctA * borrowAPYA) + (pctB * borrowAPYB)) * (currentLeverage - 1));
  const farmingPoolAPY = (((pctA * farmingPoolAPYA) + (pctB * farmingPoolAPYB)) * (currentLeverage - 1));
  const leveragedAPY = (dexAPY + vaultAPY) + farmingPoolAPY - borrowAPY;

  if (!currentLeverage) {
    return (<></>);
  }
  return (
    <div className={`flex flex-row ${poolDetailPage ? '' : 'justify-center text-center'} mt-4`}>
      <div className={`flex flex-col ${poolDetailPage ? '' : 'justify-center text-center'}`}>
        <div>Current APR Estimate
          <QuestionHelper
            text={
              <div className='flex flex-col text-sm space-y-1'>
                {dexAPY > 0 &&
                <div className='flex justify-between'>
                  <div className='text-textSecondary'>Trading Fees:</div>
                  <div>{formatPercentage(dexAPY)}</div>
                </div>
                }
                {vaultAPY > 0 &&
                <div className='flex justify-between'>
                  <div className='text-textSecondary'>Vault Rewards:</div>
                  <div>{formatPercentage(vaultAPY)}</div>
                </div>
                }
                {farmingPoolAPY > 0 &&
                <div className='flex justify-between'>
                  <div className='text-textSecondary'>Farming:</div>
                  <div>{formatPercentage(farmingPoolAPY)}</div>
                </div>
                }
                {borrowAPY > 0 &&
                <div className='flex justify-between'>
                  <div className='text-textSecondary'>Borrows:</div>
                  <div>-{formatPercentage(borrowAPY)}</div>
                </div>
                }
              </div>
            } />
        </div>
        <div
          className={`${leveragedAPY >= 0 ? 'text-green-600' : 'text-red-700'} font-bold`}>{formatPercentage(leveragedAPY)}
        </div>
      </div>
    </div>
  );
}
