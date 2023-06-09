/* eslint-disable no-invalid-this */

import TarotRouter, { MulticallTask } from '.';
import * as R from 'ramda';
import { addressEquals, ZERO_ADDRESS } from 'utils/address';
import { Contract } from '@ethersproject/contracts';
import UniswapV2FactoryJSON from 'abis/contracts/IUniswapV2Factory.json';
import BaseV1FactoryJSON from 'abis/contracts/solidly/BaseV1Factory.json';
import UniswapV2PairJSON from 'abis/contracts/IUniswapV2Pair.json';
import { BigNumber, BigNumberish } from 'ethers';
import { chunkify } from 'utils/chunkify';
import EACAggregatorProxyJSON from 'abis/contracts/EACAggregatorProxy.json';
import { LENDING_POOLS_LIST } from 'config/web3/contracts/lending-pools';
import { BOOSTMAXX_POOLS_LIST } from 'config/web3/contracts/boostmaxx-pools';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/local-storage';
import { SUPPLY_VAULTS } from 'config/web3/contracts/supply-vault';
import { CHAIN_DETAILS, CHAIN_IDS } from 'config/web3/chains';
import { WETH_ADDRESSES } from 'config/web3/contracts/weth';
import { JsonRpcBatchProviderWithRetry } from 'utils/helpers/web3/provider';

function _f(x0: BigNumber, y: BigNumber) : BigNumber {
  return x0.mul(y.pow(2).div(TEN_18).mul(y).div(TEN_18)).div(TEN_18).add(
    x0.pow(2).div(TEN_18).mul(x0).div(TEN_18).mul(y).div(TEN_18)
  );
}

function _d(x0: BigNumber, y: BigNumber) : BigNumber {
  return BigNumber.from(3).mul(x0).mul(y.pow(2).div(TEN_18)).div(TEN_18).add(x0.pow(2).div(TEN_18).mul(x0).div(TEN_18));
}

function _getY(x0: BigNumber, xy: BigNumber, y: BigNumber) : BigNumber {
  for (let i = 0; i < 255; i++) {
    const yPrev = y;
    const k = _f(x0, y);
    if (k.lt(xy)) {
      const dy = (xy.sub(k)).mul(TEN_18).div(_d(x0, y));
      y = y.add(dy);
    } else {
      const dy = (k.sub(xy)).mul(TEN_18).div(_d(x0, y));
      y = y.sub(dy);
    }
    if (y.gt(yPrev)) {
      if (y.sub(yPrev).lte(1)) {
        return y;
      }
    } else {
      if (yPrev.sub(y).lte(1)) {
        return y;
      }
    }
  }

  return y;
}

function _k(x: BigNumber, y: BigNumber, decimals0: BigNumberish, decimals1: BigNumberish, stable = false) : BigNumber {
  if (stable) {
    const _x = x.mul(TEN_18).div(decimals0);
    const _y = y.mul(TEN_18).div(decimals1);
    const _a = (_x.mul(_y)).div(TEN_18);
    const _b = _x.pow(2).div(TEN_18).add(_y.pow(2).div(TEN_18));
    return _a.mul(_b).div(TEN_18); // x3y+y3x >= k
  } else {
    return x.mul(y); // xy >= k
  }
}

const increasePriceProgress = (router: TarotRouter, maxPriceProgress: number) => {
  setTimeout(() => {
    if (router.priceProgress >= maxPriceProgress) {
      return;
    }
    // Your logic here
    router.updatePriceProgress(Math.min(router.priceProgress + 4, maxPriceProgress));
    increasePriceProgress(router, maxPriceProgress);
  }, 1000);
};

const ZERO = BigNumber.from(0);

const TEN_18 = BigNumber.from(10).pow(18);

const stablecoinList = {
  [CHAIN_IDS.FANTOM]: [
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75' // USDC
  ],
  [CHAIN_IDS.OPTIMISM]: [
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' // USDC
  ],
  [CHAIN_IDS.ARBITRUM]: [
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' // USDC
  ],
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
  ],
  [CHAIN_IDS.BSC]: [
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' // BUSD
  ],
  [CHAIN_IDS.KAVA]: [
    '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f' // USDC
  ],
  [CHAIN_IDS.CANTO]: [
    '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd' // USDC
  ],
  [CHAIN_IDS.AVAX]: [
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' // USDC
  ],
  [CHAIN_IDS.POLYGON]: [
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' // USDC
  ]
};

const stablecoinPriceFeeds = {
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: '0x8fffffd4afb6115b954bd326cbe7b4ba576818f6',
  [CHAIN_IDS.BSC]: '0xcbb98864ef56e9042e7d2efef76141f15731b82f'
};

