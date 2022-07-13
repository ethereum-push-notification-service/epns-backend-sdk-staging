// API ENVs
export const PROD = 'PROD';
export const STAGING = 'STAGING';
export const DEV = 'DEV';


// CHAIN IDs
export const ETH_MAINNET = 1;
export const ETH_KOVAN = 42;
export const POLYGON_MAINNET = 37;
export const POLYGON_MUMBAI = 80001;

export interface ConfigType {
  API_BASE_URL: string,
  EPNS_COMMUNICATOR_CONTRACT: string
}

export interface ConfigMapType {
  [key: number]: { // chain id
    [key: string]: ConfigType // apiEnv
  }
}

const CONFIG : ConfigMapType = {
  [ETH_MAINNET]: {
    [PROD]: {
      API_BASE_URL: 'https://backend-prod.epns.io/apis',
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa'
    }
  },
  [ETH_KOVAN]: {
    [STAGING]:  {
      API_BASE_URL: 'https://backend-kovan.epns.io/apis',
      EPNS_COMMUNICATOR_CONTRACT: '0x87da9Af1899ad477C67FeA31ce89c1d2435c77DC'
    },
    [DEV]: {
      API_BASE_URL: 'https://backend-dev.epns.io/apis',
      EPNS_COMMUNICATOR_CONTRACT: '0x99047d328496C14016222a998564B334A4A5723f'
    }
  },
  [POLYGON_MAINNET]: {
    [PROD]: {
      API_BASE_URL: 'https://backend-prod.epns.io/apis',
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa'
    }
  },
  [POLYGON_MUMBAI]: {
    [STAGING]:  {
      API_BASE_URL: 'https://backend-kovan.epns.io/apis',
      EPNS_COMMUNICATOR_CONTRACT: '0xD2ee1e96e3592d5945dDc1808834d7EE67400823'
    },
    [DEV]: {
      API_BASE_URL: 'https://backend-dev.epns.io/apis',
      EPNS_COMMUNICATOR_CONTRACT: '0xAf55BE8e6b0d6107891bA76eADeEa032ef8A4504'
    }
  },
};

export default CONFIG;