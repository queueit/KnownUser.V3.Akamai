import { ICryptoProvider } from 'queueit-knownuser';
import crypto from './lib/sha256.js'

export class AkamaiCryptoProvider implements ICryptoProvider {
    public constructor() { }
    public getSha256Hash(secretKey: string, stringToHash: string) {
        return crypto.sha256.hmac(secretKey, stringToHash);
    }
}