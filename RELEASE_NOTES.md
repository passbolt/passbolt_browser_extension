Song: https://www.youtube.com/watch?v=pBZs_Py-1_0

Passbolt v4.12.0 introduces the final update in the version 4 series. This release completes the groundwork for version 5 and allows integrators to test the migration directly from the UI ahead of the stable release.

As always, this version also addresses community-reported issues, including fixes for UI inconsistencies and multi-selection shortcuts that were not working across all environments.

As a final update of the v4 series, system administrators are invited to upgrade their version of PHP to meet Passbolt v5’s minimum requirements: PHP 8.2. We posted a guide in our Weblog to help you with the process: [Preparing for Passbolt v5: PHP 8.2 Requirement](https://www.passbolt.com/blog/preparing-for-passbolt-v5-php-8-2-requirement).

Thank you to the community for your feedback and patience—we’re almost there!


### Added
PB-38932 WP6-3.1 Implement navigation to content types migrate metadata content administration page
PB-38915 WP6-3.2 Implement findUpgradeContentDetails function on MetadataMigrateContentServiceWorkerService to retrieve content to upgrade details in the content types migrate metadata administration page
PB-38916 WP6-3.3 Implements MigrateMetadataSettingsFormEntity to handle form data
PB-38917 WP6-3.4 As an administrator I can see the migrate metadata settings form
PB-38918 WP6-3.5 Implements MigrateMetadataResourcesService to migrate metadata resources
PB-38919 WP6-3.6 Implements PassboltResponseEntities to handle passbolt API response
PB-38921 WP6-3.7 Implements MigrateMetadataResourcesController to run metadata migration from the styleguide
PB-38923 WP6-3.8 Implements ConfirmMigrateMetadataDialog to warn admin before actually running the migration
PB-38925 WP6-3.10 Implements MigrateMetadataSettingsActionBar to trigger migration process
PB-38996 WP6-4.1 Update ResourceTypeEntity to handle the new 'deleted' field
PB-38998 WP6-4.3 Implements findAllByDeletedAndNonDeleted on FindResourceTypesService  to retrieve all deleted and non deleted resources-types
PB-38999 WP6-4.4 Implements FindAllByDeletedAndNonDeletedResourceTypesContoller to find all available and deleted resources-types
PB-39000 WP6-4.5 Implements ResourceTypesServiceWorkerService to request the service worker for retrieving the resource types
PB-39001 WP6-4.6 Implements ResourceTypesFormEntity to handle the data from the form component
PB-39002 WP6-4.7 Implements navigation to allow content types administration page
PB-39003 WP6-4.8 Implements DisplayContentTypesAllowedContentTypesAdministration component to display the administration form
PB-39004 WP6-4.9 Implements ResourceTypesApiService undelete method to process the undelete of the given resources type
PB-39005 WP6-4.10 Implements ResourceTypesService delete method to request the API for deleted the given resource type
PB-39006 WP6-4.11 Implements UpdateResourceTypesService undelete method to process the update of the given resources types
PB-39009 WP6-4.14 Implements UpdateAllResourceTypesDeletedStatusController to update all  resource types deleted status
PB-39010 WP6-4.15 Implements ResourceTypesServiceWorkerService update and delete method to communication with the service worker
PB-39011 WP5-4.16 Add to DisplayResourceTypes a "Save" button to trigger the update process of the allowed resource types

### Fixed
PB-38763 Using V5 format, exporting resources now set all the fields properly
PB-39388 Edition and creation of resources now export object_type in metadata properly
PB-39084 When selecting multiple resources, the OS is detected and the right shortcut is used