import crypto from './lib/sha256.js';
const AKAMAI_SDK_VERSION = "2.0.0";
let QueueITHelper = /** @class */ (() => {
    class QueueITHelper {
    }
    QueueITHelper.addKUPlatformVersion = function (redirectQueueUrl) {
        return redirectQueueUrl + "&kupver=akamai-" + AKAMAI_SDK_VERSION;
    };
    QueueITHelper.configureKnownUserHashing = function (Utils) {
        Utils.generateSHA256Hash = function (secretKey, stringToHash) {
            const hash = crypto.sha256.hmac(secretKey, stringToHash);
            return hash;
        };
    };
    return QueueITHelper;
})();
export { QueueITHelper };
