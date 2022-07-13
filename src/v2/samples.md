# Input for the SDK sendNotification()

## When using in SERVER code

```bash
npm i @epnsproject/backend-sdk-staging
```

```typescript
const ethers = require('ethers');
const { sendNotification } = require('@epnsproject/backend-sdk-staging');


const Pkey = `0xabc12345`; // channel PK
const signer = new ethers.Wallet(Pkey);
const channelAddress = '0x52f856A160733A860ae7DC98DC71061bE33A28b3';

const NOTIFICATION_TYPE = {
    BROADCAST: 1,
    TARGETTED: 3,
    SUBSET: 4
};

const OPTIONS = {
    TARGETTED: {
      signer,
        chainId: 42,
        type: NOTIFICATION_TYPE.TARGETTED,
        storage: 2,
        notification: {
            title: 'sample header',
            body: 'testing out the new send notifications'
        },
        payload: {
            title: 'test notification title',
            body: 'test notif body',
            cta: '',
            img: ''
        },
        recipients: '0xCdBE6D076e05c5875D90fa35cc85694E1EAFBBd1',
        channel: channelAddress,
        dev: true
    },
    SUBSET: {
        signer,
        chainId: 42,
        type: NOTIFICATION_TYPE.SUBSET,
        storage: 2,
        notification: {
            title: 'sample header',
            body: 'testing out the new send notifications subset'
        },
        payload: {
            title: 'test notification title subset',
            body: 'test notif body',
            cta: '',
            img: ''
        },
        recipients: ['0xCdBE6D076e05c5875D90fa35cc85694E1EAFBBd1', '0x1434A7882cDD877B398Df5b83c883e9571c65813'],
        channel: channelAddress,
        dev: true
    },
    BROADCAST: {
        signer,
        chainId: 42,
        type: NOTIFICATION_TYPE.BROADCAST,
        storage: 2,
        notification: {
            title: 'sample header',
            body: 'testing out the new send notifications broadcast'
        },
        payload: {
            title: 'test notification title broadcast',
            body: 'test notif body',
            cta: '',
            img: ''
        },
        channel: channelAddress,
        dev: true
    }
};


async function main() {
    try {
        const apiResponse = await sendNotification(OPTIONS.TARGETTED); // or any Type
        console.log('apiResponse: ', apiResponse);
    } catch (e) {
        console.log('Error: ', e.message);
    }
}

main();

```



## API payloads generated for different Notification Types

### TARGETTED

```typescript
 {
  verificationProof: 'eip712:0x88db75803a7c057a939c8b115862f18929a64da673a57639c7b96c0f7a3b09123d692f834a084bf632cdad969aac3cc9a3981cc144bb7463636208c3a7c761671c',
  identity: '2+f66faeeaaf2d505e6c4b0c78f99e4da50778b91538b4c05888849d3b670616cf',
  channel: '0x52f856A160733A860ae7DC98DC71061bE33A28b3',
  source: 'ETH_TEST_KOVAN',
  payload: {
    notification: {
      title: 'Sample header',
      body: 'testing out the new send notifications'
    },
    data: {
      acta: '',
      aimg: '',
      amsg: 'test notif body',
      asub: 'test notification title',
      type: '3'
    },
    recipients: '{"0xCdBE6D076e05c5875D90fa35cc85694E1EAFBBd1":null}'
  }
} 
```

### SUBSET

```typescript
 {
  verificationProof: 'eip712:0xe329bbd5159708ce822ef49a0f561c23bf8f28448b41fe4190a852ace10fe5523ccdad33ec0d8a5a27adb7883fe8f7a630adedb384a217804c72d33909d1589a1c',
  identity: '2+c6a012bf5bf4851c2851b03aaf6264210100995020abdf60d04b420ebcb920e7',
  channel: '0x52f856A160733A860ae7DC98DC71061bE33A28b3',
  source: 'ETH_TEST_KOVAN',
  payload: {
    notification: {
      title: 'Sample header',
      body: 'testing out the new send notifications subset'
    },
    data: {
      acta: '',
      aimg: '',
      amsg: 'test notif body',
      asub: 'test notification title subset',
      type: '4'
    },
    recipients: '{"0xCdBE6D076e05c5875D90fa35cc85694E1EAFBBd1":null,"0x1434A7882cDD877B398Df5b83c883e9571c65813":null}'
  }
} 
```

### BROADCAST

```typescript
 {
  verificationProof: 'eip712:0x3c139d496f129be7d4f48ad2ea6b9d06f577de5d73df31c604c785fdb4334166375323e46ce47a0be07c8974501c42daa4138b211170e4ecb83c690eb799ab4f1b',
  identity: '2+3572aa98c54ff1b504771d22e2174b8ec474ce2aeb98638a1cfa8283771ecee2',
  channel: '0x52f856A160733A860ae7DC98DC71061bE33A28b3',
  source: 'ETH_TEST_KOVAN',
  payload: {
    notification: {
      title: 'Sample header',
      body: 'testing out the new send notifications broadcast'
    },
    data: {
      acta: '',
      aimg: '',
      amsg: 'test notif body',
      asub: 'test notification title broadcast',
      type: '1'
    },
    recipients: '0x52f856A160733A860ae7DC98DC71061bE33A28b3'
  }
} 
```

### TARGETTED (secret) WIP

```typescript
{
  "data": {
    "acta": "",
    "aimg": "",
    "amsg": "Current BTC price is - 47,785.10USD",
    "asub": "",
    "type": "3",
    "sectype": "aes+eip712"
  },
  "notification": {
    "body": "Dropping payload directly on push nodes at LISCON 2021.",
    "title": "EPNS x LISCON"
  },
  "recipients": {
    "0x35B84d6848D16415177c64D64504663b998A6ab4": {
      "secret": "0dsddo302320ndsd==03232kdk023nmdcsdjksfdk34fnm349340fnm3403fnm3493n34394"
    }
  }
}
```

### SUBSET (secret) WIP

```typescript
{
  "data": {
    "acta": "",
    "aimg": "",
    "amsg": "Current BTC price is - 47,785.10USD",
    "asub": "",
    "type": "4",
    "sectype": "aes+eip712"
  },
  "recipients": {
    "0x35b84d6848d16415177c64d64504663b998a6ab4": {
      "secret": "0dsddo302320ndsd==03232kdk023nmdcsdjksfdk34fnm349340fnm3403fnm3493n34394"
    },
    "0x28F1C7B4596D9db14f85c04DcBd867Bf4b14b811": {
      "secret": "35345gdfg302320ndsd==03232kdk023nmdcsdjksfdk34fnm349340fnm3403fnm3493n34394"
    },
    "0xD9E0b968400c51F81E278a66645328fA79d1ed78": {
      "secret": "j6765fg302320ndsd==03232kdk023nmdcsdjksfdk34fnm349340fnm3403fnm3493n34394"
    }
  },
  "notification": {
    "body": "Dropping payload directly on push nodes at LISCON 2021.",
    "title": "EPNS x LISCON"
  }
}
```