Song: https://www.youtube.com/watch?v=d9WHUTKMD8k

Passbolt Browser Extension v5.1.0 is now available as a release candidate. This version introduces encrypted resource metadata (beta) for all users, along with numerous enhancements and bug fixes. For full details, please see the changelog.

We would also like to thank the community for their invaluable feedback.

### Added
- PB-41340 Add dedicated input to fix autofill on specific website
- PB-41734 SPKD-1.1 Rename metadata private key getter/setter dataSignedByCurrentUser & ensure constructor pass options to its parent class to ensure validation can be disabled
- PB-41735 SPKD-1.2 Verify the metadata public key entity fingerprint is equal to the  armored key fingerprint in FindMetadataKeysService findAll
- PB-41737 SPKD-1.3 Verify metadata private  key data entity fingerprint with armored key fingerprint in DecryptMetadataPrivateKeysService decryptOne
- PB-41738 SPKD-1.4 Assert metadata keys collection fingerprints public/private integrity in DecryptMetadataPrivateKeysService decryptAllFromMetadataKeysCollection
- PB-41739 SPKD-1.5 Adapt DecryptMessageService.decrypt to return the raw OpenPGP decryption result, including signatures, without throwing an error when signature verification fails
- PB-41740 SPKD-1.7 Implement findVerifiedSignatureForGpgKey in src/all/background_page/service/crypto/findSignatures utils to retrieve a signature for a given OpenPGP key
- PB-41741 SPKD-1.8 Check current user signature when decrypting Metadata Private Key Data
- PB-41742 SPKD-1.6 Implement ExternalGpgSignatureEntity to carry OpenPGP signature data
- PB-41743 SPKD-1.9 Implement MetadataTrustedKeyEntity to carry the information relative to a trusted metadata key
- PB-41744 SPKD-1.10 Implement TrustedMetadataKeyLocalStorage to support the persistence of the trusted metadata key
- PB-41746 SPKD-2.1 Implement bext ConfirmMetadataKeyContentCodeService to request user to confirm trusted metadata keys changes
- PB-41747 SPKD-2.2 Implement confirm metadata key event handler and dialog on the web application
- PB-41748 SPKD-2.3 Implement confirm metadata key event handler and dialog on the quick application
- PB-41749 SPKD-2.4 Implement GetMetadataTrustedKeyService get to retrieve the trusted metadata key from the local storage
- PB-41753 SPKD-2.8 Implement VerifyOrTrustMetadataKeyService verifyTrustedOrTrustNewMetadataKey to verify that the current active metadata key is trusted or request the user to trust it
- PB-41750 SPKD-2.5 Implement MetadataPrivateKeyApiService update to update a trusted metadata key on the API
- PB-41751 SPKD-2.6 Implement UpdateMetadataKeyPrivateService update function to update a trusted metadata key
- PB-41752 SPKD-2.7 Implement TrustMetadataKeyService trust to trust a new metadata key
- PB-41847 SPKD-2.18 Add creator field to metadataKeyEntity test data
- PB-41916 SPKD-2.19 Flush Metadata Keys Settings storage when a user is signed-out
- PB-41918 SPKD-2.20 Adapt EncryptMessageService.encrypt so that it can sign a message with a specified date
- PB-41919 SPKD-2.21 Adapt EncryptMetadataPrivateKeysService.encryptOne so that it can sign a message with a specified date
- PB-41958 SPKD-2.10 Verify and trust metadata key prior to encrypt metadata
- PB-41961 SPKD-2.21 Add in diagram TrustMetadataKeyService
- PB-41962 SPKD-2.22 Add unit test and in the diagram for VerifyOrTrustMetadataKeyService

### Fixed
- PB-35383 refresh folders list after delete parent folder and keep items inside
- PB-39607 metadata migration should encrypt metadata with user's key when encrypting a personal resource
- PB-40181 The session keys cache items are missing modified field
- PB-41296 on a fresh install + first login after setup (firefox + debian) going to the user workspace crashes as roles are not defined
- PB-41304 import password errors (UAT required & fix)
- PB-41305 clicking on folder parent in location of a resource in the right sidebar just close the panel
- PB-41407 account recovery in user profile can crash when clicking on review
- PB-41638 Hide administration workspace shifter on desktop app
- PB-41716 Permalink when paste in url and local storage is not loaded yet
- PB-41753 safer key public distribution confirmation in quickaccess
- PB-41776 password input with show icon can display a broken UI
- PB-41841 user workspace displays a blank screen when accessing a user's URL directly from the browser
- PB-41846 Other type resource dialog TOTP does not open a TOTP but a password + totp
- PB-42030 'where to find my account kit' does no open the browser for help
- PB-42033 design of security token in input field could be broken with some characters
- PB-42046 set empty translations with their default string
- PB-42105 import of resources process always uses shared metadata key instead of personal key
- PB-42106 throw an error while decrypting resource metadata if the decrypted metadata object type is not valid
- PB-41378 UI minor bug: multiple resource select, right sidebar cropped
- PB-41435 Display the folder context menu above the “More” button
- PB-41551 Show a disabled style when dragging an item over an invalid drop target
- PB-41550 Refresh the folder tree after the folder‑hierarchy cache updates (order issue)
- PB-41627 UI bug: Note formatting in the right sidebar
- PB-41759 Browser extension should enforce object_type on metadata of resource creation / edition

### Maintenance
- PB-38199 Update administration page Role-Based Access Control save behavior
- PB-41346 Remove mfa settings screens from API
- PB-41366 ECC-1.1 Update browser extension outdated OpenPGP.js to version 6
- PB-41384 Upgrade vulnerable lib on bext 'image-size'
- PB-41385 2.1 Display react list for folder tree
- PB-41386 2.2 Folders updated should be refreshed in the folder tree
- PB-41387 2.3 Navigate to a folder form route should scroll the folder tree to see the selected folder
- PB-41388 2.4 Update the padding according to the depth of the folder
- PB-41414 WP4-14.2 Migrate import account kit screen
- PB-41646 UI adjustment: All tables should have a 0.8rem gap
- PB-41648 UI adjustment: Name column size in grid should be large by default
- PB-41647 UI adjustment: All dialog & setting primary should have a regular font weight
- PB-41653 UI adjustment: Grid select column, padding left & right 1.6rem
- PB-41709 Add activity diagram to verify metadata keys
- PB-41720 Add licence on SVG in the folder svg on the styleguide
