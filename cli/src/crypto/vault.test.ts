import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createVault,
  decryptEnv,
  encryptEnv,
  rewrapWithPassword,
  unlockWithPassword,
  unlockWithRecoveryKey,
} from "./vault.js";

test("vault round-trip with password and recovery key", async () => {
  const password = "test-password-123";
  const { masterKey, vault } = await createVault(password);

  const fromPassword = await unlockWithPassword(vault, password);
  assert.equal(fromPassword.toString("hex"), masterKey.toString("hex"));

  const fromRecovery = await unlockWithRecoveryKey(vault, vault.recoveryKey);
  assert.equal(fromRecovery.toString("hex"), masterKey.toString("hex"));
});

test("env encrypt/decrypt round-trip", async () => {
  const password = "another-password";
  const { masterKey } = await createVault(password);
  const plaintext = Buffer.from("API_KEY=secret\nDB_URL=postgres://localhost\n");

  const encrypted = await encryptEnv(masterKey, plaintext);
  const decrypted = await decryptEnv(
    masterKey,
    encrypted.nonce,
    encrypted.ciphertext,
  );

  assert.equal(decrypted.toString("utf8"), plaintext.toString("utf8"));
});

test("rewrap with new password", async () => {
  const oldPassword = "old-password";
  const newPassword = "new-password";
  const { masterKey, vault } = await createVault(oldPassword);

  const rewrapped = await rewrapWithPassword(masterKey, newPassword, vault);
  const updatedVault = { ...vault, ...rewrapped };

  await assert.rejects(() => unlockWithPassword(updatedVault, oldPassword));
  const unlocked = await unlockWithPassword(updatedVault, newPassword);
  assert.equal(unlocked.toString("hex"), masterKey.toString("hex"));
});
