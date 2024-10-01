Song: https://www.youtube.com/watch?v=tmZ-loZlsyI

Passbolt v4.9.4 is a maintenance update of preparatory work for the incoming v5 and addresses reported issues. Specifically, it cleans the codebase to ease the later encryption of the resource metadata. Plus, it fixes the unexpected resource workspace column resizing and some displayed information.

Thank you to the community for reporting this issue.

## [4.9.4] - 2024-09-30
### Fixed
- PB-33927: Update the label for password expiry email notification
- PB-34743: Fix: folder's sidebar information misses the creator and modifier information
- PB-35351: Fix: Grid columns resizing unexpectedly

### Maintenance
- PB-34313: E2EE WP2 documentation permissions finder class
- PB-34612: As a desktop app I should see the dotnet error message in of http error
- PB-34632: WP2-1.1 Migrate ResourceTypeEntity to EntityV2
- PB-34633: WP2-1.2 Migrate ResourceTypesCollection to EntityV2Collection
- PB-34634: WP2-1.3 Migrate CommentEntity to EntityV2
- PB-34635: WP2-1.4 Migrate CommentsCollection to EntityV2Collection
- PB-34636: WP2-1.5 migrate external resource entity to entity v2
- PB-34637: WP2-1.6 migrate external resources collection to entity v2 collection
- PB-34638: WP2-1.7 migrate external folder entity to entity v2
- PB-34639: WP2-1.8 migrate external folders collection to entity v2 collection
- PB-34640: WP2-1.9 Migrate ExportResourcesFileEntity to EntityV2
- PB-34641: WP2-1.10 Migrate PermissionTransferEntity to EntityV2
- PB-34642: WP2-1.11 Migrate PermissionTransfersCollection to EntityV2Collection
- PB-34643: WP2-1.12 Migrate GroupDeleteTransferEntity to EntityV2
- PB-34644: WP2-1.14 Migrate GroupUserTransfersCollection to EntityV2Collection
- PB-34645: WP2-1.15 Migrate UserDeleteTransferEntity to EntityV2
- PB-34646: WP2-1.13 Migrate GroupUserTransferEntity to EntityV2
- PB-34647: WP2-1.16 Migrate NeededSecretEntity to EntityV2
- PB-34648: WP2-1.17 Migrate NeededSecretsCollection to EntityV2Collection
- PB-34649: WP2-1.18 Migrate SecretEntity to EntityV2
- PB-34650: WP2-1.19 Migrate SecretsCollection to EntityV2Collection
- PB-34651: WP2-1.20 Migrate GroupUpdateDryRunResultEntity to EntityV2
- PB-34656: WP2-1.25 Migrate ImportResourcesFileEntity to EntityV2
- PB-34657: WP2-1.26 Migrate PlaintextEntity to EntityV2
- PB-34658: WP2-1.27 Migrate TotpEntity to EntityV2
- PB-34747: WP2-1.28 Remove not used sanitizeDto from GroupsUsersCollection
- PB-35124: Migrate 'gte' and 'lte' props of schemas to 'minimum' and 'maximum'
- PB-35125: WP2-2.6 Find resource permissions by requesting dedicated API permissions entry point
- PB-35128: WP2-2.1 unnecessary quick a api call when displaying home page
- PB-35161: WP2-2.2 unnecessary quick a api call for filtering resources: filter by favourite
- PB-35170: WP2-2.5 unnecessary quick a api call for filtering resources: filter by tags
- PB-35172: WP2-2.7 Find folder permissions by requesting dedicated API permissions entry point
- PB-35174: WP2-4.1 Migrate Webapp resource create form in view model
- PB-35175: WP2-4.2 Migrate Webapp resource edit form in view model
- PB-35177: WP2-4.3 Migrate Quickaccess resource create form in view model
- PB-35178: WP2-4.4 Migrate Quickaccess resource auto-save form in view model
- PB-35179: WP2-4.5 Migrate Webapp edit description from sidebar form in view model ?
- PB-35180: WP2-2.8 Copy/preview password/totp should find single secret by requesting dedicated API secrets entry point
- PB-35182: WP2-3.1 Migrate the resource types event 'passbolt.resource-type.get-all' into a controller
- PB-35233: WP2-5.1 PlainText entity schema should be provided by the browser extension
- PB-35253: WP2-3.2 Migrate resource update controller logic into service
- PB-35255: WP2-3.3 Migrate resource “update-local-storage” event logic to a dedicated controller
- PB-35256: WP2-5.2 Unit test performance of new collection v2 and ensure no regression is introduced
- PB-35261: WP2-2.10 Shift resources & folders and update local storage debounce...
- PB-35261: WP2-2.10 Decouple logic of update local storage, find all and get or find all in order to prepare for resource with encrypted metadata
- PB-35323: Ensure resource test factory does not contain any metadata at the root of the resource
- PB-35338: WP2-2.11 Folders update local storage should handle threshold period to limit the number of API request
- PB-35339: Review resource update service test
- PB-35340: WP2-2.12 drop resources collection sanitise dto
- PB-35341: WP2-2.13 Migrate findAll from ResourceModel into FindResourceService
- PB-35342: WP2-2.14 Leverage local storage when filtering resources by group
- PB-35344: WP2-2.15 Migrate findSuggestedResources from resource model to...
- PB-35345: WP2-2.16 Migrate findAllForShare from resource api service to FindResources service
- PB-35346: WP2-2.17 migrate find all for decrypt from resource api service to find resources service
- PB-35348: WP2-2.18 Migrate findById to the FindResourcesService
- PB-35359: WP3 Class diagram of resources types local storage HOC
- PB-35359: WP3 Update resource class diagram to support resource edit with v5
- PB-35359: Technical specifications: WP3 support v5 resource types with v4 UI
- PB-35414: WP2-2.16 Create ExecuteConcurrentlyService to perform query in parallel

### Security
- PB-35129: Upgrade vulnerable library webpack
- PB-35354: Upgrade vulnerable library path-to-regexp