const bridgeTokensByChain = {
  [CHAIN_IDS.FANTOM]: {
    // wMEMO => MIM
    '0xddc0385169797937066bbd8ef409b5b3c0dfeb52': '0x82f0b8b456c1a451378467398982d4834b6829c1',
    // sspell => spell
    '0xbb29d2a58d880af8aa5859e30470134deaf84f2b': '0x468003b688943977e6130f4f68f23aad939a1040',
    // busd => fusdt
    '0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50': '0x049d68029688eabf473097a2fc38ef61633a3c7a',
    // mimatic => usdc
    '0xfb98b335551a418cd0737375a2ea0ded62ea213b': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // oxd => usdc
    '0xc165d941481e68696f43ee6e99bfb2b23e0e3114': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // frax => usdc
    '0xdc301622e621166bd8e82f2ca0a26c13ad0be355': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // xtarot => tarot
    '0x74d1d2a851e339b8cb953716445be7e8abdf92f4': '0xc5e2b037d30a390e62180970b3aa4e91868764cd',
    // xboo => boo
    '0xa48d959ae2e88f1daa7d5f611e01908106de7598': '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
    // fbeets => beets
    '0xfcef8a994209d6916eb2c86cdd2afd60aa6f54b1': '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e',
    // binspirit => spirit
    '0x44e314190d9e4ce6d4c0903459204f8e21ff940a': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // weve => usdc
    '0x911da02c1232a3c3e1418b834a311921143b04d7': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // renbtc => btc
    '0xdbf31df14b66535af65aac99c32e9ea844e14501': '0x321162cd933e2be498cd2267a90534a804051b11',
    // solidsex => solid
    '0x41adac6c1ff52c5e27568f27998d747f7b69795b': '0x888ef71766ca594ded1f0fa3ae64ed2941740a20',
    // linspirit => spirit
    '0xc5713b6a0f26bf0fdc1c52b90cd184d950be515c': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // syn => usdc
    '0xe55e19fb4f2d85af758950957714292dac1e25b2': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // rainspirit => spirit
    '0xf9c6e3c123f0494a4447100bd7dbd536f43cc33a': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // fxs => frax
    '0x7d016eec9c25232b01f23ef992d98ca97fc2af5a': '0xdc301622e621166bd8e82f2ca0a26c13ad0be355',
    // sinspirit => spirit
    '0x749f2b95f950c4f175e17aa80aa029cc69a30f09': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // based => tomb
    '0x8d7d3409881b51466b483b11ea1b8a03cded89ae': '0x6c021ae822bea943b2e66552bde1d2696a53fbb7',
    // dei => usdc
    '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // xscream => scream
    '0xe3d17c7e840ec140a7a51aca351a482231760824': '0xe0654c8e6fd4d733349ac7e09f6f23da256bf475',
    // woofy => yfi
    '0xd0660cd418a64a1d44e9214ad8e459324d8157f1': '0x29b0da86e484e1c0029b56e817912d778ac0ec69',
    // wpc => weve
    '0x0589073b62217f8196fa668a3fdf81df45726236': '0x911da02c1232a3c3e1418b834a311921143b04d7',
    // tinspirit => spirit
    '0x6caa3e5feba1f83ec1d80ea2eaca37c3421c33a8': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // sd => usdc
    '0x412a13c109ac30f0db80ad3bd1defd5d0a6c0ac6': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // lshare => usdc
    '0xcbe0ca46399af916784cadf5bcc3aed2052d6c45': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // tbond => tomb
    '0x24248cd1747348bdc971a5395f4b3cd7fee94ea0': '0x6c021ae822bea943b2e66552bde1d2696a53fbb7',
    // ring => usdc
    '0x582423c10c9e83387a96d00a69ba3d11ee47b7b5': '0x04068da6c83afcfa0e13ba15a6696662335d5b75'
  },
  [CHAIN_IDS.OPTIMISM]: {
    // VELO => USDC
    '0x3c8b650257cfb5f272f799f5e2b4e65093a11a05': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // FRAX => USDC
    '0x2e3d870790dc77a83dd1d18184acc7439a53f475': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // LYRA => USDC
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // THALES => USDC
    '0x217d47011b23bb961eb6d93ca9945b7501a5bb11': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // PERP => USDC
    '0x9e1028f5f1d5ede59748ffcee5532509976840e0': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // DAI => USDC
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // FXS => FRAX
    '0x67ccea5bb16181e7b4109c9c2143c24a1c2205be': '0x2e3d870790dc77a83dd1d18184acc7439a53f475',
    // L2DAO => OP
    '0xd52f94df742a6f4b4c8b033369fe13a41782bf44': '0x4200000000000000000000000000000000000042',
    // agEUR => USDC
    '0x9485aca5bbbe1667ad97c7fe7c4531a624c8b1ed': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // HND => USDC
    '0x10010078a54396f62c96df8532dc2b4847d47ed3': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // sUSD => USDC
    '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // BTC => USDC
    '0x68f180fcce6836688e9084f035309e29bf0a2095': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // TAROT => USDC
    '0x375488f097176507e39b9653b88fdc52cde736bf': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // BIFI => OP
    '0x4e720dd3ac5cfe1e1fbde4935f386bb1c66f4642': '0x4200000000000000000000000000000000000042',
    // SONNE => USDC
    '0x1db2466d9f5e10d7090e7152b68d62703a2245f0': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // OATH => USDC
    '0x39fde572a18448f8139b7788099f0a0740f51205': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // MAI => USDC
    '0xdfa46478f9e5ea86d57387849598dbfb2e964b02': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // DOLA => USDC
    '0x8ae125e8653821e851f12a49f7765db9a9ce7384': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // opxveVELO => VELO
    '0x46f21fda29f1339e0ab543763ff683d399e393ec': '0x3c8b650257cfb5f272f799f5e2b4e65093a11a05'
  },
  [CHAIN_IDS.ARBITRUM]: {
    // XCAL => USDC
    '0xd2568accd10a4c98e87c44e9920360031ad89fcb': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    // DAI => USDC
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    // USDT => USDC
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    // FRAX => USDC
    '0x17fc002b466eec40dae837fc4be5c67993ddbd6f': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    // MIM => USDC
    '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    // LUSD => USDC
    '0x93b346b6bc2548da6a1e7d98e9a421b42541425b': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    // opxveSLIZ => SLIZ
    '0xd29f8a9e76ef42ba9f749583ed07cae7bfaec389': '0x463913d3a3d3d291667d53b8325c598eb88d3b0e',
    // ARX => USDC
    '0xd5954c3084a1ccd70b4da011e67760b8e78aee84': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
  },
  [CHAIN_IDS.BSC]: {
    // OATH => BUSD
    '0xd3c6ceedd1cc7bd4304f72b011d53441d631e662': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    // HAY => BUSD
    '0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    // USDT => BUSD
    '0x55d398326f99059ff775485246999027b3197955': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    // USDC => BUSD
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    // DEI => BUSD
    '0xde1e704dae0b4051e80dabb26ab6ad6c12262da0': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    // FTM => USDC
    '0xad29abb318791d579433d831ed122afeaf29dcfe': '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    // MATIC => BUSD
    '0xcc42724c6683b7e57334c4e856f4c9965ed682bd': '0xe9e7cea3dedca5984780bafc599bd69add087d56'
  },
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: {
    // USDT => USDC
    '0xdac17f958d2ee523a2206206994597c13d831ec7': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  },
  [CHAIN_IDS.KAVA]: {
    // MARE => USDC
    '0xd86c8d4279ccafbec840c782bcc50d201f277419': '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    // TAROT => USDC
    '0x165dbb08de0476271714952c3c1f068693bd60d7': '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    // MAI => USDC
    '0xb84df10966a5d7e1ab46d9276f55d57bd336afc7': '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    // DAI => USDC
    '0x765277eebeca2e31912c9946eae1021199b39c61': '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    // LQDR => USDC
    '0x6c2c113c8ca73db67224ef4d8c8dfcec61e52a9c': '0xfa9343c3897324496a05fc75abed6bac29f8a40f'
  },
  [CHAIN_IDS.CANTO]: {
    // TAROT => USDC
    '0x2bf9b864cdc97b08b6d79ad4663e71b8ab65c45c': '0x80b5a32e4f032b2a058b4f29ec95eefeeb87adcd',
    // USDT => NOTE
    '0xd567b3d7b8fe3c79a1ad8da978812cfc4fa05e75': '0x4e71a2e537b7f9d9413d3991d37958c0b5e1e503'
  },
  [CHAIN_IDS.AVAX]: {
    // OATH => WETH.e
    '0x2c69095d81305f1e3c6ed372336d407231624cea': '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab'
  },
  [CHAIN_IDS.POLYGON]: {
    // SATIN => CASH
    '0x9fc3104f6fc188fee65c85bbc4b94a48282ae76d': '0x80487b4f8f70e793a81a42367c225ee0b94315df',
    // TAROT => CASH
    '0xd23ed8ca350ce2631f7ecdc5e6bf80d0a1debb7b': '0x80487b4f8f70e793a81a42367c225ee0b94315df',
    // LQDR => CASH
    '0x434e7bbbc9ae9f4ffade0b3175fef6e8a4a1c505': '0x80487b4f8f70e793a81a42367c225ee0b94315df'
  }
};

