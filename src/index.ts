import { postReq, getReq } from './config/axios';
import epnsNotify from './epnsNotifyHelper';
import { ethers } from 'ethers';
import logger from './logger';
import config from './config';
import { SendNotificationOptionsType } from './types'

function getEPNSInteractableContract(
  epnsSettings: EPNSSettings,
  channelKey: string,
  etherscan: string | undefined,
  alchemy: string | undefined,
  infura: InfuraSettings | undefined,
) {
  // Get Contract
  return epnsNotify.getInteractableContracts(
    epnsSettings.network, // Network for which the interactable contract is req
    {
      // API Keys
      etherscanAPI: etherscan,
      infuraAPI: infura,
      alchemyAPI: alchemy,
    },
    channelKey, // Private Key of the Wallet sending Notification
    epnsSettings.contractAddress, // The contract address which is going to be used
    epnsSettings.contractABI, // The contract abi which is going to be useds
  );
}

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

export type SupportedChains = '42' | '80001' | '1' | '137';
const DEFAULT_NETWORK_SETTINGS: NetWorkSettings = {};
const DEFAULT_NOTIFICATION_CHAIN: SupportedChains = '42';
const DEFAULT_NETWORK_TO_MONITOR = '1';

export default class NotificationHelper {
  private channelKey: string;
  private network: NetWorkSettings;
  private epnsCommunicatorSettings: EPNSSettings;
  private channelAddress;
  private epnsCommunicator;
  private networkToMonitor;
  /**
   *
   * @param channelKey Channel private key
   * @param epnsSettings Network of epns contract
   */
  constructor(
    channelKey: string,
    {
      communicatorContractAddress = '',
      communicatorContractABI = config.communicatorContractABI,
      channelAddress = '',
      networkKeys = DEFAULT_NETWORK_SETTINGS,
      notificationChainId = DEFAULT_NOTIFICATION_CHAIN,
      networkToMonitor = DEFAULT_NETWORK_TO_MONITOR,
    } = {},
  ) {
    communicatorContractAddress =
      communicatorContractAddress || config.communicatorContractAddress[notificationChainId];
    this.channelKey = channelKey;
    this.networkToMonitor = networkToMonitor;
    this.channelAddress = channelAddress || ethers.utils.computeAddress(channelKey);
    this.network = networkKeys;
    this.epnsCommunicatorSettings = {
      network: notificationChainId,
      contractAddress: communicatorContractAddress,
      contractABI: communicatorContractABI,
    };
    if (networkKeys.alchemy || networkKeys.infura || networkKeys.etherscan) {
      this.epnsCommunicator = getEPNSInteractableContract(
        this.epnsCommunicatorSettings,
        channelKey,
        this.network.etherscan,
        this.network.alchemy,
        this.network.infura,
      );
    }
  }

  public advanced = epnsNotify;

  /**
   * Get Subscribed Users
   * @description gets users subscribed to a channel
   * @returns
   */
  async getSubscribedUsers() {
    const channelSubscribers = await postReq('/channels/get_subscribers', {
      channel: this.channelAddress,
      op: 'read',
    })
      .then((res: any) => {
        const { subscribers } = res.data;
        return subscribers;
      })
      .catch((err) => {
        console.log({ err });
        return [];
      });
    return channelSubscribers;
  }

  async getContract(address: string, abi: string) {
    if (!this.epnsCommunicator) {
      console.log('You didnt pass in your network keys, so your functionality with this contract will be limited');
    }
    return epnsNotify.getInteractableContracts(
      this.networkToMonitor, // Network for which the interactable contract is req
      {
        // API Keys
        etherscanAPI: this.network.etherscan,
        infuraAPI: this.network.infura,
        alchemyAPI: this.network.alchemy,
      },
      null, // Private Key of the Wallet sending Notification
      address, // The contract address which is going to be used
      abi, // The contract abi which is going to be useds
    );
  }

  /**
   * Send Notification V2
   * @description Sends notification Options version
   * @param options
   */
  public async sendNotificationV2(options : SendNotificationOptionsType) {
    const {
      user,
      title,
      message,
      payloadTitle,
      payloadMsg,
      notificationType,
      cta,
      img,
      simulate = null,
      offChain = true,
      returnPayload = false
    } = options;

    // call the original "sendNotification()"
    return this.sendNotification(
      user,
      title,
      message,
      payloadTitle || title,
      payloadMsg || message,
      notificationType,
      cta,
      img,
      simulate,
      {
        offChain,
        returnPayload
      }
    );
  }

