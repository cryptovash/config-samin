import { BigNumber } from 'ethers';

const POLLING_INTERVAL = 2000;

const CHAIN_IDS = Object.freeze({
  ETHEREUM_MAIN_NET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GÖRLI: 5,
  OPTIMISM: 10,
  KOVAN: 42,
  POLYGON: 137,
  MATIC_TESTNET: 80001,
  FANTOM: 250,
  FANTOM_TESTNET: 4002,
  XDAI: 100,
  BSC: 56,
  BSC_TESTNET: 97,
  ARBITRUM: 42161,
  ARBITRUM_TESTNET: 79377087078960,
  MOONBEAM_TESTNET: 1287,
  AVAX: 43114,
  HECO: 128,
  HECO_TESTNET: 256,
  HARMONY: 1666600000,
  HARMONY_TESTNET: 1666700000,
  OKEX: 66,
  OKEX_TESTNET: 65,
  KAVA: 2222,
  CANTO: 7700
});

const CHAIN_ICON_PATHS = {
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: '/assets/images/chains/ethereum.png',
  [CHAIN_IDS.ROPSTEN]: '/assets/images/chains/ropsten-chain.jpg',
  [CHAIN_IDS.RINKEBY]: '/assets/images/chains/rinkeby-chain.jpg',
  [CHAIN_IDS.GÖRLI]: '/assets/images/chains/goerli-chain.jpg',
  [CHAIN_IDS.KOVAN]: '/assets/images/chains/kovan-chain.jpg',
  [CHAIN_IDS.FANTOM]: '/assets/images/chains/fantom.png',
  [CHAIN_IDS.OPTIMISM]: '/assets/images/chains/optimism.png',
  [CHAIN_IDS.FANTOM_TESTNET]: '/assets/images/chains/fantom-chain.jpg',
  [CHAIN_IDS.BSC]: '/assets/images/chains/binance-smart-chain.png',
  [CHAIN_IDS.BSC_TESTNET]: '/assets/images/chains/binance-smart-chain.png',
  [CHAIN_IDS.POLYGON]: '/assets/images/chains/polygon.png',
  [CHAIN_IDS.MATIC_TESTNET]: '/assets/images/chains/matic-chain.jpg',
  [CHAIN_IDS.XDAI]: '/assets/images/chains/xdai-chain.jpg',
  [CHAIN_IDS.ARBITRUM]: '/assets/images/chains/arbitrum-chain.png',
  [CHAIN_IDS.AVAX]: '/assets/images/chains/avax.png',
  [CHAIN_IDS.HECO]: '/assets/images/chains/heco-chain.jpg',
  [CHAIN_IDS.HECO_TESTNET]: '/assets/images/chains/heco-chain.jpg',
  [CHAIN_IDS.HARMONY]: '/assets/images/chains/harmony-chain.jpg',
  [CHAIN_IDS.HARMONY_TESTNET]: '/assets/images/chains/harmony-chain.jpg',
  [CHAIN_IDS.OKEX]: '/assets/images/chains/okex-chain.jpg',
  [CHAIN_IDS.OKEX_TESTNET]: '/assets/images/chains/okex-chain.jpg',
  [CHAIN_IDS.KAVA]: '/assets/images/chains/kava.png',
  [CHAIN_IDS.CANTO]: '/assets/images/chains/canto.png'
};