interface UniswapV2Dex {
  name: string;
  factory: Contract;
}

const uniswapV2DexList: {[chainId: number]: UniswapV2Dex[]} = {
  [CHAIN_IDS.FANTOM]: [
    {
      name: 'SpookySwap',
      factory: new Contract('0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3', UniswapV2FactoryJSON)
    },
    {
      name: 'SpiritSwap',
      factory: new Contract('0xEF45d134b73241eDa7703fa787148D9C9F4950b0', UniswapV2FactoryJSON)
    },
    /*
    {
      name: 'SushiSwap',
      factory: new Contract('0xc35DADB65012eC5796536bD9864eD8773aBc74C4', UniswapV2FactoryJSON)
    },
    {
      name: 'ProtoFi',
      factory: new Contract('0x39720E5Fe53BEEeb9De4759cb91d8E7d42c17b76', UniswapV2FactoryJSON)
    },
    */
    {
      name: 'solidly-vAMM',
      factory: new Contract('0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28', BaseV1FactoryJSON)
    },
    {
      name: 'solidly-sAMM',
      factory: new Contract('0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28', BaseV1FactoryJSON)
    },
    {
      name: 'equalizer-vAMM',
      factory: new Contract('0xc9ab1Ab21358F4Fc36cbbbe27f3b3eAd423EC33B', BaseV1FactoryJSON)
    },
    {
      name: 'equalizer-sAMM',
      factory: new Contract('0xc9ab1Ab21358F4Fc36cbbbe27f3b3eAd423EC33B', BaseV1FactoryJSON)
    }
  ],
  [CHAIN_IDS.OPTIMISM]: [
    {
      name: 'ZipSwap',
      factory: new Contract('0x8BCeDD62DD46F1A76F8A1633d4f5B76e0CDa521E', UniswapV2FactoryJSON)
    },
    {
      name: 'vAMM',
      factory: new Contract('0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746', BaseV1FactoryJSON)
    },
    {
      name: 'sAMM',
      factory: new Contract('0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746', BaseV1FactoryJSON)
    }
  ],
  [CHAIN_IDS.ARBITRUM]: [
    {
      name: 'xcal-vAMM',
      factory: new Contract('0xD158bd9E8b6efd3ca76830B66715Aa2b7Bad2218', BaseV1FactoryJSON)
    },
    {
      name: 'xcal-sAMM',
      factory: new Contract('0xD158bd9E8b6efd3ca76830B66715Aa2b7Bad2218', BaseV1FactoryJSON)
    },
    {
      name: 'ramses-vAMM',
      factory: new Contract('0xAAA20D08e59F6561f242b08513D36266C5A29415', BaseV1FactoryJSON)
    },
    {
      name: 'ramses-sAMM',
      factory: new Contract('0xAAA20D08e59F6561f242b08513D36266C5A29415', BaseV1FactoryJSON)
    },
    {
      name: 'solidlizard-vAMM',
      factory: new Contract('0x734d84631f00dC0d3FCD18b04b6cf42BFd407074', BaseV1FactoryJSON)
    },
    {
      name: 'solidlizard-sAMM',
      factory: new Contract('0x734d84631f00dC0d3FCD18b04b6cf42BFd407074', BaseV1FactoryJSON)
    },
    {
      name: 'sterling-vAMM',
      factory: new Contract('0xF7A23B9A9dCB8d0aff67012565C5844C20C11AFC', BaseV1FactoryJSON)
    },
    {
      name: 'sterling-sAMM',
      factory: new Contract('0xF7A23B9A9dCB8d0aff67012565C5844C20C11AFC', BaseV1FactoryJSON)
    },
    {
      name: 'ArbiDex',
      factory: new Contract('0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c', UniswapV2FactoryJSON)
    }
  ],
  [CHAIN_IDS.BSC]: [
    {
      name: 'vAMM',
      factory: new Contract('0xAFD89d21BdB66d00817d4153E055830B1c2B3970', BaseV1FactoryJSON)
    },
    {
      name: 'sAMM',
      factory: new Contract('0xAFD89d21BdB66d00817d4153E055830B1c2B3970', BaseV1FactoryJSON)
    }
  ],
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: [
    {
      name: 'vAMM',
      factory: new Contract('0x777de5Fe8117cAAA7B44f396E93a401Cf5c9D4d6', BaseV1FactoryJSON)
    },
    {
      name: 'sAMM',
      factory: new Contract('0x777de5Fe8117cAAA7B44f396E93a401Cf5c9D4d6', BaseV1FactoryJSON)
    },
    {
      name: 'UniswapV2',
      factory: new Contract('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', UniswapV2FactoryJSON)
    }
  ],
  [CHAIN_IDS.KAVA]: [
    {
      name: 'equilibre-vAMM',
      factory: new Contract('0xA138FAFc30f6Ec6980aAd22656F2F11C38B56a95', BaseV1FactoryJSON)
    },
    {
      name: 'equilibre-sAMM',
      factory: new Contract('0xA138FAFc30f6Ec6980aAd22656F2F11C38B56a95', BaseV1FactoryJSON)
    }
  ],
  [CHAIN_IDS.CANTO]: [
    {
      name: 'canto-vAMM',
      factory: new Contract('0xE387067f12561e579C5f7d4294f51867E0c1cFba', BaseV1FactoryJSON)
    },
    {
      name: 'canto-sAMM',
      factory: new Contract('0xE387067f12561e579C5f7d4294f51867E0c1cFba', BaseV1FactoryJSON)
    },
    {
      name: 'velocimeter-vAMM',
      factory: new Contract('0xF80909DF0A01ff18e4D37BF682E40519B21Def46', BaseV1FactoryJSON)
    },
    {
      name: 'velocimeter-sAMM',
      factory: new Contract('0xF80909DF0A01ff18e4D37BF682E40519B21Def46', BaseV1FactoryJSON)
    }
  ],
  [CHAIN_IDS.AVAX]: [
    {
      name: 'TraderJoe',
      factory: new Contract('0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10', UniswapV2FactoryJSON)
    },
    {
      name: 'Pangolin',
      factory: new Contract('0xefa94DE7a4656D787667C749f7E1223D71E9FD88', UniswapV2FactoryJSON)
    },
    {
      name: 'glacier-vAMM',
      factory: new Contract('0xaC7B7EaC8310170109301034b8FdB75eCa4CC491', BaseV1FactoryJSON)
    },
    {
      name: 'glacier-sAMM',
      factory: new Contract('0xaC7B7EaC8310170109301034b8FdB75eCa4CC491', BaseV1FactoryJSON)
    }
  ],
  [CHAIN_IDS.POLYGON]: [
    {
      name: 'QuickSwap',
      factory: new Contract('0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32', UniswapV2FactoryJSON)
    },
    {
      name: 'SushiSwap',
      factory: new Contract('0xc35DADB65012eC5796536bD9864eD8773aBc74C4', UniswapV2FactoryJSON)
    },
    {
      name: 'ApeSwap',
      factory: new Contract('0xCf083Be4164828f00cAE704EC15a36D711491284', UniswapV2FactoryJSON)
    },
    {
      name: 'satin-vAMM',
      factory: new Contract('0x30030Aa4bc9bF07005cf61803ac8D0EB53e576eC', BaseV1FactoryJSON)
    },
    {
      name: 'satin-sAMM',
      factory: new Contract('0x30030Aa4bc9bF07005cf61803ac8D0EB53e576eC', BaseV1FactoryJSON)
    }
  ]
};

