```mermaid
%%{init: {'theme':'neutral'}}%%
classDiagram

    namespace ResourcesNs {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Resources controllers
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class UpdateAllResourcesLocalStorageController{
            event "passbolt.resources.update-local-storage"
            +exec() Promise
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

        class ExportResourcesFileController {
            event "passbolt.export-resources.export-to-file"
            +exec(object exportResourcesFileDto) Promise~ResourcesCollection~
        }

        class UpdateResourceController{
            event "passbolt.resources.update"
            +exec(object resourceDto, object secretDto) Promise~ResourceEntity~
        }

        class CreateResourceController{
            event "passbolt.resources.create"
            +exec(object resourceDto, object secretDto) Promise~ResourceEntity~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Resources services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class GetOrFindResourcesService {
            +getOrFindAll() Promise~ResourcesCollection~
        }

        class FindAndUpdateResourcesLocalStorageService {
            +findAndUpdateAll(FindAndUpdateResourcesLocalStorageOptions) Promise~ResourcesCollection~
            +findAndUpdateByIsSharedWithGroup(uuid groupId) Promise~ResourcesCollection~
        }

        class FindAndUpdateResourcesLocalStorageOptions {
            updatePeriodThreshold: integer
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

        class UpdateResourceService {
            +create(object resourceDto, object secretDto, string passphrase) Promise~ResourceEntity~
        }

        class CreateResourceService {
            +create(object resourceDto, object secretDto, string passphrase) Promise~ResourceEntity~
        }

        class ExecuteConcurrentlyService {
            +execute(array callbacks, integer concurrency, object options): Promise~array~
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
    %% MetadataNs services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class DecryptMetadataService {
            +decryptOneFromForeignModel(Entity entity, ?string passphrase) Promise~Entity~
            +decryptAllFromForeignModels(Collection collection, ?string passphrase, ?object options) Promise~Collection~
        }

        class EncryptMetadataService {
            +encryptOneForForeignModel(Entity entity, ?string passphrase) Promise~Entity~
        }

        class GetOrFindMetadataKeysService {
            +getOrFindOneByIsLatest() Promise~MetadataKeyEntity~
            +getOrFindOneById(uuid foreignKeyId) Promise~MetadataKeyEntity~
            +getOrFindAllByIds(array~uuid~ foreignKeyIds) Promise~MetadataKeysCollection~
        }

        class FindAndUpdateMetadataKeysSessionStorageService {
            +findAndUpdateAll(object contains, object filters) Promise~MetadataKeysCollection~
        }

        class FindMetadataKeysService {
            +findAll(object contains, object filters) Promise~MetadataKeysCollection~
            +findAllForSessionStorage() Promise~MetadataKeysCollection~
        }

        class DecryptMetadataKeyService {
            +decryptOne(MetadataPrivateKeyEntity entity, ?string passphrase) Promise~MetadataPrivateKeyEntity~
            +decryptAll(MetadataPrivateKeysCollection collection, ?string passphrase) Promise~MetadataPrivateKeysCollection~
            +decryptAllFromMetdataKeysCollection(MetadataKeysCollection collection, ?string passphrase) Promise~MetadataKeysCollection~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% MetadataNs models
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class MetadataKeysSessionStorageService {
        }

        class MetadataKeyApiService {
            +findAll(object contains, object filters) Promise~array~
        }
    }

    namespace SessionKeysNs {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% SessionKeys services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class GetOrFindSessionKeysService {
            +getOrFindOneByForeignKeyId(uuid foreignKeyId) Promise~SessionKeyEntity~
            +getOrFindAllByForeignKeyIds(array~uuid~ foreignKeyIds) Promise~SessionKeysCollection~
        }

        class FindAndUpdateSessionKeysSessionStorageService {
            +findAndUpdateAll(object contains, object filters) Promise~SessionKeysCollection~
        }

        class DecryptSessionKeysService {
            +decrypt(string data) Promis~SessionsKeysCollection~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% SessionKeys models
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        class SessionKeysSessionStorageService {
        }

        class SessionKeysLocalStorageService {
        }
    }

    namespace Auth-service {
        class PassphraseStorageService {
            get() Promise~string~
        }
    }

    namespace EntityCollectionNs {
        class ResourcesCollection {
            +filterByDecryptedMetadata() void
            +filterByResourceTypes(ResourceTypesCollection collection) void
            +filterBySuggestResources(string url) void
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
            +isMetadataDecrypted() boolean
        }

        class ResourceTypesCollection {
            +getFirstById(uuid id) ResourceTypeEntity
            +getFirstBySlug(string slug) ResourceTypeEntity
            +hasOneWithSlug(string slug) boolean
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
            +hasSecretDescription() boolean
            +hasTotp() boolean
            +isStandaloneTotp() boolean
        }

        class MetadataKeysCollection {
        }

        class MetadataKeyEntity {
            +uuid props.id
            +string props.fingerprint
            +string props.armored_key
            +string props.created
            +string props.created_by
            +string props.modified
            +string props.modified_by
        }

        class MetadataPrivateKeysCollection {
            +getFirstByIsLatest() MetadataKeyEntity
        }

        class MetadataPrivateKeyEntity {
            +uuid props.id
            +uuid props.metadata_key_id
            +uuid props.user_id
            +string props.data
            +string props.armored_key
            +string props.created
            +string props.created_by
            +string props.modified
            +string props.modified_by
            +get armoredKey(string armordKey) string
            +get data() string
            +set armoredKey(string armordKey) void
            +set data(string data) void
            +isDecrypted() boolean
        }
    }

    %% Resource relationships
    UpdateAllResourcesLocalStorageController*--FindAndUpdateResourcesLocalStorageService
    FindAllIdsByIsSharedWithGroupController*--FindAndUpdateResourcesLocalStorageService
    FindResourcesForShareController*--FindResourcesService
    FindResourceDetailsController*--FindResourcesService
    FindAndUpdateResourcesLocalStorageService*--ResourcesLocalStorageService
    ExportResourcesFileController*--FindResourcesService
    CreateResourceController*--CreateResourceService
    UpdateResourceController*--UpdateResourceService
    GetOrFindResourcesService*--ResourcesLocalStorageService
    GetOrFindResourcesService*--FindAndUpdateResourcesLocalStorageService
    FindAndUpdateResourcesLocalStorageService*--FindResourcesService
    FindResourcesService*--ResourceService
    CreateResourceService*--EncryptMetadataService
    CreateResourceService*--ResourceService
    CreateResourceService*--ResourcesLocalStorageService
    UpdateResourceService*--EncryptMetadataService
    UpdateResourceService*--ResourceService
    UpdateResourceService*--ResourcesLocalStorageService
    %% Metadata key relationships
    FindResourcesService*--DecryptMetadataService
    DecryptMetadataService*--GetOrFindSessionKeysService
    DecryptMetadataService*--GetOrFindMetadataKeysService
    DecryptMetadataService*--ResourcesLocalStorageService
    DecryptMetadataService*--PassphraseStorageService
    GetOrFindMetadataKeysService*--MetadataKeysSessionStorageService
    GetOrFindMetadataKeysService*--FindAndUpdateMetadataKeysSessionStorageService
    FindAndUpdateMetadataKeysSessionStorageService*--FindMetadataKeysService
    FindAndUpdateMetadataKeysSessionStorageService*--MetadataKeysSessionStorageService
    FindMetadataKeysService*--DecryptMetadataKeyService
    DecryptMetadataKeyService*--PassphraseStorageService
    FindMetadataKeysService*--MetadataKeyApiService
    EncryptMetadataService*--PassphraseStorageService
    EncryptMetadataService*--GetOrFindMetadataKeysService
    %% Session key relationships
    GetOrFindSessionKeysService*--SessionKeysSessionStorageService
    GetOrFindSessionKeysService*--FindAndUpdateSessionKeysSessionStorageService
    FindAndUpdateSessionKeysSessionStorageService*--SessionKeysLocalStorageService
    FindAndUpdateSessionKeysSessionStorageService*--SessionKeysSessionStorageService
    FindAndUpdateSessionKeysSessionStorageService*--DecryptSessionKeysService
    DecryptSessionKeysService*--PassphraseStorageService
    %% Entities relationships
    ResourcesCollection*--ResourceEntity
    ResourceEntity*--MetadataKeyEntity
    ResourceEntity*--ResourceTypeEntity
    ResourceTypesCollection*--ResourceTypeEntity
    MetadataKeysCollection*--MetadataKeyEntity
    MetadataKeyEntity*--MetadataPrivateKeysCollection
    MetadataPrivateKeysCollection*--MetadataPrivateKeyEntity
    %% Styling
    style CreateResourceController fill:#D2E0FB
    style ExportResourcesFileController fill:#D2E0FB
    style FindAllIdsByIsSharedWithGroupController fill:#D2E0FB
    style FindResourceDetailsController fill:#D2E0FB
    style FindResourcesForShareController fill:#D2E0FB
    style UpdateAllResourcesLocalStorageController fill:#D2E0FB
    style UpdateResourceController fill:#D2E0FB
    style ResourcesLocalStorageService fill:#DEE5D4
    style ResourceService fill:#DEE5D4
    style PassphraseStorageService fill:#DEE5D4
    style MetadataKeysSessionStorageService fill:#DEE5D4
    style MetadataKeyApiService fill:#DEE5D4
    style SessionKeysLocalStorageService fill:#DEE5D4
    style SessionKeysSessionStorageService fill:#DEE5D4
```
