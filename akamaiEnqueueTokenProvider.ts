import { IEnqueueTokenProvider } from "queueit-knownuser";
import { QueueITHelper, Settings } from "./queueitHelpers.js";
import { Token, Payload } from "./sdk/queueToken.js";

export class AkamaiEnqueueTokenProvider implements IEnqueueTokenProvider {

    _settings: Settings;
    _validityTime: Number;
    _clientIp: string;
    _customData: any;

    public constructor(
        setting: Settings,
        validityTime: Number,
        clientIp?: string,
        customData?: any
    ) {
        this._settings = setting;
        this._validityTime = validityTime;
        this._clientIp = clientIp;
        this._customData = `{ ${(customData !== null) ? `,"cd":"${customData}"` : ''} }`;
    }

    public getEnqueueToken(wrId: string): string {
        if (!this._settings || this._validityTime < -1 || !this._clientIp) {
            return null;
        }

        const token = Token.Enqueue(this._settings.CustomerId)
            .WithPayload(
                Payload.Enqueue()
                    .WithKey(QueueITHelper.generateUUID())
                    .WithCustomData(this._customData)
                    .Generate()
            )
            .WithEventId(wrId)
            .WithIpAddress(this._clientIp)
            .WithValidity(this._validityTime)
            .Generate(this._settings.SecretKey);

        return token.Token;
    }
}