interface UniswapV2PairReserves {
  token0: string;
  token1: string;
  pairId: string;
  symbol: string;
  reserve0: BigNumber;
  reserve1: BigNumber;
}
export interface TokenPrice {
  value: BigNumber;
  path: UniswapV2PairReserves[];
}

export type TokenPair = [string, string];

export interface Token {
  address: string;
  decimals: number;
}

export interface TokenPriceEntry {
  address: string;
  decimals: number;
  priceUSD: TokenPrice;
  priceETH: TokenPrice;
}

export interface TokenPriceMap {
  [key: string]: TokenPriceEntry;
}

export const tokenPair = (token0: string, token1: string): TokenPair => {
  token0 = token0.toLowerCase();
  token1 = token1.toLowerCase();
  if (token0 < token1) {
    return [token0, token1];
  }
  return [token1, token0];
};

export async function initializeTokenList(this: TarotRouter) : Promise<Token[]> {
  const lendingPools = LENDING_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM));
  const tokens: Token[] = [];
  lendingPools.forEach(pool => {
    tokens.push(
      ...[0, 1].map(i => {
        type PoolKey = keyof typeof pool;
        return {
          address: (pool[`tokenAddress${i}` as PoolKey] as string).toLowerCase(),
          decimals: pool[`decimals${i}` as PoolKey] as number
        };
      })
    );
  });
  Object.values(SUPPLY_VAULTS[this.chainId] || {}).forEach(supplyVault => {
    tokens.push({
      address: supplyVault.underlyingAddress.toLowerCase(),
      decimals: supplyVault.underlyingDecimals.toNumber()
    });
  });
  BOOSTMAXX_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM)).forEach(pool => {
    tokens.push({
      address: pool.token0.toLowerCase(),
      decimals: pool.decimals0
    });
    tokens.push({
      address: pool.token1.toLowerCase(),
      decimals: pool.decimals1
    });
  });
  tokens.push({
    address: WETH_ADDRESSES[this.chainId].toLowerCase(),
    decimals: 18
  });
  tokens.push({
    address: stablecoinList[this.chainId][0].toLowerCase(),
    decimals: this.chainId === CHAIN_IDS.BSC ? 18 : 6
  });
  // Custom tokens
  // SD
  tokens.push({
    address: '0x412a13c109ac30f0db80ad3bd1defd5d0a6c0ac6',
    decimals: 18
  });
  // TAROT (on Optimism)
  tokens.push({
    address: '0x375488f097176507e39b9653b88fdc52cde736bf',
    decimals: 18
  });
  // TAROT (on Ethereum Mainnet)
  tokens.push({
    address: '0x837d904a3799c0769079be9ecbaddf1abd4ccd6e',
    decimals: 18
  });
  // TAROT (on Arbitrum)
  tokens.push({
    address: '0x6688b00f0c23a4a546beaae51a7c90c439895d48',
    decimals: 18
  });

  // Solidly Monolith Reward Tokens
  tokens.push({
    address: '0x777172d858dc1599914a1c4c6c9fc48c99a60990',
    decimals: 18
  });
  tokens.push({
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18
  });
  tokens.push({
    address: '0x848578e351d25b6ec0d486e42677891521c3d743',
    decimals: 18
  });
  tokens.push({
    address: '0x00a35fd824c717879bf370e70ac6868b95870dfb',
    decimals: 18
  });

  // TAROT on Kava
  tokens.push({
    address: '0x165dbb08de0476271714952c3c1f068693bd60d7',
    decimals: 18
  });
  return R.uniq(tokens);
}

