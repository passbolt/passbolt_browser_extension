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
// @since         v5.10.0
//

import Foundation
import Testing

@Suite("SecureProfileSessionManager", .serialized)
struct SecureProfileSessionManagerTests {

    init() {
        SecureProfileSessionManager.invalidateAllSessions()
    }

    @Test("same profile returns same session, different profile returns different session")
    func sessionCachingAndIsolation() {
        let sessionA1 = SecureProfileSessionManager.session(forProfile: "profile-A")
        let sessionA2 = SecureProfileSessionManager.session(forProfile: "profile-A")
        let sessionB = SecureProfileSessionManager.session(forProfile: "profile-B")
        #expect(sessionA1 === sessionA2)
        #expect(sessionA1 !== sessionB)
    }

    @Test("session disables cookies, credentials, and caching for security")
    func sessionSecurityConfiguration() {
        let session = SecureProfileSessionManager.session(forProfile: "security-test")
        let config = session.configuration
        #expect(config.httpCookieStorage == nil)
        #expect(config.httpShouldSetCookies == false)
        #expect(config.httpCookieAcceptPolicy == .never)
        #expect(config.urlCredentialStorage == nil)
        #expect(config.requestCachePolicy == .reloadIgnoringLocalAndRemoteCacheData)
    }

    @Test("invalidateSession removes only that profile's session")
    func invalidateSessionSelectiveRemoval() {
        let sessionA = SecureProfileSessionManager.session(forProfile: "keep")
        let sessionB = SecureProfileSessionManager.session(forProfile: "remove")
        SecureProfileSessionManager.invalidateSession(forProfile: "remove")
        let sessionAAfter = SecureProfileSessionManager.session(forProfile: "keep")
        let sessionBAfter = SecureProfileSessionManager.session(forProfile: "remove")
        #expect(sessionA === sessionAAfter)
        #expect(sessionB !== sessionBAfter)
    }

    @Test("invalidateAllSessions clears all cached sessions")
    func invalidateAllSessions() {
        let session1 = SecureProfileSessionManager.session(forProfile: "all-1")
        let session2 = SecureProfileSessionManager.session(forProfile: "all-2")
        SecureProfileSessionManager.invalidateAllSessions()
        let session1After = SecureProfileSessionManager.session(forProfile: "all-1")
        let session2After = SecureProfileSessionManager.session(forProfile: "all-2")
        #expect(session1 !== session1After)
        #expect(session2 !== session2After)
    }

    @Test("session has a delegate set")
    func sessionHasDelegate() {
        let session = SecureProfileSessionManager.session(forProfile: "delegate-test")
        #expect(session.delegate != nil)
    }

    @Test("concurrent session access and invalidation do not crash")
    func concurrentAccess() async {
        await withTaskGroup(of: Void.self) { group in
            for i in 0..<50 {
                group.addTask {
                    let _ = SecureProfileSessionManager.session(forProfile: "concurrent-\(i % 5)")
                }
            }
            for i in 0..<10 {
                group.addTask {
                    SecureProfileSessionManager.invalidateSession(forProfile: "concurrent-\(i % 5)")
                }
            }
        }
    }
}
