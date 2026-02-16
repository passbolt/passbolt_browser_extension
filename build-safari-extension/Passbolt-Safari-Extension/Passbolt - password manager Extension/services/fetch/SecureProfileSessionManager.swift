//
// Passbolt - Open source password manager for teams
// Copyright (c) Passbolt SA
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
// Public License (AGPL) as published by the Free Software Foundation version 3.
//
// The name "Passbolt" is a registered trademark of Passbolt SA, and Passbolt SA hereby declines to grant a trademark
// license to "Passbolt" pursuant to the GNU Affero General Public License version 3 Section 7(e), without a separate
// agreement with Passbolt SA.
//
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
// warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with this program. If not,
// see GNU Affero General Public License v3 (http://www.gnu.org/licenses/agpl-3.0.html).
//
// @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
// @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
// @link          https://www.passbolt.com Passbolt (tm)
// @since         v5.7.0
//

import Foundation

/// Manages profile-isolated URLSession instances for secure multi-profile support.
/// Each Safari profile gets its own URLSession with completely isolated cookie storage,
/// ensuring that cookies from one profile cannot leak to another.
final class SecureProfileSessionManager {
    // Thread-safe storage for profile sessions
    private static var sessionCache: [String: CachedSession] = [:]
    private static let lock = NSLock()

    // Session TTL: 30 minutes of inactivity before cleanup
    private static let sessionTTL: TimeInterval = 30 * 60

    /// Wrapper to track session last access time for TTL-based cleanup
    private struct CachedSession {
        let session: URLSession
        var lastAccess: Date

        init(session: URLSession) {
            self.session = session
            self.lastAccess = Date()
        }

        mutating func touch() {
            self.lastAccess = Date()
        }

        func isExpired(ttl: TimeInterval) -> Bool {
            return Date().timeIntervalSince(lastAccess) > ttl
        }
    }

    /// Creates or returns a completely isolated URLSession for a specific profile.
    /// Each profile gets its own HTTPCookieStorage instance that is NOT
    /// connected to HTTPCookieStorage.shared.
    ///
    /// - Parameter profileUUID: The unique identifier for the Safari profile
    /// - Returns: A URLSession instance isolated to the specified profile
    static func session(forProfile profileUUID: String) -> URLSession {
        lock.lock()
        defer { lock.unlock() }

        // Cleanup expired sessions periodically
        cleanupExpiredSessionsLocked()

        // Return cached session if exists and update last access time
        if var cached = sessionCache[profileUUID] {
            cached.touch()
            sessionCache[profileUUID] = cached
            return cached.session
        }

        // Create profile-specific configuration
        let config = URLSessionConfiguration.default

        // CRITICAL: Disable URLSession's automatic cookie handling completely.
        // The extension manages cookies via chrome.cookies API which is profile-isolated.
        // We inject cookies manually via the Cookie header in the request.
        // This prevents duplicate/conflicting cookies between URLSession and the extension.
        config.httpCookieStorage = nil
        config.httpShouldSetCookies = false
        config.httpCookieAcceptPolicy = .never

        // SECURITY: Disable credential storage completely
        // Prevents auth tokens from persisting across sessions
        config.urlCredentialStorage = nil

        // SECURITY: No memory cache, no disk persistence
        config.urlCache = URLCache(
            memoryCapacity: 0,  // No memory cache
            diskCapacity: 0,              // NO disk cache
            diskPath: nil
        )

        // SECURITY: Prevent cached responses
        config.requestCachePolicy = .reloadIgnoringLocalAndRemoteCacheData

        // Create session with security delegate
        let session = URLSession(
            configuration: config,
            delegate: SecureSessionDelegate(profileUUID: profileUUID),
            delegateQueue: nil  // Use URLSession's internal queue
        )

        sessionCache[profileUUID] = CachedSession(session: session)
        return session
    }

    /// Cleans up sessions that have exceeded their TTL.
    /// Must be called while holding the lock.
    private static func cleanupExpiredSessionsLocked() {
        let expiredKeys = sessionCache.filter { $0.value.isExpired(ttl: sessionTTL) }.map { $0.key }
        for key in expiredKeys {
            if let cached = sessionCache.removeValue(forKey: key) {
                cached.session.invalidateAndCancel()
            }
        }
    }

    /// Invalidates and removes a profile's session completely.
    /// Call this when a user logs out to ensure complete cleanup.
    /// Note: Cookie cleanup is handled by the extension via chrome.cookies API,
    /// not by URLSession since we disabled automatic cookie handling.
    ///
    /// - Parameter profileUUID: The unique identifier for the Safari profile
    static func invalidateSession(forProfile profileUUID: String) {
        lock.lock()
        defer { lock.unlock() }

        if let cached = sessionCache.removeValue(forKey: profileUUID) {
            cached.session.invalidateAndCancel()
        }
    }

    /// Invalidates all cached sessions.
    /// Useful for complete cleanup on extension unload.
    static func invalidateAllSessions() {
        lock.lock()
        defer { lock.unlock() }

        for (_, cached) in sessionCache {
            cached.session.invalidateAndCancel()
        }
        sessionCache.removeAll()
    }
}

// MARK: - Security Delegate

/// URLSession delegate that enforces security policies for profile-isolated sessions.
private class SecureSessionDelegate: NSObject, URLSessionTaskDelegate {
    let profileUUID: String

    init(profileUUID: String) {
        self.profileUUID = profileUUID
        super.init()
    }

    /// SECURITY: Block cross-domain redirects to prevent cookie leakage.
    /// Only allows redirects within the same host.
    func urlSession(
        _ session: URLSession,
        task: URLSessionTask,
        willPerformHTTPRedirection response: HTTPURLResponse,
        newRequest request: URLRequest,
        completionHandler: @escaping (URLRequest?) -> Void
    ) {
        guard let originalHost = task.originalRequest?.url?.host,
              let newHost = request.url?.host else {
            completionHandler(nil)  // Block if hosts can't be determined
            return
        }

        if originalHost.lowercased() == newHost.lowercased() {
            completionHandler(request)  // Allow same-host redirect
        } else {
            // SECURITY: Block cross-domain redirects
            // This prevents cookie leakage via redirect chains
            completionHandler(nil)
        }
    }

    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        if challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
           let serverTrust = challenge.protectionSpace.serverTrust {
                completionHandler(.useCredential, URLCredential(trust: serverTrust))
        } else {
            completionHandler(.performDefaultHandling, nil)
        }
    }

}