export async function getTokenList(this: TarotRouter) : Promise<Token[]> {
  if (!this.tokenListCache) {
    this.tokenListCache = this.intiializeTokenList();
  }
  return this.tokenListCache;
}

export async function initializeTokenPairIds(this: TarotRouter) : Promise<{
  token0: string;
  token1: string;
  pairIds: string[];
}[]> {
  const allTokens = await this.getTokenList();
  const tokenPairs = allTokens
    .filter(token => !addressEquals(token, WETH_ADDRESSES[this.chainId]))
    .map(token => {
      const tokenId = token.address.toLowerCase();
      if (stablecoinList[this.chainId].some(stableToken => addressEquals(token, stableToken))) {
        // Stables are paired with WETH
        return tokenPair(tokenId, WETH_ADDRESSES[this.chainId]);
      }
      const bridgeTokens = this.chainId && bridgeTokensByChain[this.chainId] ? bridgeTokensByChain[this.chainId] : {};
      if (bridgeTokens && bridgeTokens[tokenId as keyof typeof bridgeTokens]) {
        return tokenPair(tokenId, bridgeTokens[tokenId as keyof typeof bridgeTokens]);
      }
      return tokenPair(tokenId, WETH_ADDRESSES[this.chainId]);
    });

  increasePriceProgress(this, 75);

  const pairIdsForTokenPairs = tokenPairs.map(tokenPair => ({
    token0: tokenPair[0],
    token1: tokenPair[1],
    pairIds: [] as string[]
  }));
  const pairIdsChunkedResults = await this.doMulticallParallel(tokenPairs.flatMap(pair => {
    return uniswapV2DexList[this.chainId].map(dex => ([
      dex.factory, 'getPair', dex.name.endsWith('vAMM') ? [...pair, false] : dex.name.endsWith('sAMM') ? [...pair, true] : pair
    ] as MulticallTask));
  }), 64);
  const pairIds = chunkify(pairIdsChunkedResults, uniswapV2DexList[this.chainId].length);
  pairIds.forEach((possiblePairs, i) => {
    possiblePairs.forEach(pairId => {
      if (!addressEquals(pairId, ZERO_ADDRESS)) {
        pairIdsForTokenPairs[i].pairIds.push(pairId.toLowerCase());
      }
    });
    this.updatePriceProgress(30 + Math.floor(45 * i / pairIds.length));
  });

  const toKey = (token0: string, token1: string) => JSON.stringify([token0.toLowerCase(), token1.toLowerCase()]);
  const pairIdsByTokens = R.fromPairs(pairIdsForTokenPairs.map(item =>
    R.pair(toKey(item.token0, item.token1), item)
  ));
  const filteredLendingPools = LENDING_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM));
  let i = 0;
  for (const lendingPool of filteredLendingPools) {
    const token0 = lendingPool.tokenAddress0.toLowerCase();
    const token1 = lendingPool.tokenAddress1.toLowerCase();
    const key = toKey(token0, token1);
    const item = pairIdsByTokens[key];
    if (!item) {
      pairIdsByTokens[key] = {
        token0,
        token1,
        pairIds: []
      };
      pairIdsForTokenPairs.push(pairIdsByTokens[key]);
    }
    const { pairIds } = pairIdsByTokens[key];
    const pairId = lendingPool.uniswapV2PairAddress.toLowerCase();
    if (!pairIds.includes(pairId)) {
      pairIds.push(pairId);
    }
    this.updatePriceProgress(75 + Math.floor(5 * i / filteredLendingPools.length));
    i++;
  }

  return pairIdsForTokenPairs;
}

