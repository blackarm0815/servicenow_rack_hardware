interface Hardware {
  assetTag: null | string;
  ciName: null | string;
  ciSysId: null | string;
  hardwareSkuSysId: null | string;
  lastPhysicalAudit: null | string;
  location: null | string;
  modelCategoryName: null | string;
  modelSysId: null | string;
  parent: null | string;
  provisioningBudgetCodeSysId: null | string;
  rackPosition: null | number;
  rackSysId: string;
  rackU: null | number;
  serialNumber: null | string;
  slot: null | number;
  state: null | string;
  substate: null | string;
}
interface Model {
  deviceCategory: null | string;
  displayName: null | string;
  endOfFirmwareSupportDate: null | string;
  endOfLife: null | string;
  endOfSale: null | string;
  maxChildren: null | number;
  modelHeight: null | number;
  modelName: null | string;
}
interface Rack {
  rackHeight: null | number;
  rackName: null | string;
}
interface RackHardwareSortResult {
  ciSysIdUnique: Record<string, boolean>;
  collisionHardware: Record<string, boolean>;
  hardwareData: Record<string, Hardware>;
  hardwareSysIdUnique: Record<string, boolean>;
  modelData: Record<string, Model>;
  modelSysIdUnique: Record<string, boolean>;
  rackData: Record<string, Rack>;
  rackHardwareBadData: Record<string, Record<string, boolean>>;
  rackHardwareChassisNetwork: Record<string, Record<string, boolean>>;
  rackHardwareChassisSled: Record<string, Record<string, boolean>>;
  rackHardwarePdu: Record<string, Record<string, boolean>>;
  rackHardwareRackMounted: Record<string, Record<string, boolean>>;
  rackHardwareResult: Record<string, Array<string>>;
  rackNameSysId: Record<string, string>;
  rackSysIdName: Record<string, string>;
  skuSysIdUnique: Record<string, boolean>;
  usageUnits: Record<string, Record<string, Record<string, string>>>;
}
const redbeardRackHardwareSort = (
  rackSysIdArray: Array<string>,
) => {
  const checkInteger = (
    testVariable: any,
  ) => {
    if (typeof testVariable === 'string') {
      if (!Number.isNaN(parseInt(testVariable, 10))) {
        return parseInt(testVariable, 10);
      }
    }
    return null;
  };
  const checkString = (
    testVariable: any,
  ) => {
    if (typeof testVariable === 'string') {
      if (testVariable !== '') {
        return testVariable;
      }
    }
    return null;
  };
  const testValidChassisNetwork = (
    hardwareData: Record<string, Hardware>,
    hardware: Hardware,
  ) => {
    if (hardware.parent === null) {
      return {
        pass: false,
        testReport: 'not valid network gear - no parent',
      };
    }
    if (!Object.prototype.hasOwnProperty.call(hardwareData, hardware.parent)) {
      return {
        pass: false,
        testReport: 'not valid network gear - parent not found in hardwareData',
      };
    }
    if (hardwareData[hardware.parent].rackSysId !== hardware.rackSysId) {
      return {
        pass: false,
        testReport: 'not valid network gear - parent not in the same rack',
      };
    }
    if (hardware.modelCategoryName !== 'Network Gear') {
      return {
        pass: false,
        testReport: 'not valid network gear - model category is not network gear',
      };
    }
    return {
      pass: true,
      testReport: 'is valid network gear',
    };
  };
  const testValidRackMounted = (
    hardware: Hardware,
    modelData: Record<string, Model>,
  ) => {
    if (hardware.parent !== null) {
      return {
        pass: false,
        testReport: 'not a valid rack mounted - has a parent',
      };
    }
    if (hardware.rackU === null) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - u_rack_u is missing',
      };
    }
    if (hardware.rackU === 0) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - u_rack_u is zero',
      };
    }
    if (hardware.modelSysId === null) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - does not have a model',
      };
    }
    if (!Object.prototype.hasOwnProperty.call(modelData, hardware.modelSysId)) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - model not found',
      };
    }
    if (modelData[hardware.modelSysId].modelHeight === null) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - model height is missing',
      };
    }
    if (modelData[hardware.modelSysId].modelHeight === 0) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - model height is zero',
      };
    }
    return {
      pass: true,
      testReport: 'is a valid rack mounted',
    };
  };
  const testValidChassisSled = (
    hardwareData: Record<string, Hardware>,
    hardwareSysId: string,
  ) => {
    const parentSysId = hardwareData[hardwareSysId].parent;
    if (hardwareData[hardwareSysId].slot === null) {
      return {
        pass: false,
        testReport: 'not a valid sled - slot missing',
      };
    }
    if (hardwareData[hardwareSysId].slot === 0) {
      return {
        pass: false,
        testReport: 'not a valid sled - slot is zero',
      };
    }
    if (parentSysId === null) {
      return {
        pass: false,
        testReport: 'not a valid sled - parent missing',
      };
    }
    if (parentSysId !== null && !Object.prototype.hasOwnProperty.call(hardwareData, parentSysId)) {
      return {
        pass: false,
        testReport: 'not a valid sled - parent not found in hardwareData',
      };
    }
    if (parentSysId !== null && hardwareData[parentSysId].rackSysId !== hardwareData[hardwareSysId].rackSysId) {
      return {
        pass: false,
        testReport: 'not a valid sled - parent not in same rack',
      };
    }
    return {
      pass: true,
      testReport: 'is a valid sled',
    };
  };
  const testValidPdu = (
    hardware: Hardware,
  ) => {
    if (hardware.modelCategoryName !== 'PDU') {
      return {
        pass: false,
        testReport: 'not a valid pdu - hardware.modelCategoryName is not PDU',
      };
    }
    return {
      pass: true,
      testReport: 'is a valid pdu',
    };
  };
  const testValidRack = (
    hardware: Hardware,
    modelData: Record<string, Model>,
  ) => {
    if (hardware.modelSysId !== null) {
      if (Object.prototype.hasOwnProperty.call(modelData, hardware.modelSysId)) {
        if (modelData[hardware.modelSysId].deviceCategory === 'Rack') {
          return {
            pass: true,
            testReport: 'is a valid rack',
          };
        }
      }
    }
    return {
      pass: false,
      testReport: 'not a valid rack - model deviceCategory is not Rack',
    };
  };
  const calculateSortedHardware = (
    hardwareData: Record<string, Hardware>,
    modelData: Record<string, Model>,
  ) => {
    // boolean to stop tests being run once the hardware is identified
    let isUnidentified: boolean;
    // datastructures
    const collisionHardware: Record<string, boolean> = {};
    const rackHardwareBadData: Record<string, Record<string, boolean>> = {};
    const rackHardwareChassisNetwork: Record<string, Record<string, boolean>> = {};
    const rackHardwareChassisSled: Record<string, Record<string, boolean>> = {};
    const rackHardwarePdu: Record<string, Record<string, boolean>> = {};
    const rackHardwareRackMounted: Record<string, Record<string, boolean>> = {};
    const rackHardwareResult: Record<string, Array<string>> = {};
    const usageUnits: Record<string, Record<string, Record<string, string>>> = {};
    Object.keys(hardwareData).forEach((hardwareSysId) => {
      // generate needed variables
      const hardware = hardwareData[hardwareSysId];
      const {
        modelSysId,
        parent,
        rackSysId,
        rackU,
      } = hardware;
      let modelHeight = 0;
      if (modelSysId !== null && Object.prototype.hasOwnProperty.call(modelData, modelSysId)) {
        const testModelHeight = modelData[modelSysId].modelHeight;
        if (testModelHeight !== null) {
          modelHeight = testModelHeight;
        }
      }
      if (rackSysId !== null) {
        rackHardwareResult[hardwareSysId] = [];
        isUnidentified = true;
        // check for rack
        const resultRack = testValidRack(
          hardware,
          modelData,
        );
        rackHardwareResult[hardwareSysId].push(resultRack.testReport);
        if (resultRack.pass) {
          isUnidentified = false;
        }
        // check for sled
        if (isUnidentified) {
          const resultSled = testValidChassisSled(
            hardwareData,
            hardwareSysId,
          );
          rackHardwareResult[hardwareSysId].push(resultSled.testReport);
          if (resultSled.pass) {
            isUnidentified = false;
            if (parent !== null) {
              if (!Object.prototype.hasOwnProperty.call(rackHardwareChassisSled, parent)) {
                rackHardwareChassisSled[parent] = {};
              }
              rackHardwareChassisSled[parent][hardwareSysId] = true;
            }
          }
        }
        // check for rackmounted
        if (isUnidentified) {
          const resultRackMounted = testValidRackMounted(
            hardware,
            modelData,
          );
          rackHardwareResult[hardwareSysId].push(resultRackMounted.testReport);
          if (resultRackMounted.pass) {
            isUnidentified = false;
            if (!Object.prototype.hasOwnProperty.call(rackHardwareRackMounted, rackSysId)) {
              rackHardwareRackMounted[rackSysId] = {};
            }
            rackHardwareRackMounted[rackSysId][hardwareSysId] = true;
            // build collision data
            if (rackU !== null) {
              for (let loop = 0; loop < modelHeight; loop += 1) {
                const unitString = (rackU + loop).toString();
                // generate usage
                if (!Object.prototype.hasOwnProperty.call(usageUnits, rackSysId)) {
                  usageUnits[rackSysId] = {};
                }
                if (!Object.prototype.hasOwnProperty.call(usageUnits[rackSysId], unitString)) {
                  usageUnits[rackSysId][unitString] = {};
                }
                usageUnits[rackSysId][unitString][hardwareSysId] = 'alm_hardware';
                // deal with duplicates
                if (Object.keys(usageUnits[rackSysId][unitString]).length > 1) {
                  Object.keys(usageUnits[rackSysId][unitString]).forEach((collisionSysId) => {
                    // alm_hardware or u_patch_panel
                    if (usageUnits[rackSysId][unitString][collisionSysId] === 'alm_hardware') {
                      collisionHardware[collisionSysId] = true;
                    }
                  });
                }
              }
            }
          }
        }
        // check for network cards
        if (isUnidentified) {
          const resultNetworkCard = testValidChassisNetwork(
            hardwareData,
            hardware,
          );
          rackHardwareResult[hardwareSysId].push(resultNetworkCard.testReport);
          if (resultNetworkCard.pass) {
            isUnidentified = false;
            if (!Object.prototype.hasOwnProperty.call(rackHardwareRackMounted, rackSysId)) {
              rackHardwareRackMounted[rackSysId] = {};
            }
            rackHardwareRackMounted[rackSysId][hardwareSysId] = true;
          }
        }
        // check for pdus
        if (isUnidentified) {
          const resultPdu = testValidPdu(
            hardware,
          );
          rackHardwareResult[hardwareSysId].push(resultPdu.testReport);
          if (resultPdu.pass) {
            isUnidentified = false;
            if (!Object.prototype.hasOwnProperty.call(rackHardwarePdu, rackSysId)) {
              rackHardwarePdu[rackSysId] = {};
            }
            rackHardwarePdu[rackSysId][hardwareSysId] = true;
          }
        }
        // catch everything that has not been identified
        if (isUnidentified) {
          rackHardwareResult[hardwareSysId].push('unidentified - bad data');
          if (!Object.prototype.hasOwnProperty.call(rackHardwareBadData, rackSysId)) {
            rackHardwareBadData[rackSysId] = {};
          }
          rackHardwareBadData[rackSysId][hardwareSysId] = true;
        }
      }
    });
    return {
      collisionHardware,
      rackHardwareBadData,
      rackHardwareChassisNetwork,
      rackHardwareChassisSled,
      rackHardwarePdu,
      rackHardwareRackMounted,
      rackHardwareResult,
      usageUnits,
    };
  };
  const getModel = (
    modelSysIdUnique: Record<string, boolean>,
  ) => {
    const modelData: Record<string, Model> = {};
    if (Object.keys(modelSysIdUnique).length > 0) {
      // @ts-ignore
      const grModel = new GlideRecord('cmdb_model');
      grModel.addQuery('sys_id', 'IN', Object.keys(modelSysIdUnique));
      grModel.query();
      while (grModel.next()) {
        const tempModelSysId = checkString(grModel.getUniqueValue());
        if (tempModelSysId !== null) {
          modelData[tempModelSysId] = {
            deviceCategory: checkString(grModel.u_device_category.getDisplayValue()),
            displayName: checkString(grModel.display_name.getValue()),
            endOfFirmwareSupportDate: checkString(grModel.u_end_of_software_maintenance_date.getValue()),
            endOfLife: checkString(grModel.u_end_of_life.getValue()),
            endOfSale: checkString(grModel.u_end_of_sale.getValue()),
            maxChildren: checkInteger(grModel.u_max_children.getValue()),
            modelHeight: checkInteger(grModel.rack_units.getValue()),
            modelName: checkString(grModel.name.getValue()),
          };
        }
      }
    }
    return modelData;
  };
  const getHardware = (
    tempRackSysIdArray: Array<string>,
  ) => {
    const ciSysIdUnique: Record<string, boolean> = {};
    const hardwareData: Record<string, Hardware> = {};
    const hardwareSysIdUnique: Record<string, boolean> = {};
    const modelSysIdUnique: Record<string, boolean> = {};
    const skuSysIdUnique: Record<string, boolean> = {};
    // @ts-ignore
    const grHardware = new GlideRecord('alm_hardware');
    grHardware.addQuery('u_rack', 'IN', tempRackSysIdArray);
    grHardware.query();
    while (grHardware.next()) {
      // used as keys
      const tempHardwareSysId = checkString(grHardware.getUniqueValue());
      const tempCiSysId = checkString(grHardware.ci.getValue());
      const tempCiName = checkString(grHardware.ci.getDisplayValue());
      const tempModelSysId = checkString(grHardware.model.getValue());
      const hardRackSysId = checkString(grHardware.u_rack.getValue());
      const tempSkuSysId = checkString(grHardware.u_hardware_sku.getValue());
      // store
      if (tempHardwareSysId !== null && hardRackSysId !== null) {
        hardwareData[tempHardwareSysId] = {
          assetTag: checkString(grHardware.asset_tag.getValue()),
          ciSysId: tempCiSysId,
          ciName: tempCiName,
          hardwareSkuSysId: tempSkuSysId,
          lastPhysicalAudit: checkString(grHardware.u_last_physical_audit.getValue()),
          location: checkString(grHardware.location.getDisplayValue()),
          modelCategoryName: checkString(grHardware.model_category.getDisplayValue()),
          modelSysId: tempModelSysId,
          parent: checkString(grHardware.parent.getValue()),
          provisioningBudgetCodeSysId: checkString(grHardware.u_provisioning_budget_code.getValue()),
          rackSysId: hardRackSysId,
          rackPosition: checkInteger(grHardware.u_rack_position.getValue()),
          rackU: checkInteger(grHardware.u_rack_u.getValue()),
          serialNumber: checkString(grHardware.serial_number.getValue()),
          slot: checkInteger(grHardware.u_slot.getValue()),
          state: checkString(grHardware.install_status.getDisplayValue()),
          substate: checkString(grHardware.substatus.getValue()),
        };
        if (hardRackSysId !== null) {
          hardwareSysIdUnique[tempHardwareSysId] = true;
        }
        if (tempCiSysId !== null) {
          ciSysIdUnique[tempCiSysId] = true;
        }
        if (tempSkuSysId !== null) {
          skuSysIdUnique[tempSkuSysId] = true;
        }
        if (tempModelSysId !== null) {
          modelSysIdUnique[tempModelSysId] = true;
        }
      }
    }
    return {
      ciSysIdUnique,
      hardwareData,
      hardwareSysIdUnique,
      modelSysIdUnique,
      skuSysIdUnique,
    };
  };
  const getRackData = (
    tempRackSysIdArray: Array<string>,
  ) => {
    const rackData: Record<string, Rack> = {};
    const rackNameSysId: Record<string, string> = {};
    const rackSysIdName: Record<string, string> = {};
    if (tempRackSysIdArray.length > 0) {
      // @ts-ignore
      const grRack = new GlideRecord('cmdb_ci_rack');
      grRack.addQuery('sys_id', 'IN', tempRackSysIdArray);
      grRack.query();
      while (grRack.next()) {
        const rackSysId = checkString(grRack.getUniqueValue());
        const rackName = checkString(grRack.name.getValue());
        const rackHeight = checkInteger(grRack.rack_units.getValue());
        if (rackSysId !== null) {
          rackData[rackSysId] = {
            rackName,
            rackHeight,
          };
          if (rackName !== null) {
            rackNameSysId[rackName] = rackSysId;
          }
          if (rackName !== null) {
            rackSysIdName[rackSysId] = rackName;
          }
        }
      }
    }
    return {
      rackData,
      rackNameSysId,
      rackSysIdName,
    };
  };
  // collect data
  const {
    rackData,
    rackNameSysId,
    rackSysIdName,
  } = getRackData(rackSysIdArray);
  //
  const {
    ciSysIdUnique,
    hardwareData,
    hardwareSysIdUnique,
    modelSysIdUnique,
    skuSysIdUnique,
  } = getHardware(rackSysIdArray);
  //
  const modelData = getModel(modelSysIdUnique);
  //
  const {
    collisionHardware,
    rackHardwareBadData,
    rackHardwareChassisNetwork,
    rackHardwareChassisSled,
    rackHardwarePdu,
    rackHardwareRackMounted,
    rackHardwareResult,
    usageUnits,
  } = calculateSortedHardware(
    hardwareData,
    modelData,
  );
  // return data
  return {
    ciSysIdUnique,
    collisionHardware,
    hardwareData,
    hardwareSysIdUnique,
    modelData,
    modelSysIdUnique,
    rackData,
    rackHardwareBadData,
    rackHardwareChassisNetwork,
    rackHardwareChassisSled,
    rackHardwarePdu,
    rackHardwareRackMounted,
    rackHardwareResult,
    rackNameSysId,
    rackSysIdName,
    skuSysIdUnique,
    usageUnits,
  };
};
const testRackSysIds = ['bc22df4adb1ec70cab79f7d41d9619f6', 'b817db4edb168bc010b6f1561d961914', 'f4738c21dbb1c7442b56541adc96196a', 'b1c34461dbb1c7442b56541adc96198f', 'efd3cc61dbb1c7442b56541adc961978', 'bdba2b74db271788259e5898dc9619a4', '3abaa3f4db271788259e5898dc9619ab', '3bba63f4db271788259e5898dc961971', '30cae3f4db271788259e5898dc961926', '0aca67f4db271788259e5898dc961979'];
const results: RackHardwareSortResult = redbeardRackHardwareSort(testRackSysIds);
// @ts-ignore
gs.print(results);
