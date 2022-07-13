import CryptoJS from 'crypto-js';
import CONFIG, { 
  ETH_MAINNET, 
  POLYGON_MAINNET, 
  PROD, STAGING,
  DEV,
  ConfigType
} from './config';
import { ISendNotificationInputOptions, INotificationPayload } from './types';
import { STORAGE_TYPE, STORAGE_TYPE_TO_VERIFICATION_TYPE_MAP, NOTIFICATION_TYPE } from './constants';
  
export const getEpnsConfig = (chainId: number, isDev?: boolean) : ConfigType => {
  // for Mainnet
  if ([ETH_MAINNET, POLYGON_MAINNET].includes(chainId)) {
    return CONFIG[chainId][PROD];
  }

  // if explicitly passed "dev: true"
  if (isDev) {
    return CONFIG[chainId][DEV];
  }

  // by default
  return CONFIG[chainId][STAGING];
};


/**
 * This function will map the Input options passed to the SDK to the "payload" structure
 * needed by the API input
 */
export function getPayloadForAPIInput(
  inputOptions: ISendNotificationInputOptions,
  recipients: any
) : INotificationPayload{
  return {
    notification: {
      title: inputOptions?.notification?.title,
      body: inputOptions?.notification?.body
    },
    data: {
      acta: inputOptions?.payload?.cta || '',
      aimg: inputOptions?.payload?.img || '',
      amsg: inputOptions?.payload?.body || '',
      asub: inputOptions?.payload?.title || '',
      type: inputOptions?.type?.toString() || '',
      ...(inputOptions?.expiry && { etime: inputOptions?.expiry }),
      ...(inputOptions?.hidden && { hidden: inputOptions?.hidden }),
      ...(inputOptions?.payload?.sectype && { sectype: inputOptions?.payload?.sectype })
    },
    recipients: recipients
  };
}

export function getVerificationType(storage: number, chainId: number) {
  if (storage === STORAGE_TYPE.SMART_CONTRACT) {
    const verifcationMap = STORAGE_TYPE_TO_VERIFICATION_TYPE_MAP[storage];
    return verifcationMap[chainId];
  }

  return STORAGE_TYPE_TO_VERIFICATION_TYPE_MAP[storage];
}

export async function getEIP712Signature(
    signer: any,
    chainId: number,
    verifyingContract: string,
    payload: any,
) {
    const DOMAIN = {
        name: 'EPNS COMM V1',
        chainId: chainId,
        verifyingContract,
    };

    /**
     * We WILL have CHANGE here because of RECIPIENT changes from BE
     */

    const TYPE = {
      Payload: [
        { name: 'notification', type: 'Notification' },
        { name: 'data', type: 'Data' },
        // TODO - add Recipients once BE confirms
      ],
      Notification: [
        { name: 'title', type: 'string' },
        { name: 'body', type: 'string' },
      ],
      Data: [
        { name: 'acta', type: 'string' },
        { name: 'aimg', type: 'string' },
        { name: 'amsg', type: 'string' },
        { name: 'asub', type: 'string' },
        { name: 'type', type: 'string' }
      ]
      // TODO - add Recipients once BE confirms
    };

    if (payload?.data?.etime) {
      TYPE.Data.push({ name: 'etime', type: 'number' })
    }

    if (payload?.data?.hidden) {
      TYPE.Data.push({ name: 'hidden', type: 'boolean' })
    }

    const signature = await signer._signTypedData(DOMAIN, TYPE, payload);

    return signature;
};

/**
 * This function gets the hashed identity bytes from the notification type & payload.
 */
export function getPayloadIdentity(storage: number, payload: INotificationPayload) {
  // step 1: hash the whole payload
  const payloadHash = CryptoJS.SHA256(JSON.stringify(payload)).toString(CryptoJS.enc.Hex);

  // step 2: create the string in the format of `2+${<PAYLOAD_HASH>}`
  const identityString = `${storage}+${payloadHash}`;
  
  return identityString;
}

/**
 * This function returns the recipient format accepted by the API for different notification types
 */
export async function getRecipients(
  notificationType: number,
  recipients?: string | [string],
  secretType?: string,
  channel?: string
) {
  if (secretType) {
    return '';
    /**
     * Currently SECRET FLOW is yet to be finalized on the backend, so will revisit this later.
     * But in secret flow we basically generate secret for the address
     * and send it in { 0xtarget: secret_generated_for_0xtarget } format for all
     */
  } else {
  /**
   * NON-SECRET FLOW
   */
    if (notificationType === NOTIFICATION_TYPE.BROADCAST) {
      if (!recipients) {
        return channel;
      }
      return recipients;
    } else if (notificationType === NOTIFICATION_TYPE.TARGETTED) {
      if (typeof recipients === 'string') {
        const recipientObject = { [recipients]: null };
        return JSON.stringify(recipientObject);
      }
    } else if (notificationType === NOTIFICATION_TYPE.SUBSET) {
      if (Array.isArray(recipients)) {
        const recipientObject =  recipients.reduce((_recipients, _rAddress) => ({
          ..._recipients,
          [_rAddress]: null
        }), {});

        return JSON.stringify(recipientObject);
      }
    }
  }
  return JSON.stringify(recipients);
}

