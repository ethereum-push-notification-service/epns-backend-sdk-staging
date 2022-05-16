export interface SendNotificationOptionsType {
    user: string,
    title: string,
    message: string,
    payloadTitle?: string,
    payloadMsg?: string,
    notificationType: number,
    cta?: string,
    img?: string,
    simulate?: any,
    offChain?: boolean,
    returnPayload?: boolean
}