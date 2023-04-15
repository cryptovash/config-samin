
const FACTORY_DETAILS_MAP: {
  [pool: string]: FactoryDetails
} = {
  '250-0x35c052bbf8338b06351782a565aa9aad173432ea': {
    borrowFeeBps: 10,
    kinkMultiplier: 5,
    kinkBorrowRateMax: 100,
    tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
    label: 'Classic'
  },
  '250-0xf6d943c8904195d0f69ba03d97c0baf5bbdcd01b': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
    label: 'Requiem'
  },
  '250-0xbf76f858b42bb9b196a87e43235c2f0058cf7322': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0xeb2d736b9588ed16af4a3ef11f3fdd96b1b0478e',
    label: 'Carcosa'
  },
  '250-0xa90092a6bfc100e32777b257af46b3ec2675d876': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0x6a3806bd819dcce65daf7ced2bd456b4e6e6e978',
    label: 'Voyager'
  },
  '250-0xe034c865299da16a429dad26bff5468c2689f7d8': {
    borrowFeeBps: 1,
    kinkMultiplier: 6,
    kinkBorrowRateMax: 28,
    tarotPriceOracleAddress: '0x6a3806bd819dcce65daf7ced2bd456b4e6e6e978',
    label: 'Forever'
  },
  '10-0x1d90fdac4dd30c3ba38d53f52a884f6e75d0989e': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0x981bd9f77c8aafc14ebc86769503f86a3cc29af5',
    label: 'Opaline'
  },
  '10-0xd7cabef2c1fd77a31c5ba97c724b82d3e25fc83c': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0x5a8931f2b235caa2eabf3f07cd1154360c933e17',
    label: 'Velours'
  },
  '10-0x8b2e286afa241307261622abd2878ad8ec9f0723': {
    borrowFeeBps: 1,
    kinkMultiplier: 6,
    kinkBorrowRateMax: 28,
    tarotPriceOracleAddress: '0x0a3b938d51f1b6d7bf960a0cb6ac9f1154d0008c',
    label: 'Jupiter (Deactivated)'
  },
  '10-0x49df1fe24caf1a7dcbb2e2b1793b93b04edb62bf': {
    borrowFeeBps: 1,
    kinkMultiplier: 6,
    kinkBorrowRateMax: 28,
    tarotPriceOracleAddress: '0x0a3b938d51f1b6d7bf960a0cb6ac9f1154d0008c',
    label: 'Jupiter'
  },
  '42161-0x2217aec3440e8fd6d49a118b1502e539f88dba55': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0xd4a6a05081fd270dc111332845a778a49fe01741',
    label: 'Galahad'
  },
  '42161-0x1bbd5637421a83b00c5cd549b9c3721b28553f80': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
    label: 'Saurian'
  },
  '42161-0xc20099a3f0728634c1136489074508be7b406d3a': {
    borrowFeeBps: 1,
    kinkMultiplier: 6,
    kinkBorrowRateMax: 28,
    tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
    label: 'Ulysses (Deactivated)'
  },
  '42161-0x4b6dae049a35196a773028b2e835cccce9dd4723': {
    borrowFeeBps: 1,
    kinkMultiplier: 6,
    kinkBorrowRateMax: 28,
    tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
    label: 'Ulysses'
  },
  '42161-0x8cec723d81273b9ab1fc70441382701dfa2fe526': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0xa516b9c7378799799e6dfadbdabf45d5b584405f',
    label: 'Neptune'
  },
  '56-0x2217aec3440e8fd6d49a118b1502e539f88dba55': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0xd4a6a05081fd270dc111332845a778a49fe01741',
    label: 'Bermuda'
  },
  '56-0xc20099a3f0728634c1136489074508be7b406d3a': {
    borrowFeeBps: 1,
    kinkMultiplier: 6,
    kinkBorrowRateMax: 28,
    tarotPriceOracleAddress: '0xd4a6a05081fd270dc111332845a778a49fe01741',
    label: 'Palermo'
  },
  '1-0x1cafcb9f3b5a152b1553bc2c688ba6a18054b653': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 348,
    tarotPriceOracleAddress: '0x1d90fdac4dd30c3ba38d53f52a884f6e75d0989e',
    label: 'Eleusis'
  },
  '1-0x4b6dae049a35196a773028b2e835cccce9dd4723': {
    borrowFeeBps: 1,
    kinkMultiplier: 6,
    kinkBorrowRateMax: 28,
    tarotPriceOracleAddress: '0x1d90fdac4dd30c3ba38d53f52a884f6e75d0989e',
    label: 'Equinox'
  },
  '2222-0x82b3413d575aa93806308a04b53c78ae2037da11': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
    label: 'Avignon'
  },
  '2222-0x54950cae3d8513ea041066f31697903de5909f57': {
    borrowFeeBps: 1,
    kinkMultiplier: 6,
    kinkBorrowRateMax: 28,
    tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
    label: 'Orleans'
  },
  '7700-0xb6193df61351736e5190bf1deb2e4f0769bd1bf2': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0xd4a6a05081fd270dc111332845a778a49fe01741',
    label: 'Cabaret'
  },
  '7700-0x82b3413d575aa93806308a04b53c78ae2037da11': {
    borrowFeeBps: 1,
    kinkMultiplier: 6,
    kinkBorrowRateMax: 28,
    tarotPriceOracleAddress: '0xd4a6a05081fd270dc111332845a778a49fe01741',
    label: 'Cantata'
  },
  '43114-0x36df0a76a124d8b2205fa11766ec2eff8ce38a35': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0x5f90e27c07b96641a52ff2335b15158e74e46401',
    label: 'Cascade'
  },
  '137-0x36df0a76a124d8b2205fa11766ec2eff8ce38a35': {
    borrowFeeBps: 1,
    kinkMultiplier: 3,
    kinkBorrowRateMax: 888,
    tarotPriceOracleAddress: '0x5f90e27c07b96641a52ff2335b15158e74e46401',
    label: 'Paprika'
  }
};

const FACTORY_LIST = Object.values(FACTORY_DETAILS_MAP);

export interface FactoryDetails {
  borrowFeeBps: number;
  kinkMultiplier: number;
  kinkBorrowRateMax: number;
  tarotPriceOracleAddress: string;
  label: string;
}

export {
  FACTORY_DETAILS_MAP, FACTORY_LIST
};
