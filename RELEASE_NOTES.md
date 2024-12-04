Song:

Passbolt v4.10.2 is a maintenance update that prepares for the upcoming v5 release, improving cryptographic performance by supporting encryption and decryption with session keys.

Thank you to our community for your continued support.

### Added
PB-35706: WP3-3.7 Webapp EditStandaloneTotp component updates resources of type v5
PB-35741: WP3-5.5 Export resources of type v5
PB-35743: WP3-5.4 Migrate export resources controller logic into a dedicated service
PB-35753: WP3-6.3 Migrate update group controller logic into a dedicated service
PB-35771: WP3-8.1 Implement SessionKeyEntity entity to support session key
PB-35772: WP3-8.2 Implement SessionKeysCollection collection to support collection of session keys
PB-35773: WP3-8.3 Implement SessionKeysBundleEntity entity to support persisted collection session keys as stored on the API or local storage
PB-35857: WP3-8.9 Implement SessionKeysBundlesSessionStorageService to store and retrieve session keys bundles from session storage
PB-35858: WP3-8.4 Implement SessionKeysBundlesCollection collection to support collection of session keys bundle entity
PB-35862: WP3-8.5 Implement decryptOne on DecryptSessionKeysBundles service to decrypt a session key bundle
PB-35863: WP3-8.6 Implement decryptAll on DecryptSessionKeysBundlesService service to decrypt a sessions keys bundles collection
PB-35864: WP3-8.7 Implement findAll on SessionKeysBundlesApiService to retrieve session keys bundles from the API
PB-35867: WP3-8.8 Implement findAllBundles on FindSessionKeysService to retrieve sessions keys bundles from the API
PB-35869: WP3-8.10 Implement findAndUpdateAllBundles on FindAndUpdateSessionKeysSessionStorageService to retrieve session keys bundles from the API and store them in the session storage
PB-35876: WP3-8.11 Implement getOrFindAllBundles on GetOrFindSessionKeysService to retrieve session keys from store or from the API and store them in the session storage
PB-35877: WP3-8.12 Implement getOrFindAllByForeignModelAndForeignIds on GetOrFindSessionKeysService to retrieve session keys from storage or from the API and store them in the session storage
PB-35878: WP3-8.20 DecryptMetadataService should use the session keys when decrypting metadata of a collection of resources
PB-35879: WP3-8.13 Implement decryptWithSessionKey on DecryptMessageService
PB-35881: WP3-8.14 Implement GetSessionKeyService crypto service
PB-35886: WP3-8.15 Implement create on SessionKeysBundlesApiService to create a session keys bundle on the API
PB-35887: WP3-8.16 Implement delete on SessionKeysBundlesApiService to delete a session keys bundle on the API
PB-35888: WP3-8.17 Implement update on SessionKeysBundlesApiService to update a session keys bundle on the API
PB-35889: WP3-8.18 Implement encryptOne on EncryptSessionKeysBundlesService to encrypt session keys bundle session keys prior to persist the data
PB-35890: WP3-8.19 Implement save on SaveSessionKeysService to persist sessions keys on API
PB-35948: WP3-8.21 Implement SessionKeysBundleDataEntity entity to support persisted collection decrypted session keys bundle
PB-36286: WP3-6.7 ShareDialog should not have to share resources by passing resources and all its details to the service worker
PB-36509: WP3-6.5 Migrate move resource controller logic into a dedicated service
PB-36511: WP3-6.8 Migrate share folder logic from controller/share model to service
PB-36513: WP3-6.10 Migrate move folder controller logic into a dedicated service
PB-36520: WP3-8.22 DecryptMetadataService should persists session keys changes after a decryptAllFromForeignModels is performed
PB-36522: WP3-1.1 Remember the passphrase for a minimum default period after sign-in to allow smooth decryption of the metadata
PB-36523: WP3-1.2 Updating resources local storage requiring user passphrase should request the user passphrase if not present in the session storage
PB-36559: WP3-6.8.1 Implement findFoldersService findAllByIds to support request batch splitting
PB-36560: WP3-6.8.2 Implement getOrFindFoldersService to retrieve folders from local storage or update if with API
PB-36561: WP3-6.8.3 Implement findByIdsWithPermissions on findResourcesService and findFoldersService
PB-36583: WP3-8.4.1 Add same user id build rules for SessionKeysBundlesCollection
PB-36598: WP3-2.21 Validate GPG armored message to support iOS format
PB-36897: WP4-1.2 Migration Storybook new CSF format
PB-36945: WP3-8.24 GetOrFindSessionKeys getOrFindAll shouldn't crash if no sessions keys bundle is found

### Security
PB-36967: Upgrade vulnerable library cross-spawn

### Fixed
PB-36501: GITHUB Fix share dialog autocomplete sorting

### Maintenance
PB-36972: Update progress service to propose an API to control step count to finish
