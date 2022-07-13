import axios from 'axios';
import { ISendNotificationInputOptions } from './types';
import {
  getEpnsConfig,
  getPayloadForAPIInput,
  getEIP712Signature,
  getPayloadIdentity,
  getRecipients,
  getVerificationType
} from './helpers';
import { CHAIN_ID_TO_SOURCE } from './constants';


export async function sendNotification(options: ISendNotificationInputOptions) {
  try {
    const {
      signer,
      chainId,
      type,
      storage,
      payload,
      recipients,
      channel,
      dev
    } = options || {};

    const _channel = channel || signer.address;

    console.log('_channel: ==> ', _channel);

    const epnsConfig = getEpnsConfig(chainId, dev);
    const _recipients = await getRecipients(type, recipients, payload?.sectype, _channel);
    const notificationPayload = getPayloadForAPIInput(options, _recipients);
    const verificationType = getVerificationType(storage, chainId);
    const eip712Signature = await getEIP712Signature(
      signer,
      chainId,
      epnsConfig.EPNS_COMMUNICATOR_CONTRACT,
      notificationPayload
    );
    const identity = getPayloadIdentity(storage, notificationPayload);
   
    const apiPayload = {
      verificationProof: `${verificationType}:${eip712Signature}`,
      identity,
      channel: _channel,
      source: CHAIN_ID_TO_SOURCE[chainId],
      payload: notificationPayload
    };

    console.log('\n\nAPI call :-->> ', epnsConfig.API_BASE_URL, '\n\n', apiPayload, '\n\n\n\n');

    return await axios.post(
      epnsConfig.API_BASE_URL + '/payloads/add',
      apiPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (err) {
    console.error('[EPNS-SDK] - Error - sendNotification() - ', err);
    throw err;
  }
}