Passbolt 5.12.0 is a release that provides a new content-type for PIN codes. On its side, Safari is out of beta.
This release comes also with TOTP fields detection improvment

### Added
- PB-51015 Add PIN code resource type in resourceTypeSchemasDefinition
- PB-51016 Handle PIN code in resourceTypeEntity
- PB-51017 Handle PIN code in resourceTypesCollection
- PB-51019 PINCODE - 1.5 Create secretDataV5StandalonePinCodeEntity  and add...
- PB-51020 PINCODE - 1.6 Add pin code to ResourceEditCreateFormEnumerationTypes
- PB-51023 Update resourceTypesFormEntity to handle the new pin code resource type
- PB-51046 PINCODE - 3.2 Adapt ExternalResourceEntity to handle the pin code resource type schema
- PB-51047 PINCODE - 3.3 Adapt ExportResourcesService to handle the mapping of pin code
- PB-51048 PINCODE - 3.4 Adapt resourcesKdbxImportParser and to map pin code in case it exist to the correct resource types
- PB-51049 Add PIN code icon to passboltDefaultResourceTypeIcons.data
- PB-51050 Update DisplayContentTypesAllowedContentTypesAdministration to handle PIN code
- PB-51051 Add the pin code resource type to DisplayResourceCreationMenu
- PB-51052 Add PIN code in SelectResourceForm
- PB-51053 Create the new pin code resource type form
- PB-51054 Adapt OrchestrateResourceForm to handle the new AddResourcePinCode
- PB-51055 Create the new DisplayResourceDetailsPinCode to display the pin code into detail
- PB-51056 PINCODE - 3.5 Adapt resourcesKdbxExporter and to map pin code in case it exist to the correct resource types
- PB-51073 PINCODE - 2.8 Add pin code into the grid
- PB-51201 Fix notes-related issues
- PB-51246 Add pin code to workspace create menu

### Fixed
- PB-49888 The contents of Resource Creation Progress Dialog always shows Creating Password
- PB-50166 Fix break vs continue bug in MoveResourcesService batch permission calculation
- PB-50535 DisplayuserbadgeMenu should display attention required on page served by API if MFA is required
- PB-50617 Add PingOne redirect URL field
- PB-50945 Fix expired session when port is disconnected
- PB-51012 Hide 'set expired' option for already expired resources
- PB-51018 Tighten fields selectors to avoid false positives
- PB-51077 Fix typo "susccessfully" to "successfully"

### Security
- PB-50623 Fix GHSA-2328-f5f3-gj25 (HIGH)
- PB-50877 Fix undici GHSA-f269-vfmq-vjvj - MEDIUM CVSS3.1
- PB-50906 Fix svgo GHSA-xpqw-6gx7-v673 - HIGH CVSS3.1
- PB-50907 Fix flatted GHSA-rf6f-7fwh-wjgh - HIGH CVSS4.0
- PB-50908 Fix @xmldom/xmldom GHSA-wh4c-j3r5-mjhp - HIGH CVSS3.1
- PB-50920 Upgrade webpack-cli
- PB-50921 Upgrade web-ext
- PB-51060 Fix protocol-buffers-schema GHSA-j452-xhg8-qg39 - MEDIUM CVSS3.1
- PB-51151 Fix i18next-http-backend GHSA-r5fr-rjxr-66jc - MEDIUM CVSS3.1
- PB-51152 Fix uuid GHSA-w5hq-g745-h8pq - MEDIUM CVSS3.1
- PB-51170 Fix @xmldom/xmldom GHSA-2v35-w6hq-6mfw - HIGH CVSS4.0
- PB-51179 Investigate and/or enforce package cool down mechanism with safe-chain or npm or both

### Maintenance
- PB-50224 Add devcontainer to bext
- PB-50301 removed GitLab CI definition as it's been moved to the ci-definitions repo
- PB-50340 Small upgrade for picomatch (Medium)
- PB-51086 keep notify expired session tests skipping