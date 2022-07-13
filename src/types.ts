export interface InfuraSettings {
  projectID: string;
  projectSecret: string;
}
  
export interface NetWorkSettings {
  alchemy?: string;
  infura?: InfuraSettings;
  etherscan?: string;
}
  
export interface EPNSSettings {
  network: string;
  contractAddress: string;
  contractABI: string;
}