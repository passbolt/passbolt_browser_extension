/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.10.0
 */

import {RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG, RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG, RESOURCE_TYPE_TOTP_SLUG, RESOURCE_TYPE_V5_DEFAULT_SLUG, RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG, RESOURCE_TYPE_V5_TOTP_SLUG} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import ResourcesTypeImportParser from "./resourcesTypeImportParser";
import {resourceTypesCollectionDto, resourceTypesCollectionWithoutPassword, resourceTypesCollectionWithoutTOTP} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {defaultExternalResourceImportMinimalDto} from "../../entity/resource/external/externalResourceEntity.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {defaultMetadataTypesSettingsV4Dto, defaultMetadataTypesSettingsV50FreshDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import each from "jest-each";
import {defaultTotpDto} from "../../entity/totp/totpDto.test.data";

describe("ResourcesTypeImportParser", () => {
  describe("External resource dto with password field", () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      secret_clear: "Password"
    });

    each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      }
    ]).describe("should return password-description", test => {
      it(`${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, test.resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = test.resourceTypesCollection.items.find(resourceType => resourceType.slug === RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });
    each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      }
    ]).describe("should return v5-default", test => {
      it(`${test.scenario}`, () => {
        const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = resourceTypesCollection.items.find(resourceType => resourceType.slug === RESOURCE_TYPE_V5_DEFAULT_SLUG);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });
    each([
      {
        scenario: "should throw an exception when Password is disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto())
      },
      {
        scenario: "should throw an exception when Password is disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto())
      }
    ]).describe("Error cases", test => {
      it(`${test.scenario}`, () => {
        const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionWithoutPassword());

        try {
          ResourcesTypeImportParser.parseResourceType(externalResourceDto, resourceTypesCollection, test.metadataTypesSettings);
        } catch (error) {
          expect(error).toEqual(new Error("No resource type associated to this row."));
        }
      });
    });
  });

  describe(`External resource dto with password and notes fields`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      secret_clear: "Password",
      description: "Description"
    });

    each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      }
    ]).describe("should return password-description", test => {
      it(`${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, test.resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = test.resourceTypesCollection.items.find(resourceType => resourceType.slug === RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });
    each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      }
    ]).describe("should return v5-default", test => {
      it(`${test.scenario}`, () => {
        const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = resourceTypesCollection.items.find(resourceType => resourceType.slug === RESOURCE_TYPE_V5_DEFAULT_SLUG);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });
    each([
      {
        scenario: "should throw an exception when Password is disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto())
      },
      {
        scenario: "should throw an exception when Password is disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto())
      }
    ]).describe("Error cases", test => {
      it(`${test.scenario}`, () => {
        const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionWithoutPassword());

        try {
          ResourcesTypeImportParser.parseResourceType(externalResourceDto, resourceTypesCollection, test.metadataTypesSettings);
        } catch (error) {
          expect(error).toEqual(new Error("No resource type associated to this row."));
        }
      });
    });
  });

  describe(`External resource dto with totp field`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      totp: defaultTotpDto()
    });

    each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      }
    ]).describe("should return password-description", test => {
      it(`${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, test.resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = test.resourceTypesCollection.items.find(resourceType => resourceType.slug === RESOURCE_TYPE_TOTP_SLUG);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      }
    ]).describe("should return v5-totp-standalone", test => {
      it(`${test.scenario}`, () => {
        const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = resourceTypesCollection.items.find(resourceType => resourceType.slug === RESOURCE_TYPE_V5_TOTP_SLUG);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    each([
      {
        scenario: "should throw an exception when totp is disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto())
      },
      {
        scenario: "should throw an exception when totp is disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto())
      }
    ]).describe("Error cases", test => {
      it(`${test.scenario}`, () => {
        const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP());

        try {
          ResourcesTypeImportParser.parseResourceType(externalResourceDto, resourceTypesCollection, test.metadataTypesSettings);
        } catch (error) {
          expect(error).toEqual(new Error("No resource type associated to this row."));
        }
      });
    });
  });

  describe(`External resource dto with password and totp fields`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      totp: defaultTotpDto(),
      secret_clear: "Password"
    });
    each([
      {
        resourceType: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      },
      {
        resourceType: RESOURCE_TYPE_TOTP_SLUG,
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      }
    ]).describe("V4 default resource type", test => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, test.resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = test.resourceTypesCollection.items.find(resourceType => resourceType.slug === test.resourceType);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    each([
      {
        resourceType: RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG,
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG,
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      },
      {
        resourceType: RESOURCE_TYPE_V5_TOTP_SLUG,
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      }
    ]).describe("V5 default resource type", test => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, test.resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = test.resourceTypesCollection.items.find(resourceType => resourceType.slug === test.resourceType);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    each([
      {
        scenario: "should throw an exception when totp and password are disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto())
      },
      {
        scenario: "should throw an exception when totp and password are disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto())
      },
    ]).describe("Error cases", test => {
      it(`${test.scenario}`, () => {
        const resourceTypesCollection = new ResourceTypesCollection([]);

        try {
          ResourcesTypeImportParser.parseResourceType(externalResourceDto, resourceTypesCollection, test.metadataTypesSettings);
        } catch (error) {
          expect(error).toEqual(new Error("No resource type associated to this row."));
        }
      });
    });
  });

  describe(`External resource dto with password, notes, totp field`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      totp: defaultTotpDto(),
      description: "Description",
      secret_clear: "Password"
    });
    each([
      {
        resourceType: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      },
      {
        resourceType: RESOURCE_TYPE_TOTP_SLUG,
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      }
    ]).describe("V4 default resource type", test => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, test.resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = test.resourceTypesCollection.items.find(resourceType => resourceType.slug === test.resourceType);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    each([
      {
        resourceType: RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG,
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG,
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      },
      {
        resourceType: RESOURCE_TYPE_V5_TOTP_SLUG,
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      }
    ]).describe("V5 default resource type", test => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, test.resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = test.resourceTypesCollection.items.find(resourceType => resourceType.slug === test.resourceType);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    each([
      {
        scenario: "should throw an exception when totp and password are disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto())
      },
      {
        scenario: "should throw an exception when totp and password are disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto())
      },
    ]).describe("Error cases", test => {
      it(`${test.scenario}`, () => {
        const resourceTypesCollection = new ResourceTypesCollection([]);

        try {
          ResourcesTypeImportParser.parseResourceType(externalResourceDto, resourceTypesCollection, test.metadataTypesSettings);
        } catch (error) {
          expect(error).toEqual(new Error("No resource type associated to this row."));
        }
      });
    });
  });

  describe(`External resource dto with notes and totp fields`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      totp: defaultTotpDto(),
      description: "Description"
    });
    each([
      {
        resourceType: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        resourceType: RESOURCE_TYPE_TOTP_SLUG,
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      }
    ]).describe("V4 default resource type", test => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, test.resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = test.resourceTypesCollection.items.find(resourceType => resourceType.slug === test.resourceType);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    each([
      {
        resourceType: RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG,
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        resourceType: RESOURCE_TYPE_V5_TOTP_SLUG,
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      }
    ]).describe("V5 default resource type", test => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        const resourceType = ResourcesTypeImportParser.parseResourceType(externalResourceDto, test.resourceTypesCollection, metadataTypesSettings);
        const expectedResourceType = test.resourceTypesCollection.items.find(resourceType => resourceType.slug === test.resourceType);

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    each([
      {
        scenario: "should throw an exception when totp is disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto())
      },
      {
        scenario: "should throw an exception when totp is disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto())
      },
    ]).describe("Error cases", test => {
      it(`${test.scenario}`, () => {
        const resourceTypesCollection = new ResourceTypesCollection([]);

        try {
          ResourcesTypeImportParser.parseResourceType(externalResourceDto, resourceTypesCollection, test.metadataTypesSettings);
        } catch (error) {
          expect(error).toEqual(new Error("No resource type associated to this row."));
        }
      });
    });
  });
});
