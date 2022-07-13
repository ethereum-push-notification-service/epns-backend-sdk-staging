export interface ChainIdToSourceType {
  [key: number]: string
}

export const CHAIN_ID_TO_SOURCE: ChainIdToSourceType = {
    1: "ETH_MAINNET",
    42: "ETH_TEST_KOVAN",
    37: "POLYGON_MAINNET",
    80001: "POLYGON_TEST_MUMBAI",
};


export interface StorageToVerificationType {
  [key: number]: string | {
    [key: number]: string
  },
}

export const STORAGE_TYPE = {
  SMART_CONTRACT: 0,
  IPFS: 1,
  DIRECT_PAYLOAD: 2,
  SUBGRAPH: 3
};

export const NOTIFICATION_TYPE = {
  BROADCAST: 1,
  TARGETTED: 3,
  SUBSET: 4
};

export const STORAGE_TYPE_TO_VERIFICATION_TYPE_MAP: StorageToVerificationType = {
  [STORAGE_TYPE.SMART_CONTRACT]: {
    // chainId to verificationType
    1: 'eth',
    42: 'eth',
    37: 'poly',
    80001: 'poly'
  },
  [STORAGE_TYPE.IPFS]: 'eip712',
  [STORAGE_TYPE.DIRECT_PAYLOAD]: 'eip712',
  [STORAGE_TYPE.SUBGRAPH]: 'thegraph'
};