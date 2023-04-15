import { CHAIN_IDS } from 'config/web3/chains';

const MULTICALL_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x9903f30c1469d8A2f415D4E8184C93BD26992573',
  [CHAIN_IDS.OPTIMISM]: '0xFbdd194376de19a88118e84E279b977f165d01b8',
  [CHAIN_IDS.ARBITRUM]: '0x842eC2c7D803033Edf55E478F461FC547Bc54EB2',
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [CHAIN_IDS.BSC]: '0xff6fd90a470aaa0c1b8a54681746b07acdfedc9b',
  [CHAIN_IDS.KAVA]: '0x30A62aA52Fa099C4B227869EB6aeaDEda054d121',
  [CHAIN_IDS.CANTO]: '0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9',
  [CHAIN_IDS.AVAX]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
  [CHAIN_IDS.POLYGON]: '0x83017924D380Cb094Fa1751a24e84e727f79eda6'
};

export { MULTICALL_ADDRESSES };