export async function getTokenPairIds(this: TarotRouter) : Promise<{
  token0: string;
  token1: string;
  pairIds: string[];
}[]> {
  if (!this.tokenPairIdCache) {
    this.tokenPairIdCache = this.initializeTokenPairIds();
  }
  return this.tokenPairIdCache;
}

export async function initializeTokenPrices(this: TarotRouter) : Promise<TokenPriceMap> {
  if (this.tokenPriceMapTask) {
    return this.tokenPriceMapTask;
  }
  let tpmInStorage = false;
  const tpmFromStorage = getLocalStorageItem(`tpm-${this.chainId}`);
  if (tpmFromStorage) {
    for (const key of Object.keys(tpmFromStorage)) {
      tpmFromStorage[key].priceUSD.value = BigNumber.from(tpmFromStorage[key].priceUSD.value);
      tpmFromStorage[key].priceETH.value = BigNumber.from(tpmFromStorage[key].priceETH.value);
    }
    tpmInStorage = true;
  }
  if (tpmInStorage) {
    this.updatePriceProgress(100);
    this.tokenPriceMap = tpmFromStorage;
    return tpmFromStorage;
  }

  this.updatePriceProgress(0);

  const priceFeedChainId = this.chainId === CHAIN_IDS.BSC ? CHAIN_IDS.BSC : CHAIN_IDS.ETHEREUM_MAIN_NET;
  const priceFeedProvider = new JsonRpcBatchProviderWithRetry(CHAIN_DETAILS[priceFeedChainId].rpcUrls[0]);
  const eacAggregatorProxy = new Contract(stablecoinPriceFeeds[priceFeedChainId], EACAggregatorProxyJSON, priceFeedProvider);
  const [stablecoinPriceUSD, stablecoinPriceUSDDecimals] = await Promise.all([
    eacAggregatorProxy.latestAnswer(),
    eacAggregatorProxy.decimals()
  ]);
  const stablecoinPriceDivisor = BigNumber.from(10).pow(stablecoinPriceUSDDecimals);

  const allTokens: Token[] = await this.getTokenList();
  this.updatePriceProgress(10);
  const tokensById = allTokens.reduce((prev, curr) => {
    prev[curr.address as keyof typeof prev] = curr; return prev;
  }, {} as {[key: string]: Token});
  const getToken = (tokenId: string) => {
    if (!tokenId) {
      throw new Error('tokenId is empty');
    }
    tokenId = tokenId.toLowerCase();
    const token = tokensById[tokenId as keyof typeof tokensById];
    if (!token) {
      throw new Error('Missing token: ' + tokenId);
    }
    return token;
  };
  this.updatePriceProgress(23);
  const pairIdsForTokenPairs = await this.getTokenPairIds();

  const allPairIds = pairIdsForTokenPairs.flatMap(item => item.pairIds);
  const allPairIdsAndTokens = pairIdsForTokenPairs.flatMap(item =>
    item.pairIds.map(pairId => ({
      pairId,
      token0: item.token0,
      token1: item.token1
    }))
  );

  this.updatePriceProgress(91);

  increasePriceProgress(this, 98);
  const results = await this.doMulticallParallel(allPairIds.flatMap(pairId => {
    const pair = new Contract(pairId, UniswapV2PairJSON, this.readLibrary);
    return [
      [pair, 'symbol', []],
      [pair, 'getReserves', []],
      [pair, 'totalSupply', []]
    ];
  }), 72);

  this.updatePriceProgress(99);

  const allPairReservesAndSymbols = chunkify(results, 3).map(([symbol, reserves, totalSupply]) => ({
    symbol,
    reserves,
    totalSupply
  }));
  const pairsById = R.fromPairs(allPairIds.map((pairId, i) => R.pair(pairId, {
    ...allPairIdsAndTokens[i],
    ...allPairReservesAndSymbols[i]
  })));

  let index = 0;
  const bestPairs: UniswapV2PairReserves[] = pairIdsForTokenPairs.map(item => {
    const reservesAndSymbols = item.pairIds.map(pairId => {
      const ret = {
        pairId,
        symbol: allPairReservesAndSymbols[index].symbol,
        reserve0: allPairReservesAndSymbols[index].reserves[0],
        reserve1: allPairReservesAndSymbols[index].reserves[1]
      };
      index++;
      return ret;
    });
    if (reservesAndSymbols.length === 0) {
      return {
        pairId: ZERO_ADDRESS,
        symbol: '',
        token0: item.token0,
        token1: item.token1,
        reserve0: ZERO,
        reserve1: ZERO,
        k: ZERO
      };
    }

    const sortedReservesAndSymbols = reservesAndSymbols.map(({ pairId, symbol, reserve0, reserve1 }) => ({
      pairId,
      symbol,
      reserve0,
      reserve1,
      sortK: reserve0.mul(reserve1)
    })).sort((a, b) => a.sortK.gt(b.sortK) ? -1 : 1);
    const { pairId, symbol, reserve0, reserve1 } = sortedReservesAndSymbols[0];

    return {
      pairId,
      symbol,
      token0: item.token0,
      token1: item.token1,
      reserve0,
      reserve1
    };
  });

  const toKey = (item: { token0: string, token1: string }) => {
    const token0 = item.token0.toLowerCase();
    const token1 = item.token1.toLowerCase();
    if (token0 < token1) {
      return JSON.stringify([token0, token1]);
    }
    return JSON.stringify([token1, token0]);
  };

  const bestPairsById = R.fromPairs(bestPairs.map(item => [toKey(item), item]));
  const getBestPair = (item: { token0: string, token1: string }) => bestPairsById[toKey(item)];

  const getTokenPriceAsRatio = (tokenIn: Token, tokenOut: Token): TokenPrice => {
    if (addressEquals(tokenIn, tokenOut)) {
      return {
        value: TEN_18,
        path: []
      };
    }
    const best = getBestPair({
      token0: tokenIn.address,
      token1: tokenOut.address
    });
    if (!best || !best.pairId || best.reserve0.isZero() || best.reserve1.isZero()) {
      return {
        value: ZERO,
        path: [{
          symbol: '',
          token0: tokenIn.address,
          token1: tokenOut.address,
          pairId: ZERO_ADDRESS,
          reserve0: ZERO,
          reserve1: ZERO
        }]
      };
    }
    const { symbol, reserve0, reserve1 } = best;

    let ratio: BigNumber;

    const scaleIn = BigNumber.from(10).pow(tokenIn.decimals);
    const scaleOut = BigNumber.from(10).pow(tokenOut.decimals);
    if (symbol.startsWith('sAMM') || symbol.startsWith('crAMM')) {
      const reserveIn = tokenIn.address < tokenOut.address ? reserve0 : reserve1;
      const reserveOut = tokenIn.address < tokenOut.address ? reserve1 : reserve0;
      const xy = _k(reserveIn, reserveOut, scaleIn, scaleOut, true);

      const reserveA = reserveIn.mul(TEN_18).div(scaleIn);
      const reserveB = reserveOut.mul(TEN_18).div(scaleOut);

      let amountIn = reserveIn.div(100);
      amountIn = amountIn.mul(TEN_18).div(scaleIn);

      const y = reserveB.sub(_getY(reserveA.add(amountIn), xy, reserveB));
      ratio = y.mul(TEN_18).div(amountIn);
    } else {
      const reserveA = tokenIn.address < tokenOut.address ? reserve0 : reserve1;
      const reserveB = tokenIn.address < tokenOut.address ? reserve1 : reserve0;
      ratio = TEN_18.mul(reserveB).div(reserveA).mul(scaleIn).div(scaleOut);
    }
    return {
      value: ratio,
      path: [best]
    };
  };
  const wethToken = getToken(WETH_ADDRESSES[this.chainId]);
  const stablecoinToken = getToken(stablecoinList[this.chainId][0]);
  const usdPerWeth = getTokenPriceAsRatio(wethToken, stablecoinToken);

  // Get price of token in WETH where 10^18 = 1 WETH
  const getTokenPriceInWETH = (token: string | Token): TokenPrice => {
    if (typeof (token) === 'string') {
      token = getToken(token);
    }
    if (!token) {
      throw new Error('Invalid token');
    }
    if (addressEquals(token, WETH_ADDRESSES[this.chainId])) {
      return {
        value: TEN_18,
        path: []
      };
    }
    const bridgeTokens = this.chainId && bridgeTokensByChain[this.chainId] ? bridgeTokensByChain[this.chainId] : {};
    if (bridgeTokens && bridgeTokens[token.address.toLowerCase() as keyof typeof bridgeTokens]) {
      const bridgeId = bridgeTokens[token.address.toLowerCase() as keyof typeof bridgeTokens];
      const bridge = getToken(bridgeId);
      const bridgePriceWETH = getTokenPriceInWETH(bridgeId);
      const bridgeRatio = getTokenPriceAsRatio(token, bridge);
      return {
        value: bridgePriceWETH.value.mul(bridgeRatio.value).div(TEN_18),
        path: [...bridgeRatio.path, ...bridgePriceWETH.path]
      };
    }
    return getTokenPriceAsRatio(token, wethToken);
  };

  // Get price of token in USD where 10^18 = $1
  const getTokenPriceInUSD = (token: string | Token): TokenPrice => {
    if (typeof (token) === 'string') {
      token = getToken(token);
    }
    if (!token) {
      throw new Error('Invalid token');
    }
    if (addressEquals(token, stablecoinToken)) {
      return {
        value: TEN_18.mul(stablecoinPriceUSD).div(stablecoinPriceDivisor),
        path: []
      };
    }
    if (addressEquals(token, WETH_ADDRESSES[this.chainId])) {
      return getTokenPriceAsRatio(token, stablecoinToken);
    }
    const bridgeTokens = this.chainId && bridgeTokensByChain[this.chainId] ? bridgeTokensByChain[this.chainId] : {};
    if (bridgeTokens && bridgeTokens[token.address.toLowerCase() as keyof typeof bridgeTokens]) {
      const bridgeId = bridgeTokens[token.address.toLowerCase() as keyof typeof bridgeTokens];
      const bridge = getToken(bridgeId);
      const bridgePriceUSD = getTokenPriceInUSD(bridgeId);
      const bridgeRatio = getTokenPriceAsRatio(token, bridge);
      return {
        value: bridgePriceUSD.value.mul(bridgeRatio.value).div(TEN_18),
        path: [...bridgeRatio.path, ...bridgePriceUSD.path]
      };
    }
    const wethPerToken = getTokenPriceInWETH(token);
    return {
      value: usdPerWeth.value.mul(wethPerToken.value).div(TEN_18),
      path: [...wethPerToken.path, ...usdPerWeth.path]
    };
  };
  const ret : TokenPriceMap = {};
  allTokens.forEach(token => {
    ret[token.address] = {
      ...token,
      priceUSD: getTokenPriceInUSD(token),
      priceETH: getTokenPriceInWETH(token)
    };
  });

  const valueOf = (tokenId: string, amount: BigNumberish, type: 'USD' | 'ETH' = 'USD') => {
    amount = BigNumber.from(amount);
    if (amount.isZero()) {
      return ZERO;
    }
    const tokenPrice = ret[tokenId];
    if (!tokenPrice) {
      return ZERO;
    }
    const price = type === 'USD' ? tokenPrice.priceUSD : tokenPrice.priceETH;
    const scale = BigNumber.from(10).pow(tokenPrice.decimals);
    return amount.mul(price.value).div(scale);
  };

  const lpValueOf = (
    opts: {
      symbol: string;
      token0: string;
      token1: string;
      reserves: [BigNumberish, BigNumberish];
      totalSupply: BigNumberish;
    },
    amount: BigNumberish,
    type: 'USD' | 'ETH' = 'USD') => {
    const { token0, token1, reserves } = opts;
    let { totalSupply } = opts;
    amount = BigNumber.from(amount);
    totalSupply = BigNumber.from(totalSupply);
    if (totalSupply.isZero() || amount.isZero()) {
      return ZERO;
    }
    const valueOfReserve0 = valueOf(token0, reserves[0], type);
    const valueOfReserve1 = valueOf(token1, reserves[1], type);
    return amount.mul(valueOfReserve0.add(valueOfReserve1)).div(totalSupply);
  };

  for (const lpAddress of allPairIds) {
    const pair = pairsById[lpAddress.toLowerCase()];
    ret[lpAddress] = {
      address: lpAddress,
      decimals: 18,
      priceETH: {
        path: [],
        value: lpValueOf(pair, TEN_18, 'ETH')
      },
      priceUSD: {
        path: [],
        value: lpValueOf(pair, TEN_18, 'USD')
      }
    };
  }

  // Cache for future

  setTimeout(() => {
    this.updatePriceProgress(100);
  }, 1000);
  this.tokenPriceMap = ret;

  setLocalStorageItem(`tpm-${this.chainId}`, ret, 60 * 5);
  return ret;
}

export async function getTokenPrices(this: TarotRouter) : Promise<TokenPriceMap> {
  if (this.tokenPriceMap) {
    return Promise.resolve(this.tokenPriceMap);
  }
  if (!this.tokenPriceMapTask) {
    this.tokenPriceMapTask = this.initializeTokenPrices();
  }
  return this.tokenPriceMapTask;
}
