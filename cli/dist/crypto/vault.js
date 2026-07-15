import crypto from "node:crypto";
import { DEFAULT_KDF_PARAMS, MASTER_KEY_BYTES, } from "./constants.js";
import { deriveKey, generateSalt } from "./kdf.js";
import { aesGcmDecrypt, aesGcmEncrypt, packNonceAndCiphertext, unpackNonceAndCiphertext, } from "./aes.js";
function generateRecoveryKey() {
    return crypto
        .randomBytes(16)
        .toString("hex")
        .toUpperCase()
        .match(/.{1,4}/g)
        .join("-");
}
function generateMasterKey() {
    return crypto.randomBytes(MASTER_KEY_BYTES);
}
async function wrapMasterKey(masterKey, secret, salt, kdfParams) {
    const kek = await deriveKey(secret, salt, kdfParams);
    const { nonce, ciphertext } = await aesGcmEncrypt(kek, masterKey);
    return packNonceAndCiphertext(nonce, ciphertext);
}
async function unwrapMasterKey(wrapped, secret, salt, kdfParams) {
    const kek = await deriveKey(secret, salt, kdfParams);
    const { nonce, ciphertext } = unpackNonceAndCiphertext(wrapped);
    try {
        return await aesGcmDecrypt(kek, nonce, ciphertext);
    }
    catch {
        throw new Error("Invalid password or recovery key");
    }
}
export async function createVault(password) {
    const kdfParams = DEFAULT_KDF_PARAMS;
    const masterKey = generateMasterKey();
    const recoveryKey = generateRecoveryKey();
    const passwordWrapSalt = generateSalt();
    const recoveryWrapSalt = generateSalt();
    const wrappedMkByPassword = await wrapMasterKey(masterKey, password, passwordWrapSalt, kdfParams);
    const wrappedMkByRecovery = await wrapMasterKey(masterKey, recoveryKey, recoveryWrapSalt, kdfParams);
    return {
        masterKey,
        vault: {
            kdfParams,
            passwordWrapSalt: passwordWrapSalt.toString("base64"),
            wrappedMkByPassword,
            recoveryWrapSalt: recoveryWrapSalt.toString("base64"),
            wrappedMkByRecovery,
            recoveryKey,
        },
    };
}
export async function unlockWithPassword(wrap, password) {
    return unwrapMasterKey(wrap.wrappedMkByPassword, password, Buffer.from(wrap.passwordWrapSalt, "base64"), wrap.kdfParams);
}
export async function unlockWithRecoveryKey(wrap, recoveryKey) {
    return unwrapMasterKey(wrap.wrappedMkByRecovery, recoveryKey, Buffer.from(wrap.recoveryWrapSalt, "base64"), wrap.kdfParams);
}
export async function rewrapWithPassword(masterKey, password, existingWrap) {
    const passwordWrapSalt = generateSalt();
    const wrappedMkByPassword = await wrapMasterKey(masterKey, password, passwordWrapSalt, existingWrap.kdfParams);
    return {
        passwordWrapSalt: passwordWrapSalt.toString("base64"),
        wrappedMkByPassword,
    };
}
export async function encryptEnv(masterKey, plaintext) {
    const { nonce, ciphertext } = await aesGcmEncrypt(masterKey, plaintext);
    return {
        nonce: nonce.toString("base64"),
        ciphertext: ciphertext.toString("base64"),
    };
}
export async function decryptEnv(masterKey, nonce, ciphertext) {
    return aesGcmDecrypt(masterKey, Buffer.from(nonce, "base64"), Buffer.from(ciphertext, "base64"));
}
//# sourceMappingURL=vault.js.map