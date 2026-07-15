import Foundation
import LocalAuthentication
import Security

let service = "envpull-master-key-bio"
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

func makeAccessControl() throws -> SecAccessControl {
  var error: Unmanaged<CFError>?
  // Touch ID / Face ID when available, otherwise device passcode
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

func setValue(_ secret: String) throws {
  try deleteValue()

  let access = try makeAccessControl()
  let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: service,
    kSecAttrAccount as String: account,
    kSecValueData as String: Data(secret.utf8),
    kSecAttrAccessControl as String: access,
  ]

  let status = SecItemAdd(query as CFDictionary, nil)
  guard status == errSecSuccess else {
    throw KeychainError.operationFailed(status)
  }
}

func getValue() throws -> String {
  let context = LAContext()
  context.localizedReason = "Unlock envpull vault"

  var authError: NSError?
  guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &authError) else {
    throw KeychainError.biometryUnavailable
  }

  let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: service,
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

func deleteValue() throws {
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
  printErr("Usage: envpull-keychain <set|get|delete> [value]")
}

let args = CommandLine.arguments
guard args.count >= 2 else {
  usage()
  exit(2)
}

do {
  switch args[1] {
  case "set":
    guard args.count >= 3 else {
      usage()
      exit(2)
    }
    try setValue(args[2])
  case "get":
    let value = try getValue()
    print(value)
  case "delete":
    try deleteValue()
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
} catch {
  printErr(String(describing: error))
  exit(1)
}