  /**
   * Send Notification
   * @description Sends notification to a particular user
   * @param user User Address
   * @param title Title of Notification
   * @param message Message of Notification
   * @param payloadTitle Internal Title
   * @param payloadMsg Internal Message
   */
  public async sendNotification(
    user: string,
    title: string,
    message: string,
    payloadTitle: string,
    payloadMsg: string,
    notificationType: number,
    cta: string | undefined,
    img: string | undefined,
    simulate: any,
    { 
      offChain = true,
      returnPayload = false
    } = {}, //add optional parameter for offchain sending of notification
  ) {
    const channelAddress = this.channelAddress;
    // check if offchain notification is enabled and send a different notification type
    if (offChain) {
      if (
        simulate &&
        typeof simulate == 'object' &&
        simulate.hasOwnProperty('txOverride') &&
        simulate.txOverride.mode
      ) {
        if (simulate.txOverride.hasOwnProperty('recipientAddr')) user = simulate.txOverride.recipientAddr;
        if (simulate.txOverride.hasOwnProperty('notificationType'))
          notificationType = simulate.txOverride.notificationType;
      }

      const payload: any = await this.getPayload(
        title,
        message,
        payloadTitle,
        payloadMsg,
        notificationType,
        cta,
        img,
        null,
      );

      const offChainPayload = await epnsNotify.generateOffChainSignature(
        this.epnsCommunicatorSettings,
        payload,
        this.channelKey,
        user,
        channelAddress,
      );
      if (returnPayload) return offChainPayload;

      const response = await epnsNotify.sendOffchainNotification(offChainPayload);

      return response;
    }
    // if its not offchain, then require key parameters be passed in
    if (!this.epnsCommunicator) {
      throw new Error(
        'Initialize using an alchemy key or Infura parameters or an etherscan keys when initialising the constructor',
      );
    }
    const hash = await this.getPayloadHash(
      user,
      title,
      message,
      payloadTitle,
      payloadMsg,
      notificationType,
      cta,
      img,
      simulate,
    );

    // Send notification
    const ipfshash = hash.ipfshash;
    const payloadType = hash.payloadType;

    const storageType = 1; // IPFS Storage Type
    const txConfirmWait = 1; // Wait for 0 tx confirmation

    const tx = await epnsNotify.sendNotification(
      this.epnsCommunicator.signingContract, // Contract connected to signing wallet
      channelAddress,
      user, // Recipient to which the payload should be sent
      payloadType, // Notification Type
      storageType, // Notificattion Storage Type
      ipfshash, // Notification Storage Pointer
      txConfirmWait, // Should wait for transaction confirmation
      logger, // Logger instance (or console.log) to pass
      simulate,
    );
    return tx;
  }

  /**
   * Get Payload Hash
   * @description Gets IPFS payload hash after upload
   * @param user User Address
   * @param title Title of Notification
   * @param message Message of Notification
   * @param payloadTitle Internal Title
   * @param payloadMsg Internal Message
   * @returns
   */
  private async getPayloadHash(
    user: string,
    title: string,
    message: string,
    payloadTitle: string,
    payloadMsg: string,
    notificationType: number,
    cta: string | undefined,
    img: string | undefined,
    simulate: boolean | Object,
  ) {
    const payload: any = await this.getPayload(
      title,
      message,
      payloadTitle,
      payloadMsg,
      notificationType,
      cta,
      img,
      user,
    );

    const ipfshash = await epnsNotify.uploadToIPFS(payload, logger, null, simulate);
    // Sign the transaction and send it to chain
    return {
      success: true,
      user,
      ipfshash,
      payloadType: parseInt(payload.data.type),
    };
  }

  /**
   * Get Liquidity Payload
   * @description Gets IPFS payload hash after upload
   * @param title Title of Notification
   * @param message Message of Notification
   * @param payloadTitle Internal Title
   * @param payloadMsg Internal Message
   * @returns
   */
  private async getPayload(
    title: string,
    message: string,
    payloadTitle: string,
    payloadMsg: string,
    notificationType: number,
    cta: string | undefined,
    img: string | undefined,
    user: string | null | undefined,
  ) {
    return epnsNotify.preparePayload(
      user, // Recipient Address | Useful for encryption
      notificationType, // Type of Notification
      title, // Title of Notification
      message, // Message of Notification
      payloadTitle, // Internal Title
      payloadMsg, // Internal Message
      cta, // Internal Call to Action Link
      img, // internal img of youtube link
    );
  }
}
