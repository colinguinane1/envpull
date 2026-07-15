import Foundation
import LocalAuthentication
import Security

let bioService = "envpull-master-key-bio"
let plainService = "envpull-master-key"
let account = "envpull"

enum KeychainError: Error {
  case accessControl
  case operationFailed(OSStatus)
  case missingValue
  case biometryUnavailable
  case usage
}

func printErr(_ message: String) {
  FileHandle.standardError.write(Data((message + "\n").utf8))
}

func readStdinSecret() throws -> String {
  let data = FileHandle.standardInput.readDataToEndOfFile()
  guard
    let secret = String(data: data, encoding: .utf8)?
      .trimmingCharacters(in: .whitespacesAndNewlines),
    !secret.isEmpty
  else {
    throw KeychainError.missingValue
  }
  return secret
}

func makeAccessControl() throws -> SecAccessControl {
  var error: Unmanaged<CFError>?
  guard let access = SecAccessControlCreateWithFlags(
    nil,
    kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    [.biometryCurrentSet, .or, .devicePasscode],
    &error
  ) else {
    throw KeychainError.accessControl
  }
  return access
}

func setBioValue(_ secret: String) throws {
  try deleteValue(service: bioService)

  let access = try makeAccessControl()
  let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: bioService,
    kSecAttrAccount as String: account,
    kSecValueData as String: Data(secret.utf8),
    kSecAttrAccessControl as String: access,
  ]

  let status = SecItemAdd(query as CFDictionary, nil)
  guard status == errSecSuccess else {
    throw KeychainError.operationFailed(status)
  }
}

func getBioValue() throws -> String {
  let context = LAContext()
  context.localizedReason = "Unlock envpull vault"

  var authError: NSError?
  guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &authError) else {
    throw KeychainError.biometryUnavailable
  }

  let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: bioService,
    kSecAttrAccount as String: account,
    kSecReturnData as String: true,
    kSecMatchLimit as String: kSecMatchLimitOne,
    kSecUseAuthenticationContext as String: context,
  ]

  var item: CFTypeRef?
  let status = SecItemCopyMatching(query as CFDictionary, &item)
  guard status == errSecSuccess else {
    throw KeychainError.operationFailed(status)
  }
  guard let data = item as? Data, let secret = String(data: data, encoding: .utf8) else {
    throw KeychainError.missingValue
  }
  return secret
}

func setPlainValue(_ secret: String) throws {
  try deleteValue(service: plainService)

  let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: plainService,
    kSecAttrAccount as String: account,
    kSecValueData as String: Data(secret.utf8),
    kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
  ]

  let status = SecItemAdd(query as CFDictionary, nil)
  guard status == errSecSuccess else {
    throw KeychainError.operationFailed(status)
  }
}

func getPlainValue() throws -> String {
  let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: plainService,
    kSecAttrAccount as String: account,
    kSecReturnData as String: true,
    kSecMatchLimit as String: kSecMatchLimitOne,
  ]

  var item: CFTypeRef?
  let status = SecItemCopyMatching(query as CFDictionary, &item)
  guard status == errSecSuccess else {
    throw KeychainError.operationFailed(status)
  }
  guard let data = item as? Data, let secret = String(data: data, encoding: .utf8) else {
    throw KeychainError.missingValue
  }
  return secret
}

func deleteValue(service: String) throws {
  let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: service,
    kSecAttrAccount as String: account,
  ]
  let status = SecItemDelete(query as CFDictionary)
  if status != errSecSuccess && status != errSecItemNotFound {
    throw KeychainError.operationFailed(status)
  }
}

func usage() {
  printErr("Usage: envpull-keychain <set-bio|get-bio|delete-bio|set-plain|get-plain|delete-plain>")
  printErr("  set-bio / set-plain read the secret from stdin")
}

let args = CommandLine.arguments
guard args.count >= 2 else {
  usage()
  exit(2)
}

do {
  switch args[1] {
  case "set-bio", "set":
    // "set" kept as alias for older builds that expected argv; prefer stdin
    let secret = try readStdinSecret()
    try setBioValue(secret)
  case "get-bio", "get":
    let value = try getBioValue()
    print(value)
  case "delete-bio", "delete":
    try deleteValue(service: bioService)
  case "set-plain":
    let secret = try readStdinSecret()
    try setPlainValue(secret)
  case "get-plain":
    let value = try getPlainValue()
    print(value)
  case "delete-plain":
    try deleteValue(service: plainService)
  default:
    usage()
    exit(2)
  }
} catch KeychainError.biometryUnavailable {
  printErr("Biometrics unavailable on this Mac")
  exit(1)
} catch KeychainError.operationFailed(let status) where status == errSecUserCanceled {
  printErr("Touch ID cancelled")
  exit(1)
} catch KeychainError.operationFailed(let status) where status == errSecAuthFailed {
  printErr("Authentication failed")
  exit(1)
} catch KeychainError.operationFailed(let status) where status == errSecItemNotFound {
  exit(3)
} catch KeychainError.missingValue {
  printErr("Missing secret on stdin")
  exit(1)
} catch {
  printErr(String(describing: error))
  exit(1)
}
