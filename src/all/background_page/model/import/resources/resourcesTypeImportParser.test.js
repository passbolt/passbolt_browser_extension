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

import {
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
  RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
  RESOURCE_TYPE_TOTP_SLUG,
  RESOURCE_TYPE_V5_DEFAULT_SLUG,
  RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG,
  RESOURCE_TYPE_V5_TOTP_SLUG,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import ResourcesTypeImportParser from "./resourcesTypeImportParser";
import {
  resourceTypesCollectionDto,
  resourceTypesCollectionWithoutPassword,
  resourceTypesCollectionWithoutTOTP,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import { defaultExternalResourceImportMinimalDto } from "../../entity/resource/external/externalResourceEntity.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {
  defaultMetadataTypesSettingsV4Dto,
  defaultMetadataTypesSettingsV50FreshDto,
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import { defaultTotpDto } from "../../entity/totp/totpDto.test.data";
import {
  resourceTypeTotpDto,
  resourceTypeV5TotpDto,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";

describe("ResourcesTypeImportParser", () => {
  describe("External resource dto with password field", () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      secret_clear: "Password",
    });

    describe.each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      },
    ])("should return password-description", (test) => {
      it(`${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });
    describe.each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      },
    ])("should return v5-default", (test) => {
      it(`${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());
        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);

        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === RESOURCE_TYPE_V5_DEFAULT_SLUG,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });
    describe.each([
      {
        scenario: "should fallback to default when Password is disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()),
      },
      {
        scenario: "should fallback to default when Password is disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto()),
      },
    ])("No resource type found scenario", (test) => {
      it(`${test.scenario}`, () => {
        expect.assertions(3);
        const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionWithoutPassword());
        resourceTypesCollection.filterByResourceTypeVersion(test.metadataTypesSettings.defaultResourceTypes);

        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, resourceTypesCollection);
        let resourceType = ResourcesTypeImportParser.findMatchingResourceType(resourceTypesCollection, scores);
        // expect findMatchingResourceType to return nothing
        expect(resourceType).toBeUndefined();
        resourceType = ResourcesTypeImportParser.findPartialResourceType(resourceTypesCollection, scores);
        // expect findPartialResourceType to return nothing
        expect(resourceType).toBeUndefined();

        expect(() =>
          ResourcesTypeImportParser.fallbackDefaulResourceType(resourceTypesCollection, test.metadataTypesSettings),
        ).toThrow("No resource type associated to this row.");
      });
    });
  });

  describe(`External resource dto with password and notes fields`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      secret_clear: "Password",
      unknown_prop: "Description",
    });

    describe.each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      },
    ])("should return password-description", (test) => {
      it(`${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });
    describe.each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with totp disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP()),
      },
    ])("should return v5-default", (test) => {
      it(`${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === RESOURCE_TYPE_V5_DEFAULT_SLUG,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });
    describe.each([
      {
        scenario: "should fallback to default when Password is disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()),
      },
      {
        scenario: "should fallback to default when Password is disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto()),
      },
    ])("No resource type found scenario", (test) => {
      it(`${test.scenario}`, () => {
        expect.assertions(3);
        const resourceTypesCollection = new ResourceTypesCollection([resourceTypeTotpDto(), resourceTypeV5TotpDto()]);
        resourceTypesCollection.filterByResourceTypeVersion(test.metadataTypesSettings.defaultResourceTypes);

        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, resourceTypesCollection);
        let resourceType = ResourcesTypeImportParser.findMatchingResourceType(resourceTypesCollection, scores);
        // expect findMatchingResourceType to return nothing
        expect(resourceType).toBeUndefined();
        resourceType = ResourcesTypeImportParser.findPartialResourceType(resourceTypesCollection, scores);
        // expect findPartialResourceType to return nothing
        expect(resourceType).toBeUndefined();

        expect(() =>
          ResourcesTypeImportParser.fallbackDefaulResourceType(resourceTypesCollection, test.metadataTypesSettings),
        ).toThrow("No resource type associated to this row.");
      });
    });
  });

  describe(`External resource dto with totp field`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      totp: defaultTotpDto(),
    });

    describe.each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      },
    ])("should return password-description", (test) => {
      it(`${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === RESOURCE_TYPE_TOTP_SLUG,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    describe.each([
      {
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      },
    ])("should return v5-totp-standalone", (test) => {
      it(`${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);

        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === RESOURCE_TYPE_V5_TOTP_SLUG,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    describe.each([
      {
        scenario: "should fallback to default when totp is disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()),
        fallbackDefault: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
      },
      {
        scenario: "should fallback to default when totp is disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto()),
        fallbackDefault: RESOURCE_TYPE_V5_DEFAULT_SLUG,
      },
    ])("No resource type found scenario", (test) => {
      it(`${test.scenario}`, () => {
        expect.assertions(3);

        const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionWithoutTOTP());
        resourceTypesCollection.filterByResourceTypeVersion(test.metadataTypesSettings.defaultResourceTypes);

        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, resourceTypesCollection);
        let resourceType = ResourcesTypeImportParser.findMatchingResourceType(resourceTypesCollection, scores);
        // expect findMatchingResourceType to return nothing
        expect(resourceType).toBeUndefined();
        resourceType = ResourcesTypeImportParser.findPartialResourceType(resourceTypesCollection, scores);
        // expect findPartialResourceType to return nothing
        expect(resourceType).toBeUndefined();

        resourceType = ResourcesTypeImportParser.fallbackDefaulResourceType(
          resourceTypesCollection,
          test.metadataTypesSettings,
        );
        const expectedResourceType = resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === test.fallbackDefault,
        );

        //Expect fallback to be applied
        expect(resourceType).toEqual(expectedResourceType);
      });
    });
  });

  describe(`External resource dto with password and totp fields`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      totp: defaultTotpDto(),
      secret_clear: "Password",
    });
    describe.each([
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
      },
    ])("V4 default resource type", (test) => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === test.resourceType,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    describe.each([
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
      },
    ])("V5 default resource type", (test) => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === test.resourceType,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    describe.each([
      {
        scenario: "should match with nothing when totp and password are disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()),
      },
      {
        scenario: "should match with nothing when totp and password are disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto()),
      },
    ])("No resource type found scenario", (test) => {
      it(`${test.scenario}`, () => {
        expect.assertions(3);

        const resourceTypesCollection = new ResourceTypesCollection([]);
        resourceTypesCollection.filterByResourceTypeVersion(test.metadataTypesSettings.defaultResourceTypes);

        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, resourceTypesCollection);
        let resourceType = ResourcesTypeImportParser.findMatchingResourceType(resourceTypesCollection, scores);
        // expect findMatchingResourceType to return nothing
        expect(resourceType).toBeUndefined();
        resourceType = ResourcesTypeImportParser.findPartialResourceType(resourceTypesCollection, scores);
        // expect findPartialResourceType to return nothing
        expect(resourceType).toBeUndefined();
        expect(() =>
          ResourcesTypeImportParser.fallbackDefaulResourceType(resourceTypesCollection, test.metadataTypesSettings),
        ).toThrow("No resource type associated to this row.");
      });
    });
  });

  describe(`External resource dto with password, notes, totp field`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      totp: defaultTotpDto(),
      description: "Description",
      secret_clear: "Password",
    });
    describe.each([
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
      },
    ])("V4 default resource type", (test) => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === test.resourceType,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    describe.each([
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
      },
    ])("V5 default resource type", (test) => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === test.resourceType,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    describe.each([
      {
        scenario: "should match with nothing when totp and password are disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()),
      },
      {
        scenario: "should match with nothing when totp and password are disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto()),
      },
    ])("No resource type found scenario", (test) => {
      it(`${test.scenario}`, () => {
        expect.assertions(3);

        const resourceTypesCollection = new ResourceTypesCollection([]);
        resourceTypesCollection.filterByResourceTypeVersion(test.metadataTypesSettings.defaultResourceTypes);

        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, resourceTypesCollection);
        let resourceType = ResourcesTypeImportParser.findMatchingResourceType(resourceTypesCollection, scores);
        // expect findMatchingResourceType to return nothing
        expect(resourceType).toBeUndefined();
        resourceType = ResourcesTypeImportParser.findPartialResourceType(resourceTypesCollection, scores);
        // expect findPartialResourceType to return nothing
        expect(resourceType).toBeUndefined();

        expect(() =>
          ResourcesTypeImportParser.fallbackDefaulResourceType(resourceTypesCollection, test.metadataTypesSettings),
        ).toThrow("No resource type associated to this row.");
      });
    });
  });

  describe(`External resource dto with notes and totp fields`, () => {
    const externalResourceDto = defaultExternalResourceImportMinimalDto({
      totp: defaultTotpDto(),
      description: "Description",
    });
    describe.each([
      {
        resourceType: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        resourceType: RESOURCE_TYPE_TOTP_SLUG,
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      },
    ])("V4 default resource type", (test) => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === test.resourceType,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    describe.each([
      {
        resourceType: RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG,
        scenario: "with all resource collection types",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionDto()),
      },
      {
        resourceType: RESOURCE_TYPE_V5_TOTP_SLUG,
        scenario: "with password disabled",
        resourceTypesCollection: new ResourceTypesCollection(resourceTypesCollectionWithoutPassword()),
      },
    ])("V5 default resource type", (test) => {
      it(`should return ${test.resourceType} ${test.scenario}`, () => {
        const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

        test.resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, test.resourceTypesCollection);
        const resourceType = ResourcesTypeImportParser.findMatchingResourceType(test.resourceTypesCollection, scores);
        const expectedResourceType = test.resourceTypesCollection.items.find(
          (resourceType) => resourceType.slug === test.resourceType,
        );

        expect(resourceType).toEqual(expectedResourceType);
      });
    });

    describe.each([
      {
        scenario: "should match with nothing when totp and password are disabled on v4",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()),
      },
      {
        scenario: "should match with nothing when totp and password are disabled on v5",
        metadataTypesSettings: new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto()),
      },
    ])("No resource type found scenario", (test) => {
      it(`${test.scenario}`, () => {
        expect.assertions(3);

        const resourceTypesCollection = new ResourceTypesCollection([]);
        resourceTypesCollection.filterByResourceTypeVersion(test.metadataTypesSettings.defaultResourceTypes);

        const scores = ResourcesTypeImportParser.getScores(externalResourceDto, resourceTypesCollection);
        let resourceType = ResourcesTypeImportParser.findMatchingResourceType(resourceTypesCollection, scores);
        // expect findMatchingResourceType to return nothing
        expect(resourceType).toBeUndefined();
        resourceType = ResourcesTypeImportParser.findPartialResourceType(resourceTypesCollection, scores);
        // expect findPartialResourceType to return nothing
        expect(resourceType).toBeUndefined();

        expect(() =>
          ResourcesTypeImportParser.fallbackDefaulResourceType(resourceTypesCollection, test.metadataTypesSettings),
        ).toThrow("No resource type associated to this row.");
      });
    });
  });
});
