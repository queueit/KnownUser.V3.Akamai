import { IEnqueueTokenProvider } from "queueit-knownuser";
import { QueueITHelper } from "./queueitHelpers.js";
import { Token, Payload } from "./sdk/queueToken.js";

export class AkamaiEnqueueTokenProvider implements IEnqueueTokenProvider {

    _customerId: string;
    _secretKey: string;
    _validityTime: Number;
    _clientIp: string | null;
    _customData: any;
    _withKey: boolean;

    public constructor(
        customerId: string,
        secretKey: string,
        validityTime: Number,
        clientIp: string | null,
        withKey: boolean,
        customData?: any
    ) {
        this._customerId = customerId;
        this._secretKey = secretKey;
        this._validityTime = validityTime;
        this._clientIp = clientIp;
        this._customData = `{ ${(customData !== null) ? `,"cd":"${customData}"` : ''} }`;
        this._withKey = withKey;
    }

    public getEnqueueToken(wrId: string): string {

        var payLoad = Payload.Enqueue()
                        .WithCustomData(this._customData);

        if (this._withKey) 
        {
            payLoad = payLoad.WithKey(QueueITHelper.generateUUID());
        }

        const token = Token.Enqueue(this._customerId)
            .WithPayload(
                payLoad.Generate()
            )
            .WithEventId(wrId)
            .WithIpAddress(this._clientIp)
            .WithValidity(this._validityTime)
            .Generate(this._secretKey);

        return token.Token;
    }
}