interface ChainDetails {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  minimumTxAmount?: BigNumber
  defaultBlocksPerSecond?: BigNumber
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

const CHAIN_DETAILS: {
  // TODO: should type correctly
  [chainId: number]: ChainDetails
} = {
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18).div(13),
    rpcUrls: ['https://rpc.ankr.com/eth'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  [CHAIN_IDS.ARBITRUM]: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18),
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io']
  },
  [CHAIN_IDS.CANTO]: {
    chainId: '0x1e14',
    chainName: 'Canto',
    nativeCurrency: {
      name: 'Canto',
      symbol: 'CANTO',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(18),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18).div(6),
    rpcUrls: ['https://canto.gravitychain.io/'],
    blockExplorerUrls: ['https://evm.explorer.canto.io']
  },
  [CHAIN_IDS.OPTIMISM]: {
    chainId: '0xa',
    chainName: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18),
    rpcUrls: ['https://rpc.ankr.com/optimism'],
    blockExplorerUrls: ['https://optimistic.etherscan.io']
  },
  [CHAIN_IDS.FANTOM]: {
    chainId: '0xfa',
    chainName: 'Fantom',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18
    },
    defaultBlocksPerSecond: BigNumber.from(10).pow(18),
    rpcUrls: ['https://fantom.publicnode.com'],
    blockExplorerUrls: ['https://ftmscan.com']
  },
  [CHAIN_IDS.BSC]: {
    chainId: '0x38',
    chainName: 'BNB Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18).div(3),
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  [CHAIN_IDS.KAVA]: {
    chainId: '0x8ae',
    chainName: 'Kava',
    nativeCurrency: {
      name: 'Kava',
      symbol: 'KAVA',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18).mul(2).div(13),
    rpcUrls: ['https://evm.kava.io'],
    blockExplorerUrls: ['https://explorer.kava.io']
  },
  [CHAIN_IDS.POLYGON]: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [
      'https://rpc.ankr.com/polygon'
    ],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  [CHAIN_IDS.HECO]: {
    chainId: '0x80',
    chainName: 'Heco',
    nativeCurrency: {
      name: 'Heco Token',
      symbol: 'HT',
      decimals: 18
    },
    rpcUrls: ['https://http-mainnet.hecochain.com'],
    blockExplorerUrls: ['https://hecoinfo.com']
  },
  [CHAIN_IDS.XDAI]: {
    chainId: '0x64',
    chainName: 'xDai',
    nativeCurrency: {
      name: 'xDai Token',
      symbol: 'xDai',
      decimals: 18
    },
    rpcUrls: ['https://rpc.xdaichain.com'],
    blockExplorerUrls: ['https://blockscout.com/poa/xdai']
  },
  [CHAIN_IDS.HARMONY]: {
    chainId: '0x63564C40',
    chainName: 'Harmony One',
    nativeCurrency: {
      name: 'One Token',
      symbol: 'ONE',
      decimals: 18
    },
    rpcUrls: ['https://api.s0.t.hmny.io'],
    blockExplorerUrls: ['https://explorer.harmony.one/']
  },
  [CHAIN_IDS.AVAX]: {
    chainId: '0xA86A',
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://rpc.ankr.com/avalanche'],
    blockExplorerUrls: ['https://snowtrace.io']
  },
  [CHAIN_IDS.OKEX]: {
    chainId: '0x42',
    chainName: 'OKEx',
    nativeCurrency: {
      name: 'OKEx Token',
      symbol: 'OKT',
      decimals: 18
    },
    rpcUrls: ['https://exchainrpc.okex.org'],
    blockExplorerUrls: ['https://www.oklink.com/okexchain']
  }
};

const CHAIN_LABELS: { [chainId: number]: string } = {
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: 'Ethereum',
  [CHAIN_IDS.RINKEBY]: 'Rinkeby',
  [CHAIN_IDS.ROPSTEN]: 'Ropsten',
  [CHAIN_IDS.GÖRLI]: 'Görli',
  [CHAIN_IDS.KOVAN]: 'Kovan',
  [CHAIN_IDS.FANTOM]: 'Fantom',
  [CHAIN_IDS.OPTIMISM]: 'Optimism',
  [CHAIN_IDS.ARBITRUM]: 'Arbitrum',
  [CHAIN_IDS.FANTOM_TESTNET]: 'Fantom Testnet',
  [CHAIN_IDS.POLYGON]: 'Polygon',
  [CHAIN_IDS.MATIC_TESTNET]: 'Matic Testnet',
  [CHAIN_IDS.XDAI]: 'xDai',
  [CHAIN_IDS.BSC]: 'BNB\xa0Chain',
  [CHAIN_IDS.BSC_TESTNET]: 'BSC Testnet',
  [CHAIN_IDS.AVAX]: 'Avalanche',
  [CHAIN_IDS.HECO]: 'HECO',
  [CHAIN_IDS.HECO_TESTNET]: 'HECO Testnet',
  [CHAIN_IDS.HARMONY]: 'Harmony',
  [CHAIN_IDS.HARMONY_TESTNET]: 'Harmony Testnet',
  [CHAIN_IDS.OKEX]: 'OKExChain',
  [CHAIN_IDS.OKEX_TESTNET]: 'OKExChain',
  [CHAIN_IDS.KAVA]: 'Kava',
  [CHAIN_IDS.CANTO]: 'Canto'
};

const ACTIVE_CHAINS = [
  CHAIN_IDS.FANTOM,
  CHAIN_IDS.OPTIMISM,
  CHAIN_IDS.ARBITRUM,
  CHAIN_IDS.CANTO,
  CHAIN_IDS.BSC,
  CHAIN_IDS.ETHEREUM_MAIN_NET,
  CHAIN_IDS.KAVA,
  CHAIN_IDS.AVAX,
  CHAIN_IDS.POLYGON
];

export {
  CHAIN_IDS,
  POLLING_INTERVAL,
  CHAIN_ICON_PATHS,
  CHAIN_DETAILS,
  CHAIN_LABELS,
  ACTIVE_CHAINS
};
