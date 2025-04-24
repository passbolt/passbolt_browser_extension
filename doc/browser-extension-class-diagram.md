```mermaid

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
            +exec(object exportResourcesFileDto) Promise~ExportResourcesFileEntity~
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
            +findAllByIdsForDisplayPermissions(array~uuid~ resourceIds) Promise~ResourcesCollection~
            +findAllByIdsForShare() Promise~ResourcesCollection~
            +findAllByIdsWithPermissions(array~uuid~ resourcesIds) Promise~ResourcesCollection~
            +findAllByIsSharedWithGroupForLocalStorage(uuid groupId) Promise~ResourcesCollection~
            +findAllForDecrypt(array~uuid~ resourceIds) Promise~ResourcesCollection~
            +findOneById(string uuid, object contains) Promise~ResourceEntity~
            +findOneByIdForDetails(string uuid) Promise~ResourceEntity~
        }

        class ImportResourcesService {
            +parseFile(ImportResourcesFileEntity import) Promise~void~
            +importFile(ImportResourcesFileEntity import, string passphrase) Promise~ImportResourcesFileEntity~
        }

        class ExportResourcesService {
            +prepareExportContent(ExportResourcesFileEntity import) Promise~void~
            +exportToFile(ExportResourcesFileEntity import, string passphrase) Promise~void~
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

    namespace ResourceTypesNs {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Resource Types controllers
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class GetResourceTypesController {
            event "passbolt.resource-type.get-or-find-all"
            +exec() Promise~ResourceTypesCollection~
        }

        class FindAllByDeletedAndNonDeletedResourceTypesContoller {
            event "passbolt.resource-types.find-all-by-deleted-and-non-deleted"
            +exec() Promise~ResourceTypesCollection~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Resource Types services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class ResourceTypeService {
            +findAll(object contain, object filters) Promise~array~
            +findAllByDeletedAndNonDeleted() Promise~ResourceTypesCollection~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Resource Types models
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class ResourceTypeModel {
            +updateLocalStorage() Promise~ResourceTypesCollection~
            +getOrFindAll() Promise~ResourceTypesCollection~
            +getSecretSchemaById(string resourceTypeId) Promise~object~
        }
    }

    namespace MetadataNs {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Metadata controllers
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class CreateMetadataKeyController {
            event "passbolt.metadata.create-key"
            +exec() Promise~MetadataKeyEntity~
        }

        class FindAllNonDeletedMetadataKeysController {
            event "passbolt.metadata.find-all-non-deleted-metadata-keys"
            +exec() Promise~MetadataKeysCollection~
        }

        class GenerateMetadataPrivateKeyController {
            event "passbolt.metadata.generate-metadata-key"
            +exec() Promise~ExternalGpgKeyPairEntity~
        }

        class GetOrFindMetadataTypesSettingsController {
            event "passbolt.metadata.get-or-find-metadata-types-settings"
            +exec() Promise~MetadataTypesSettingsEntity~
        }

        class SaveMetadataKeysSettingsController {
            event "passbolt.metadata.save-metadata-keys-settings"
            +exec() Promise~MetadataKeysSettingsEntity~
        }

        class SaveMetadataTypesSettingsController {
            event "passbolt.metadata.save-metadata-types-settings"
            +exec() Promise~MetadataTypesSettingsEntity~
        }

        class FindMetadataMigrateResourcesController {
            event "passbolt.metadata.find-metadata-migrate-resources-details"
            +exec() Promise~PassboltResponsePaginationHeaderEntity~
        }

        class MigrateMetadataResourcesController {
            event "passbolt.metadata.migrate-resources-metadata"
            +exec() Promise~void~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Metadata services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class DecryptMetadataService {
            +decryptOneFromForeignModel(Entity entity, ?string passphrase) Promise
            +decryptAllFromForeignModels(Collection collection, ?string passphrase, ?object options) Promise
        }

        class DecryptMetadataPrivateKeysService {
            +decryptOne(MetadataPrivateKeyEntity entity, ?string passphrase) Promise
            +decryptAll(MetadataPrivateKeyCollection collection, ?string passphrase) Promise
            +decryptAllFromMetadataKeysCollection(MetadataKeysCollection collection, ?string passphrase) Promise
        }

        class EncryptMetadataService {
            +encryptOneForForeignModel(Entity entity, ?string passphrase) Promise
            +encryptAllForForeignModels(Collection collection, ?string passphrase) Promise
        }

        class EncryptMetadataPrivateKeysService {
            +encryptOne(MetadataPrivateKeyEntity metadataPrivateKey, openpgp.PrivateKey userPrivateKey) Promise
            +encryptAll(MetadataPrivateKeyCollection metadataPrivateKeys, openpgp.PrivateKey userPrivateKey) Promise
            +encryptAllFromMetadataKeyEntity(MetadataKeyEntity metadataKey, openpgp.PrivateKey userPrivateKey) Promise
        }

        class FindMetadataMigrateResourcesService {
            +findMigrateDetails(boolean sharedContentOnly) Promise~void~
        }

        class MigrateMetadataResourcesService {
            +migrate(MigrateMetadataEntity migrateMetadataEntity, string passphrase, replayOptions = count: 0) Promise~void~
        }

        class ConfirmMetadataKeyContentCodeService {
            +requestConfirm(MetdataTrustedKeyEntity trustedKey, MetadataKeyEntity metadataKey) Promise~boolean~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Metadata Keys services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class CreateMetadataKeyService {
            +create(ExternalGpgKeyPairEntity entity, string passphrase) MetadataKeyEntity
        }

        class DecryptMetadataPrivateKeysService {
            +decryptOne(MetadataPrivateKeyEntity entity, ?string passphrase) Promise~MetadataPrivateKeyEntity~
            +decryptAll(MetadataPrivateKeysCollection collection, ?string passphrase) Promise~MetadataPrivateKeysCollection~
            +decryptAllFromMetdataKeysCollection(MetadataKeysCollection collection, ?string passphrase) Promise~MetadataKeysCollection~
        }

        class FindAndUpdateMetadataKeysSessionStorageService {
            +findAndUpdateAll(object contains, object filters) Promise~MetadataKeysCollection~
        }

        class FindMetadataKeysService {
            +findAll(object contains) Promise~MetadataKeysCollection~
            +findAllForSessionStorage() Promise~MetadataKeysCollection~
            +findAllNonDeleted() Promise~MetadataKeysCollection~
        }

        class GenerateMetadataKeyService {
            +generateKey(string passphrase) Promise~ExternalGpgKeyPairEntity~
        }

        class GetOrFindMetadataKeysService {
            +getOrFindAll() Promise~MetadataKeysCollection~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Metadata Settings services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class FindAndUpdateMetadataSettingsService {
            +findAndUpdateKeysSettings() Promise~MetadataKeysSettingsEntity~
            +findAndUpdateTypesSettings() Promise~MetadataTypesSettingsEntity~
        }

        class FindMetadataSettingsService {
            +findKeysSettings() Promise~MetadataKeysSettingsEntity~
            +findTypesSettings() Promise~MetadataTypesSettingsEntity~
        }

        class GetOrFindMetadataSettingsService {
            +getOrFindKeysSettings() Promise~MetadataKeysSettingsEntity~
            +getOrFindTypesSettings() Promise~MetadataTypesSettingsEntity~
        }

        class SaveMetadataSettingsService {
            +saveKeysSettings(MetadataKeysSettingsEntity settings) Promoise~MetadataKeysSettingsEntity~
            +saveTypesSettings(MetadataTypesSettingsEntity settings) Promise~MetadataTypesSettingsEntity~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Metadata models
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class MetadataKeyApiService {
            +findAll(object contains) Promise~array~
        }

        class MetadataKeysSettingsLocalStorage {
            -$_runtimeCachedData object
            +get() Promise~object~
            +set(MetadataKeysSettingsEntity entity) Promise
            +flush(AccountEntity account) Promise
        }

        class MetadataKeysSessionStorageService {
        }

        class MetadataKeysSettingsApiService {
            +findSettings() Promise~object~
            +save(MetadataSaveSettingsEntity entity) Promise~object~
        }

        class MetadataTypesSettingsApiService {
            +findSettings() Promise~object~
            +save(MetadataTypesSettingsEntity entity) Promise~object~
        }

        class MetadataTypesSettingsLocalStorage {
            -$_runtimeCachedData object
            +get() Promise~object~
            +set(MetadataTypesSettingsEntity entity) Promise
            +flush(AccountEntity account) Promise
        }

        class TrustedMetadataKeyLocalStorage {
            -$_runtimeCachedData object
            +get() Promise~object~
            +set(MetadataTrustedKeyEntity entity) Promise
            +flush(AccountEntity account) Promise
        }

        class MigrateMetadataResourcesApiService {
            +findAll(object contains, object filters) Promise~PassboltResponseEntity~
            +migrate(ResourcesCollection resourcesCollection, object contains, object filters) Promise~PassboltResponseEntity~
        }
    }

    namespace SessionKeysNs {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% SessionKeys services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class DecryptSessionKeysBundlesService {
            +decryptOne(SessionKeysBundleEntity entity, ?string passphrase) Promise
            +decryptAll(SessionKeysBundlesCollection collection, ?string passphrase) Promise
        }

        class EncryptSessionKeysBundlesService {
            +encryptOne(SessionKeysBundleEntity entity, ?string passphrase) Promise
        }

        class GetOrFindSessionKeysService {
            +getOrFindAllBundles() Promise~SessionKeysBundlesCollection~
            +getOrFindAll(): Promise~SessionKeysCollection~
            +getOrFindAllByForeignModelAndForeignIds(string foreignModel, array foreignIds): Promise~SessionKeysCollection~
        }

        class FindAndUpdateSessionKeysBundlesSessionStorageService {
            +findAndUpdateAllBundles() Promise~SessionKeysBundlesCollection~
        }

        class FindSessionKeysService {
            +findAllBundles() Promise~SessionKeysBundlesCollection~
        }

        class SaveSessionKeysService {
            +save(SessionKeysCollection collection, ?string passphrase, ?boolean retryUpdate) Promise
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% SessionKeys models
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class SessionKeysBundlesApiService {
            +create(SessionKeysBundleEntity entity) Promise~object~
            +delete(string id) Promise
            +findAll() Promise~array~
            +udpate(string id, SessionKeysBundleEntity entity) Promise~object~
        }

        class SessionKeysBundlesSessionStorageService {
            -$_runtimeCachedData object
            +hasCachedData(): boolean
            +get() Promise~array~
            +set(SessionKeysBundlesCollection collection) Promise
            +flush(AccountEntity account) Promise
        }
    }

    namespace UsersNs {

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Users controllers
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Users services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class FindUsersService {
            +findAll(object contains, object filters, boolean ignoreInvalidEntity) Promise~UsersCollection~
            +findAllActive() Promise~UsersCollection~
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Users services
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class UserService {
            +get RESOURCE_NAME() string
            +getSupportedContainOptions() array$
            +getSupportedFilterOptions() array$
            +findAll(object contains, object filters, object orders) Promise~array~
        }
    }

    namespace AuthNs {
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Auth controllers
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


        class GetCsrfTokenController{
            event "passbolt.auth.get-csrf-token"
            +exec() Promise
        }

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
        class AccountRecoveryPrivateKeyPasswordsCollection {
            +filterByForeignModel(string foreignModel)
        }

        class AccountRecoveryPrivateKeyPasswordEntity {
            -uuid props.id
            -uuid props.private_key_id
            -string props.recipient_foreign_model
            -string props.recipient_foreign_key
            -string props.recipient_fingerprint
            -string props.data
            +get id() string
            +get privateKeyId() string
            +get recipientForeignKey() string
            +get data() string
            +get recipientForeignModel() string
            +get recipientFingerprint() string
        }

        class AccountRecoveryUserSettingEntity {
            -uuid props.id
            -uuid props.user_id
            -string props.status
            -string props.created
            -string props.created_by
            -string props.modified
            -string props.modified_by
            -AccountRecoveryPrivateKeyEntity _account_recovery_private_key
            +get status() string
            +get isApproved() boolean
            +get isRejected() boolean
            +get accountRecoveryPrivateKey() accountRecoveryPrivateKey
        }

        class AvatarEntity {
            -uuid props.id
            -string props.created
            -string props.modified
            +get id() string
            +get urlMedium() string
            +get urlSmall() string
            +get created() string
            +get modified() string
        }

        class ExternalGpgKeyEntity {
            -string props.armored_key
            -string props.key_id
            -array props.user_ids
            -string props.fingerprint
            -string props.expires
            -string props.created
            -string props.algorithm
            -number props.length
            -string props.curve
            -boolean props.private
            -boolean props.revoked
            +get armoredKey() string
            +get keyId() string
            +get userIds() array
            +get fingerprint() string
            +get expires() string
            +get isValid() boolean
            +get created() string
            +get algorithm() string
            +get length() number
            +get curve() string
            +get revoked() boolean
            +get private() boolean
            +get isExpired() boolean
        }

        class ExternalGpgKeyPairEntity {
            +get publicKey() ExternalGpgKeyEntity
            +get privateKey() ExternalGpgKeyEntity
        }

        class ExternalGpgKeyEntity {
            -string props.issuer_fingerprint
            -boolean props.is_verified
            -string props.created
            +get issuerFingerprint() string
            +get isVerified() boolean
            +get created() string
        }

        class GpgkeyEntity {
            -uuid props.id
            -uuid props.user_id
            -string props.fingerprint
            -string props.armored_key
            -boolean props.deleted
            -string props.type
            -string props.uid
            -integer props.bits
            -string props.key_created
            -string props.expires
            -string props.created
            -string props.modified
            +get id() string
            +get userId() string
            +get armoredKey() string
            +get fingerprint() boolean
            +get created() string
            +get modified() string
            +get isDeleted() boolean
        }

        class GroupsUsersCollection {
            +getById(string id) GroupUserEntity
            +getGroupUserByUserId(string userId) GroupUserEntity
        }

        class GroupUserEntity {
            -uuid props.id
            -uuid props.user_id
            -uuid props.group_id
            -boolean props.is_admin
            -string props.created
            +get id() string
            +get userId() string
            +get groupId() string
            +get isAdmin() boolean
            +get created() string
            +set id(string id)
        }

        class MetadataKeyEntity {
            -uuid props.id
            -string props.fingerprint
            -string props.armored_key
            -string props.created
            -string props.created_by
            -string props.modified
            -string props.modified_by
            -string props.deleted
            -string props.expired
            +get metadataPrivateKeys() MetadataPrivateKeysCollection
            +get armoredKey() string
            +get id() string
            +get created() string
            +get fingerprint() string
            +get expired() string
            +assertFingerprintPublicAndPrivateKeysMatch() void
        }

        class MetadataKeysCollection {
            +getFirstByLatestCreated() MetadataKeyEntity
            +hasDecryptedKeys() boolean
            +hasEncryptedKeys() boolean
            +assertFingerprintsPublicAndPrivateKeysMatch(): void
        }

        class MetadataPrivateKeyEntity {
            -uuid props.id
            -uuid props.metadata_key_id
            -uuid props.user_id
            -string props.data
            -string|null props.data_signed_by_current_user
            -string props.armored_key
            -string props.created
            -string props.created_by
            -string props.modified
            -string props.modified_by
            +get data() string|MetadataPrivateKeyDataEntity
            +get metadataKeyId() string
            +get isDataSignedByCurrentUser() string|null
            +set armoredKey(string armordKey) void
            +set data(string data) void
            +set isDataSignedByCurrentUser(string|null value) void
            +isDecrypted() boolean
            +get userId() string
        }

        class MetadataPrivateKeyDataEntity {
            -string props.object_type
            -string props.domain
            -string props.fingerprint
            -string props.armored_key
            -string props.passphrase
            +get armoredKey() string
            +get fingerprint() string
        }

        class MetadataPrivateKeysCollection {
            +hasDecryptedPrivateKeys() boolean
            +hasEncryptedPrivateKeys() boolean
        }

        class MetadataTrustedKeyEntity {
            -string props.fingerprint
            -string props.signed
            +get fingerprint() string
            +get signed() string
            +isMetadataKeyTrusted(MetadataPrivateKeyEntity metadataPrivateKey) boolean
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
            -boolean props.allow_v5_v4_downgrade
            -boolean props.allow_v5_v4_downgrade
            +createFromV4Default() MetadataTypesSettingsEntity
            +createFromDefault(?object data) MetadataTypesSettingsEntity
            +get defaultResourceTypes(): string
            +get allowCreationOfV5Resources(): boolean
            +get allowCreationOfV4Resources(): boolean
            +get isDefaultResourceTypeV5(): boolean
            +get isDefaultResourceTypeV4(): boolean
            +get allowV5V4Downgrade(): boolean
            +get allowV4V5Upgrade(): boolean
        }

        class MetadataKeysSettingsEntity {
            -boolean props.allow_usage_of_personal_keys
            -boolean props.zero_knowledge_key_share
            +get allowUsageOfPersonalKeys() boolean
            +get zeroKnowledgeKeyShare() boolean
            +createFromDefault(?object data) MetadataKeysSettingsEntity
        }

        class PendingAccountRecoveryRequestEntity {
            -uuid props.id
            -string props.status
            -string props.created
            -string props.created_by
            -string props.modified
            -string props.modified_by
            +get id() string
            +get status() string
        }

        class ProfileEntity {
            -uuid props.id
            -uuid props.user_id
            -string props.first_name
            -string props.last_name
            -string props.created
            -string props.modified
            -AvatarEntity _avatar
            +get id() string
            +get name() string
            +get firstName() string
            +get lastName() string
            +get userId() string
            +get isActive() boolean
            +get created() string
            +get modified() string
            +get avatar() AvatarEntity
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
            +isMetadataKeyTypeUserKey() boolean
        }

        class ResourcesCollection {
            +filterByDecryptedMetadata() void
            +filterOutByMetadataDecrypted() void
            +filterByResourceTypes(ResourceTypesCollection collection) void
            +filterBySuggestResources(string url) void
            +filterOutMetadataNotEncryptedWithUserKey() void
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

        class RoleEntity {
            -uuid props.id
            -string props.name
            -string props.description
            -string props.created
            -string props.modified
            +get id() string
            +get name() string
            +get description() string
            +get created() string
            +get modified() string
            +get isAdmin() boolean
        }

        class SecretsCollection {
        }

        class SecretEntity {
            +uuid props.id
            +string props.data
            +string props.created
            +string props.created_by
            +string props.modified_by
        }

        class SessionKeysCollection {
        }

        class SessionKeyEntity {
            -string props.foreign_model
            -string foreign_id
            -string session_key
            +get sessionKey() string
        }

        class SessionKeysBundlesCollection {
            +hasDecryptedSessionKeys() boolean
            +sortByModified() void
        }

        class SessionKeysBundleEntity {
            -uuid props.id
            -uuid props.user_id
            -string props.data
            -string props.created
            -string props.modified
            +get data() string|SessionKeysBundleDataEntity
            +set data(string data)
            +isDecrypted() boolean
        }

        class SessionKeysBundleDataEntity {
            -string props.object_type
            -SessionKeysCollection _session_keys
            +get sessionKeys() SessionKeysCollection
            +set sessionKeys(SessionKeysCollection collection)
        }

        class UserEntity {
            -uuid props.id
            -string props.username
            -boolean props.active
            -boolean props.deleted
            -boolean props.disabled
            -string props.created
            -string props.modified
            -string props.last_logged_in
            -boolean props.is_mfa_enabled
            -string props.locale
            -RoleEntity _role
            -ProfileEntity _profile
            -GpgkeyEntity _gpgkey
            -GroupsUsersCollection _groups_users
            -AccountRecoveryUserSettingEntity _account_recovery_user_setting
            -PendingAccountRecoveryRequestEntity _pending_account_recovery_request
            +get id() string
            +get roleId() string
            +get username() string
            +get isActive() boolean
            +get isDeleted() boolean
            +get created() string
            +get modified() string
            +get lastLoggedIn() string
            +get locale() string
            +get profile() ProfileEntity
            +get role() RoleEntity
            +get gpgkey() GpgkeyEntity
            +get groupsUsers() GroupsUsersCollection
            +get accountRecoveryUserSetting() AccountRecoveryUserSettingEntity
            +get pendingAccountRecoveryUserRequest() AccountRecoveryRequestEntity
            +set locale(string locale)
        }

        class UsersCollection {
        }

        class MigrateMetadataEntity {
            -boolean migrate_resources_to_v5
            -boolean migrate_folders_to_v5
            -boolean migrate_tags_to_v5
            -boolean migrate_comments_to_v5
            -boolean migrate_personal_content
        }
    }

    namespace ShareNs {
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Share controllers
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class ShareResourcesController {
            event "passbolt.share.resources.save"
            +exec(array~uuid~ resourcesIds, array~object~ permissionChangesDto) Promise
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Share service
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class ShareResourceService {
            +exec(array~uuid~ resourcesIds, PermissionChangesCollection permissionChanges, string passphrase) Promise
        }

    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %% Share models
    %% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        class ShareService {
            +shareResource(string resourceId, object data) Promise~object~
            +simulateShareResource(string resourceId, array permissions) Promise~object~
        }
    }

%% Resource controllers relationships
    CreateResourceController*--CreateResourceService
%%    CreateResourceController*--GetPassphraseService
    ExportResourcesFileController*--FindResourcesService
    ExportResourcesFileController*--ExportResourcesService
    FindAllIdsByIsSharedWithGroupController*--FindAndUpdateResourcesLocalStorageService
    FindResourcesForShareController*--FindResourcesService
    FindResourceDetailsController*--FindResourcesService
    FindAndUpdateResourcesLocalStorageService*--ResourcesLocalStorageService
%%    ImportResourcesFileController*--GetPassphraseService
    ImportResourcesFileController*--ImportResourcesService
    UpdateAllResourcesLocalStorageController*--FindAndUpdateResourcesLocalStorageService
%%    UpdateResourceController*--GetPassphraseService
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
    ExportResourcesService*--FindResourcesService
    ExportResourcesService*--DecryptMetadataService
    UpdateResourceService*--EncryptMetadataService
    UpdateResourceService*--ResourceService
    UpdateResourceService*--ResourcesLocalStorageService
%% Resource models relationships.
    style ResourceService fill:#DEE5D4
    style ResourcesLocalStorageService fill:#DEE5D4

%% Metadata controllers relationships
%%    CreateMetadataKeyController*--GetPassphraseService
    CreateMetadataKeyController*--CreateMetadataKeyService
    FindAllNonDeletedMetadataKeysController*--FindMetadataKeysService
    GenerateMetadataPrivateKeyController*--GenerateMetadataKeyService
%%    GenerateMetadataPrivateKeyController*--GetPassphraseService
    GetOrFindMetadataTypesSettingsController*--GetOrFindMetadataSettingsService
    SaveMetadataKeysSettingsController*--SaveMetadataSettingsService
    SaveMetadataTypesSettingsController*--SaveMetadataSettingsService
    style CreateMetadataKeyController fill:#D2E0FB
    style FindAllNonDeletedMetadataKeysController fill:#D2E0FB
    style GenerateMetadataPrivateKeyController fill:#D2E0FB
    style GetOrFindMetadataTypesSettingsController fill:#D2E0FB
    style SaveMetadataKeysSettingsController fill:#D2E0FB
    style SaveMetadataTypesSettingsController fill:#D2E0FB
%% Metadata services relationships.
    CreateMetadataKeyService*--EncryptMetadataPrivateKeysService
    CreateMetadataKeyService*--FindUsersService
    CreateMetadataKeyService*--GetOrFindMetadataSettingsService
    CreateMetadataKeyService*--MetadataKeyApiService
    FindMetadataMigrateResourcesService*--MigrateMetadataResourcesApiService
    MigrateMetadataResourcesService*--MigrateMetadataResourcesApiService
    MigrateMetadataResourcesService*--EncryptMetadataService
    MigrateMetadataResourcesService*--ResourceTypeModel
%%    DecryptMetadataPrivateKeysService*--PassphraseStorageService
    DecryptMetadataService*--GetOrFindMetadataKeysService
    DecryptMetadataService*--GetOrFindSessionKeysService
%%    DecryptMetadataService*--PassphraseStorageService
    DecryptMetadataService*--ResourcesLocalStorageService
    DecryptMetadataService*--SaveSessionKeysService
    EncryptMetadataService*--GetOrFindMetadataKeysService
    EncryptMetadataService*--GetOrFindMetadataSettingsService
%%    EncryptMetadataService*--PassphraseStorageService
    FindAndUpdateMetadataKeysSessionStorageService*--FindMetadataKeysService
    FindAndUpdateMetadataKeysSessionStorageService*--MetadataKeysSessionStorageService
    FindAndUpdateMetadataSettingsService*--MetadataKeysSettingsLocalStorage
    FindAndUpdateMetadataSettingsService*--FindMetadataSettingsService
    FindAndUpdateMetadataSettingsService*--MetadataTypesSettingsLocalStorage
    FindMetadataKeysService*--DecryptMetadataPrivateKeysService
    FindMetadataKeysService*--MetadataKeyApiService
    FindMetadataSettingsService*--MetadataKeysSettingsApiService
    FindMetadataSettingsService*--MetadataTypesSettingsApiService
    FindResourcesService*--DecryptMetadataService
    GetOrFindMetadataKeysService*--FindAndUpdateMetadataKeysSessionStorageService
    GetOrFindMetadataKeysService*--MetadataKeysSessionStorageService
    GetOrFindMetadataSettingsService*--FindAndUpdateMetadataSettingsService
    GetOrFindMetadataSettingsService*--MetadataTypesSettingsLocalStorage
    SaveMetadataSettingsService*--MetadataTypesSettingsApiService
    SaveMetadataSettingsService*--MetadataTypesSettingsLocalStorage
    SaveMetadataSettingsService*--MetadataKeysSettingsApiService
    SaveMetadataSettingsService*--MetadataKeysSettingsLocalStorage
%% Metadata models relationships.
    style MetadataKeyApiService fill:#DEE5D4
    style MetadataKeysSettingsLocalStorage fill:#DEE5D4
    style MetadataKeysSessionStorageService fill:#DEE5D4
    style MetadataKeysSettingsApiService fill:#DEE5D4
    style MetadataTypesSettingsApiService fill:#DEE5D4
    style MetadataTypesSettingsLocalStorage fill:#DEE5D4

%% Session keys service relationships
%%    DecryptSessionKeysBundlesService*--PassphraseStorageService
    FindAndUpdateSessionKeysBundlesSessionStorageService*--FindSessionKeysService
    FindAndUpdateSessionKeysBundlesSessionStorageService*--SessionKeysBundlesSessionStorageService
    FindSessionKeysService*--DecryptSessionKeysBundlesService
    FindSessionKeysService*--SessionKeysBundlesApiService
    GetOrFindSessionKeysService*--FindAndUpdateSessionKeysBundlesSessionStorageService
    GetOrFindSessionKeysService*--SessionKeysBundlesSessionStorageService
    SaveSessionKeysService*--EncryptSessionKeysBundlesService
    SaveSessionKeysService*--SessionKeysBundlesApiService
    SaveSessionKeysService*--SessionKeysBundlesSessionStorageService
%% Session keys models relationships.
    style SessionKeysBundlesApiService fill:#DEE5D4
    style SessionKeysBundlesSessionStorageService fill:#DEE5D4

%% User controllers relationships
%% User services relationships.
    FindUsersService*--UserService
%% Resource models relationships.
    style UserService fill:#DEE5D4

%% Entities relationships
    AccountRecoveryPrivateKeyPasswordsCollection*--AccountRecoveryPrivateKeyPasswordEntity
    AccountRecoveryUserSettingEntity*--AccountRecoveryPrivateKeyPasswordsCollection
    GroupsUsersCollection*--GroupUserEntity
    MetadataKeyEntity*--MetadataPrivateKeysCollection
    MetadataKeysCollection*--MetadataKeyEntity
    MetadataPrivateKeysCollection*--MetadataPrivateKeyEntity
    MetadataPrivateKeyEntity*--MetadataPrivateKeyDataEntity
    ProfileEntity*--AvatarEntity
    ResourceEntity*--MetadataKeyEntity
    ResourceEntity*--ResourceTypeEntity
    ResourceEntity*--SecretsCollection
    ResourceTypesCollection*--ResourceTypeEntity
    ResourcesCollection*--ResourceEntity
    SecretsCollection*--SecretEntity
    SessionKeysCollection*--SessionKeyEntity
    SessionKeysBundlesCollection*--SessionKeysBundleEntity
    SessionKeysBundleEntity*--SessionKeysBundleDataEntity
    SessionKeysBundleDataEntity*--SessionKeysCollection
    UsersCollection*--UserEntity
    UserEntity*--AccountRecoveryUserSettingEntity
    UserEntity*--GpgkeyEntity
    UserEntity*--GroupsUsersCollection
    UserEntity*--PendingAccountRecoveryRequestEntity
    UserEntity*--ProfileEntity
    UserEntity*--RoleEntity

%% Auth services relationship.
    style PassphraseStorageService fill:#DEE5D4

%% Share controllers relationships
    ShareResourcesController*--ShareResourceService
    style ShareResourcesController fill:#D2E0FB
%% Share services relationships.
    ShareResourceService*--EncryptMetadataService
    ShareResourceService*--FindAndUpdateResourcesLocalStorageService
    ShareResourceService*--GetOrFindResourcesService
    ShareResourceService*--ResourceService
    ShareResourceService*--ShareService
%% Share models relationships.
    style ShareService fill:#DEE5D4
```
