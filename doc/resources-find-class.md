```mermaid
%%{init: {'theme':'neutral', 'layout': 'elk', 'elk': {'mergeEdges': true, 'nodePlacementStrategy': 'LINEAR_SEGMENTS'}}}%%
classDiagram

    namespace ResourcesNs {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Resources controllers
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class CreateResourceController{
            event "passbolt.resources.create"
            +exec(object resourceDto, object secretDto) Promise~ResourceEntity~
        }

        class ExportResourcesFileController {
            event "passbolt.export-resources.export-to-file"
            +exec(object exportResourcesFileDto) Promise~ResourcesCollection~
        }

        class FindAllIdsByIsSharedWithGroupController{
            event "passbolt.resources.find-all-ids-by-is-shared-with-group"
            +exec(uuid groupId) Promise~array~
        }

        class FindResourceDetailsController{
            event "passbolt.resources.find-details"
            +exec(uuid resourceId) Promise~ResourceEntity~
        }

        class FindResourcesForShareController{
            event "passbolt.share.find-resources-for-share"
            +exec(Array~uuid~ resourceIds) Promise~ResourcesCollection~
        }

        class ImportResourcesFileController {
            event "passbolt.import-resources.import-file"
            +exec(object ImportResourcesFileDto) Promise~ImportResourcesFileEntity~
        }

        class UpdateResourceController{
            event "passbolt.resources.update"
            +exec(object resourceDto, object secretDto) Promise~ResourceEntity~
        }

        class UpdateAllResourcesLocalStorageController{
            event "passbolt.resources.update-local-storage"
            +exec() Promise
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Resources services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class CreateResourceService {
            +create(object resourceDto, object secretDto, string passphrase) Promise~ResourceEntity~
        }

        class GetOrFindResourcesService {
            +getOrFindAll() Promise~ResourcesCollection~
        }

        class FindAndUpdateResourcesLocalStorageService {
            +findAndUpdateAll(FindAndUpdateResourcesLocalStorageOptions) Promise~ResourcesCollection~
            +findAndUpdateByIsSharedWithGroup(uuid groupId) Promise~ResourcesCollection~
        }

        class FindAndUpdateResourcesLocalStorageOptions {
            updatePeriodThreshold integer
        }

        class FindResourcesService {
            +findAll(object contains, object filters) Promise~ResourcesCollection~
            +findAllByHasAccessForLocalStorage(uuid acoForeignKey) Promise~ResourcesCollection~
            +findAllByIds(Array~uuid~ resourcesIds, object contains) Promise~ResourcesCollection~
            +findAllForLocalStorage() Promise~ResourcesCollection~
            +findAllByIdsForShare() Promise~ResourcesCollection~
            +findAllByIsSharedWithGroupForLocalStorage(uuid groupId) Promise~ResourcesCollection~
            +findAllForDecrypt(array~uuid~ resourceIds) Promise~ResourcesCollection~
            +findOneById(string uuid, object contains) Promise~ResourceEntity~
            +findOneByIdForDetails(string uuid) Promise~ResourceEntity~
        }

        class ImportResourcesService {
            +importFile(ImportResourcesFileEntity import) Promise~ImportResourcesFileEntity~
        }

        class UpdateResourceService {
            +update(object resourceDto, object secretDto, string passphrase) Promise~ResourceEntity~
        }

        class ExecuteConcurrentlyService {
            +execute(array callbacks, integer concurrency, object options) Promise~array~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Resources models
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class ResourcesLocalStorageService {
            $hasCachedData() boolean
            $flush() Promise
            $get() Promise~array~
            $set(ResourcesCollection collection) Promise
            $getResourceById(uuid id) Promise~object~
            $addResource(ResourceEntity entity) Promise
            $addResources(ResourcesCollection collection) Promise
            $updateResource(ResourceEntity entity) Promise
            $updateResources(ResourcesCollection collection) Promise
            $updateResourcesExpiryDate(array~PasswordExpiryResourceEntity~) Promise
            get $DEFAULT_CONTAIN() object
            $assertEntityBeforeSave()
        }

        class ResourceService {
            +get RESOURCE_NAME() string
            +getSupportedContainOptions() array$
            +getSupportedFilterOptions() array$
            +findAll(object contains, object filters, object orders) Promise~array~
        }
    }

    namespace MetadataNs {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Metadata controllers
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class GetOrFindMetadataTypesSettingsController {
            event "passbolt.metadata.get-or-find-metadata-types-settings"
            +exec() MetdataTypesSettingsEntity
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Metadata services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class DecryptMetadataService {
            +decryptOneFromForeignModel(Entity entity, ?string passphrase) Promise
            +decryptAllFromForeignModels(Collection collection, ?string passphrase, ?object options) Promise
        }

        class EncryptMetadataService {
            +encryptOneForForeignModel(Entity entity, ?string passphrase) Promise
            +encryptAllForForeignModels(Collection collection, ?string passphrase) Promise
        }

        class GetOrFindMetadataKeysService {
            +getOrFindOneByIsLatest() Promise~MetadataKeyEntity~
            +getOrFindOneById(uuid foreignKeyId) Promise~MetadataKeyEntity~
            +getOrFindAllByIds(array~uuid~ foreignKeyIds) Promise~MetadataKeysCollection~
        }

        class FindAndUpdateMetadataKeysSessionStorageService {
            +findAndUpdateAll(object contains, object filters) Promise~MetadataKeysCollection~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Metadata Keys services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class DecryptMetadataKeyService {
            +decryptOne(MetadataPrivateKeyEntity entity, ?string passphrase) Promise~MetadataPrivateKeyEntity~
            +decryptAll(MetadataPrivateKeysCollection collection, ?string passphrase) Promise~MetadataPrivateKeysCollection~
            +decryptAllFromMetdataKeysCollection(MetadataKeysCollection collection, ?string passphrase) Promise~MetadataKeysCollection~
        }

        class FindMetadataKeysService {
            +findAll(object contains) Promise~MetadataKeysCollection~
            +findAllForSessionStorage() Promise~MetadataKeysCollection~
        }

        class FindAndUpdateMetadataSettingsService {
            +findAndUpdateTypesSettings() Promise~MetadataTypesSettingsEntity~
        }

        class FindMetadataTypesSettingsService {
            +findTypesSettings() Promise~MetadataTypesSettingsEntity~
        }

        class GetOrFindMetadataSettingsService {
            +getOrFindTypesSettings() Promise~MetadataTypesSettingsEntity~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Metadata models
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class MetadataKeyApiService {
            +findAll(object contains) Promise~array~
        }

        class MetadataKeysSessionStorageService {
        }

        class MetadataTypesSettingsApiService {
            +findSettings() Promise~object~
        }

        class MetadataTypesSettingsLocalStorageService {
            +get() Promise~object~
            +set(MetadataTypesSettingsEntity entity) Promise
            +flush() Promise
        }
    }

    namespace SessionKeysNs {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% SessionKeys services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class DecryptSessionKeysService {
            +decrypt(string data) Promis~SessionKeysCollection~
        }

        class GetOrFindSessionKeysService {
            +getOrFindOneByForeignKeyId(uuid foreignKeyId) Promise~SessionKeyEntity~
            +getOrFindAllByForeignKeyIds(array~uuid~ foreignKeyIds) Promise~SessionKeysCollection~
        }

        class FindAndUpdateSessionKeysSessionStorageService {
            +findAndUpdateAll(object contains, object filters) Promise~SessionKeysCollection~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% SessionKeys models
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class SessionKeysBackupLocalStorageService {
            +get() Promise~object~
            +set(SessionKeysBackupEntity entity) Promise
            +flush() Promise
        }

        class SessionKeysSessionStorageService {
        }
    }

    namespace Auth-service {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Auth services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class GetPassphraseService {
            +getPassphrase(WorkerEntity worker) Promise~string~
            +requestPassphraseFromQuickAccess() Promise~string~
            +requestPassphrase(WorkerEntity worker) Promise~string~
        }

        class PassphraseStorageService {
            +get() Promise~string~
        }
    }

    namespace EntityCollectionNs {
        class MetadataKeyEntity {
            -uuid props.id
            -string props.fingerprint
            -string props.armored_key
            -string props.created
            -string props.created_by
            -string props.modified
            -string props.modified_by
            -string props.deleted
            +get metadataPrivateKeys() MetadataPrivateKeysCollection
        }

        class MetadataKeysCollection {
            +getFirstByLatestCreated() MetadataKeyEntity
        }

        class MetadataPrivateKeyEntity {
            -uuid props.id
            -uuid props.metadata_key_id
            -uuid props.user_id
            -string props.data
            -string props.armored_key
            -string props.created
            -string props.created_by
            -string props.modified
            -string props.modified_by
            +get armoredKey(string armordKey) string
            +get data() string
            +get metadataKeyId() string
            +get created() string
            +set armoredKey(string armordKey) void
            +set data(string data) void
            +isDecrypted() boolean
        }

        class MetadataPrivateKeysCollection {
        }

        class MetadataTypesSettingsEntity {
            -string props.default_resource_types
            -string props.default_folder_type
            -string props.default_tag_type
            -string props.default_comment_type
            -boolean props.allow_creation_of_v5_resources
            -boolean props.allow_creation_of_v5_folders
            -boolean props.allow_creation_of_v5_tags
            -boolean props.allow_creation_of_v5_comments
            -boolean props.allow_creation_of_v4_resources
            -boolean props.allow_creation_of_v4_folders
            -boolean props.allow_creation_of_v4_tags
            -boolean props.allow_creation_of_v4_comments
            +createFromV4Default() MetadataTypesSettingsEntity
            +createFromDefault(?object data) MetadataTypesSettingsEntity
        }

        class ResourceEntity {
            -uuid props.id
            -uuid props.resource_type_id
            -uuid props.metadata_key_id
            -uuid props.metadata_key_type
            -string props.metadata
            -uuid props.folder_parent_id
            -boolean personal
            -string props.expired
            -string props.deleted
            -string props.created
            -string props.created_by
            -string props.modified
            -string props.modified_by
            -MetadataEntity _metadata
            -FavoriteEntity _favorite
            -PermissionEntity _permission
            -PermissionsCollection _permissions
            -ResourceTypeEntity _resource_type
            -SecretsCollection _secrets
            -TagsCollection _tags
            -UserEntity _creator
            -UserEntity _modifier
            +get metadata() string|MetadataEntity
            +set metadata(string|MetadataEntity metadata)
            +isMetadataDecrypted() boolean
        }

        class ResourcesCollection {
            +filterByDecryptedMetadata() void
            +filterOutByMetadataDecrypted() void
            +filterByResourceTypes(ResourceTypesCollection collection) void
            +filterBySuggestResources(string url) void
        }

        class ResourceTypesCollection {
            +getFirstById(uuid id) ResourceTypeEntity
            +getFirstBySlug(string slug) ResourceTypeEntity
            +hasOneWithSlug(string slug) boolean
            +hasSomePasswordResourceTypes(?string version) boolean
            +hasSomeTotpResourceTypes(?string version) boolean
        }

        class ResourceTypeEntity {
            +uuid props.id
            +string props.name
            +string props.slug
            +object props.definition
            +string props.description
            +string props.created
            +string props.modified
            +hasPassword() boolean
            +hasDescription() boolean
            +hasSecretDescription() boolean
            +hasTotp() boolean
            +isStandaloneTotp() boolean
            +get version() string
        }

        class SessionKeyEntity {
            -string props.foreign_model
            -string foreign_id
            -string session_key
            +get sessionKey() string
        }

        class SessionKeysBackupEntity {
            -uuid props.id
            -uuid props.user_id
            -string props.data
            -SessionKeysCollection _session_keys
            -string props.created
            -string props.modified
            +get data() string
            +set data(string data)
            +get sessionKeys() SessionKeysCollection
            +set sessionKeys(SessionKeysCollection collection)
        }

        class SessionKeysCollection {
        }
    }

    %% Resource controllers relationships
    CreateResourceController*--CreateResourceService
    CreateResourceController*--GetPassphraseService
    ExportResourcesFileController*--FindResourcesService
    FindAllIdsByIsSharedWithGroupController*--FindAndUpdateResourcesLocalStorageService
    FindResourcesForShareController*--FindResourcesService
    FindResourceDetailsController*--FindResourcesService
    FindAndUpdateResourcesLocalStorageService*--ResourcesLocalStorageService
    ImportResourcesFileController*--GetPassphraseService
    ImportResourcesFileController*--ImportResourcesService
    UpdateAllResourcesLocalStorageController*--FindAndUpdateResourcesLocalStorageService
    UpdateResourceController*--GetPassphraseService
    UpdateResourceController*--UpdateResourceService
    style CreateResourceController fill:#D2E0FB
    style ExportResourcesFileController fill:#D2E0FB
    style FindAllIdsByIsSharedWithGroupController fill:#D2E0FB
    style FindResourceDetailsController fill:#D2E0FB
    style FindResourcesForShareController fill:#D2E0FB
    style ImportResourcesFileController fill:#D2E0FB
    style UpdateAllResourcesLocalStorageController fill:#D2E0FB
    style UpdateResourceController fill:#D2E0FB
    %% Resource services relationships.
    CreateResourceService*--EncryptMetadataService
    CreateResourceService*--ResourceService
    CreateResourceService*--ResourcesLocalStorageService
    GetOrFindResourcesService*--FindAndUpdateResourcesLocalStorageService
    GetOrFindResourcesService*--ResourcesLocalStorageService
    FindAndUpdateResourcesLocalStorageService*--FindResourcesService
    FindResourcesService*--ResourceService
    ImportResourcesService*--EncryptMetadataService
    ImportResourcesService*--ResourceService
    ImportResourcesService*--ResourcesLocalStorageService
    UpdateResourceService*--EncryptMetadataService
    UpdateResourceService*--ResourceService
    UpdateResourceService*--ResourcesLocalStorageService
    %% Resource models relationships.
    style ResourceService fill:#DEE5D4
    style ResourcesLocalStorageService fill:#DEE5D4

    %% Metadata controllers relationships
    GetOrFindMetadataTypesSettingsController*--GetOrFindMetadataSettingsService
    style GetOrFindMetadataTypesSettingsController fill:#D2E0FB
    %% Metadata services relationships.
    DecryptMetadataKeyService*--PassphraseStorageService
    DecryptMetadataService*--GetOrFindMetadataKeysService
    DecryptMetadataService*--GetOrFindSessionKeysService
    DecryptMetadataService*--PassphraseStorageService
    DecryptMetadataService*--ResourcesLocalStorageService
    EncryptMetadataService*--GetOrFindMetadataKeysService
    EncryptMetadataService*--PassphraseStorageService
    FindAndUpdateMetadataKeysSessionStorageService*--FindMetadataKeysService
    FindAndUpdateMetadataKeysSessionStorageService*--MetadataKeysSessionStorageService
    FindAndUpdateMetadataSettingsService*--FindMetadataTypesSettingsService
    FindAndUpdateMetadataSettingsService*--MetadataTypesSettingsLocalStorageService
    FindMetadataKeysService*--DecryptMetadataKeyService
    FindMetadataKeysService*--MetadataKeyApiService
    FindMetadataTypesSettingsService*--MetadataTypesSettingsApiService
    FindResourcesService*--DecryptMetadataService
    GetOrFindMetadataKeysService*--FindAndUpdateMetadataKeysSessionStorageService
    GetOrFindMetadataKeysService*--MetadataKeysSessionStorageService
    GetOrFindMetadataSettingsService*--FindAndUpdateMetadataSettingsService
    GetOrFindMetadataSettingsService*--MetadataTypesSettingsLocalStorageService
    %% Metadata models relationships.
    style MetadataKeyApiService fill:#DEE5D4
    style MetadataKeysSessionStorageService fill:#DEE5D4
    style MetadataTypesSettingsApiService fill:#DEE5D4

    %% Session keys service relationships
    DecryptSessionKeysService*--PassphraseStorageService
    FindAndUpdateSessionKeysSessionStorageService*--DecryptSessionKeysService
    FindAndUpdateSessionKeysSessionStorageService*--SessionKeysBackupLocalStorageService
    FindAndUpdateSessionKeysSessionStorageService*--SessionKeysSessionStorageService
    GetOrFindSessionKeysService*--FindAndUpdateSessionKeysSessionStorageService
    GetOrFindSessionKeysService*--SessionKeysSessionStorageService
    %% Session keys models relationships.
    style SessionKeysBackupLocalStorageService fill:#DEE5D4
    style SessionKeysSessionStorageService fill:#DEE5D4

    %% Entities relationships
    MetadataKeyEntity*--MetadataPrivateKeysCollection
    MetadataKeysCollection*--MetadataKeyEntity
    MetadataPrivateKeysCollection*--MetadataPrivateKeyEntity
    ResourceEntity*--MetadataKeyEntity
    ResourceEntity*--ResourceTypeEntity
    ResourceTypesCollection*--ResourceTypeEntity
    ResourcesCollection*--ResourceEntity
    SessionKeysCollection*--SessionKeyEntity
    SessionKeysBackupEntity*--SessionKeysCollection

    %% Auth services relationship.
    style PassphraseStorageService fill:#DEE5D4
```
