export declare function aesGcmEncrypt(key: Buffer, plaintext: Buffer): Promise<{
    nonce: Buffer;
    ciphertext: Buffer;
}>;
export declare function aesGcmDecrypt(key: Buffer, nonce: Buffer, ciphertext: Buffer): Promise<Buffer>;
export declare function packNonceAndCiphertext(nonce: Buffer, ciphertext: Buffer): string;
export declare function unpackNonceAndCiphertext(packed: string): {
    nonce: Buffer;
    ciphertext: Buffer;
};
//# sourceMappingURL=aes.d.ts.map