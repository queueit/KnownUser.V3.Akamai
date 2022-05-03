import { IEnqueueTokenProvider } from "queueit-knownuser";
import { QueueITHelper } from "./queueitHelpers.js";
import { Token, Payload } from "./sdk/queueToken.js";

export class AkamaiEnqueueTokenProvider implements IEnqueueTokenProvider {

    _customerId: string;
    _secretKey: string;
    _validityTime: Number;
    _clientIp: string;
    _customData: any;

    public constructor(
        customerId: string,
        secretKey: string,
        validityTime: Number,
        clientIp?: string,
        customData?: any
    ) {
        this._customerId = customerId;
        this._secretKey = secretKey;
        this._validityTime = validityTime;
        this._clientIp = clientIp;
        this._customData = `{ ${(customData !== null) ? `,"cd":"${customData}"` : ''} }`;
    }

    public getEnqueueToken(wrId: string): string {

        const token = Token.Enqueue(this._customerId)
            .WithPayload(
                Payload.Enqueue()
                    .WithKey(QueueITHelper.generateUUID())
                    .WithCustomData(this._customData)
                    .Generate()
            )
            .WithEventId(wrId)
            .WithIpAddress(this._clientIp)
            .WithValidity(this._validityTime)
            .Generate(this._secretKey);

        return token.Token;
    }
}