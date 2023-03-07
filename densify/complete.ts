interface CiData {
  assignmentGroupName: null | string;
  assignmentGroupSysId: null | string;
  cmdbNetworkSecurityZone: null | string;
  cmdbStatus: null | string;
  fqdn: null | string;
  hardwareStatus: null | string;
  iPAddress: null | string;
  primaryBusinessServiceName: null | string;
  primaryBusinessServiceSysId: null | string;
  serviceGroupName: null | string;
  serviceGroupSysId: null | string;
  status: null | string;
  supportGroupName: null | string;
  supportGroupSysId: null | string;
  sysClassName: null | string;
}
interface NetworkAdaptor {
  adaptorName: string;
  cmdbCiStatus: string;
}
interface UHardwareSkuConfigurations {
  skuDerate: number | null;
  skuHeight: number | null;
  skuMultiple: number | null;
  skuName: string | null;
}
interface Patchpanel {
  patchAssetTag: null | string;
  patchModelSysId: null | string;
  patchName: null | string;
  patchRackSysId: null | string;
  patchRackU: null | number;
}
interface Reservation {
  jiraUrl: null | string;
  reservationExpires: null | number;
  reservationMade: null | number;
  reservationType: string;
  userName: null | string;
}
//
//
//
//
//
//
//
//
//
//
//
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
interface Patchpanel {
  patchAssetTag: null | string;
  patchModelSysId: null | string;
  patchName: null | string;
  patchRackSysId: null | string;
  patchRackU: null | number;
}
interface Rack {
  rackHeight: null | number;
  rackName: null | string;
}
interface RackHardwareSortResult {
  collisionHardware: Record<string, boolean>;
  collisionPatchpanel: Record<string, boolean>;
  collisionSled: Record<string, boolean>,
  hardwareData: Record<string, Hardware>;
  modelData: Record<string, Model>;
  patchpanelBadData: Record<string, Record<string, boolean>>;
  patchpanelData: Record<string, Patchpanel>;
  patchpanelRackMounted: Record<string, Record<string, boolean>>;
  patchpanelSortResult: Record<string, string>;
  rackData: Record<string, Rack>;
  rackHardwareBadData: Record<string, Record<string, boolean>>;
  rackHardwareChassisNetwork: Record<string, Record<string, boolean>>;
  rackHardwareChassisSled: Record<string, Record<string, boolean>>;
  rackHardwarePdu: Record<string, Record<string, boolean>>;
  rackHardwareRackMounted: Record<string, Record<string, boolean>>;
  rackHardwareRacks: Record<string, Record<string, boolean>>;
  rackHardwareResult: Record<string, Array<string>>;
  rackNameSysId: Record<string, string>;
  rackSysIdName: Record<string, string>;
  uniqueCiSysId: Record<string, boolean>;
  uniqueHardwareSysId: Record<string, boolean>;
  uniqueModelSysId: Record<string, boolean>;
  uniqueRackSysId: Record<string, boolean>;
  uniqueSkuSysId: Record<string, boolean>;
  usageSlots: Record<string, Record<string, Record<string, true>>>,
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
  const testValidPatchpanel = (
    patchpanel: Patchpanel,
    modelData: Record<string, Model>,
  ) => {
    if (patchpanel.patchRackU === null) {
      return {
        pass: false,
        testReport: 'not a valid  patchpanel - u_rack_u is missing',
      };
    }
    if (patchpanel.patchRackU === 0) {
      return {
        pass: false,
        testReport: 'not a valid  patchpanel - u_rack_u is zero',
      };
    }
    if (patchpanel.patchModelSysId === null) {
      return {
        pass: false,
        testReport: 'not a valid patchpanel - does not have a model',
      };
    }
    if (!Object.prototype.hasOwnProperty.call(modelData, patchpanel.patchModelSysId)) {
      return {
        pass: false,
        testReport: 'not a valid patchpanel - model not found',
      };
    }
    const model: Model = modelData[patchpanel.patchModelSysId];
    if (model.modelHeight === null) {
      return {
        pass: false,
        testReport: 'not a valid patchpanel - model height missing',
      };
    }
    if (model.modelHeight < 1) {
      return {
        pass: false,
        testReport: 'not a valid patchpanel - model height is less than 1',
      };
    }
    return {
      pass: true,
      testReport: 'is a valid patchpanel',
    };
  };
  const calculateSortedHardware = (
    hardwareData: Record<string, Hardware>,
    modelData: Record<string, Model>,
    patchpanelData: Record<string, Patchpanel>,
  ) => {
    // boolean to stop tests being run once the hardware is identified
    let isUnidentified: boolean;
    // datastructures
    const collisionHardware: Record<string, boolean> = {};
    const collisionPatchpanel: Record<string, boolean> = {};
    const collisionSled: Record<string, boolean> = {};
    const patchpanelBadData: Record<string, Record<string, boolean>> = {};
    const patchpanelRackMounted: Record<string, Record<string, boolean>> = {};
    const patchpanelSortResult: Record<string, string> = {};
    const rackHardwareBadData: Record<string, Record<string, boolean>> = {};
    const rackHardwareChassisNetwork: Record<string, Record<string, boolean>> = {};
    const rackHardwareChassisSled: Record<string, Record<string, boolean>> = {};
    const rackHardwarePdu: Record<string, Record<string, boolean>> = {};
    const rackHardwareRackMounted: Record<string, Record<string, boolean>> = {};
    const rackHardwareRacks: Record<string, Record<string, boolean>> = {};
    const rackHardwareResult: Record<string, Array<string>> = {};
    const usageSlots: Record<string, Record<string, Record<string, true>>> = {};
    const usageUnits: Record<string, Record<string, Record<string, string>>> = {};
    //
    // process hardware
    //
    Object.keys(hardwareData).forEach((hardwareSysId) => {
      // generate needed variables
      const hardware = hardwareData[hardwareSysId];
      const {
        modelSysId,
        parent,
        rackSysId,
        rackU,
        slot,
      } = hardware;
      //
      let slotString = '';
      if (slot !== null) {
        slotString = slot.toString();
      }
      //
      let modelHeight = 0;
      if (modelSysId !== null && Object.prototype.hasOwnProperty.call(modelData, modelSysId)) {
        const testModelHeight = modelData[modelSysId].modelHeight;
        if (testModelHeight !== null) {
          modelHeight = testModelHeight;
        }
      }
      //
      if (rackSysId !== null) {
        rackHardwareResult[hardwareSysId] = [];
        isUnidentified = true;
        // check for racks in alm hardware (weird, but it happens)
        const resultRack = testValidRack(
          hardware,
          modelData,
        );
        rackHardwareResult[hardwareSysId].push(resultRack.testReport);
        if (resultRack.pass) {
          isUnidentified = false;
          if (!Object.prototype.hasOwnProperty.call(rackHardwareRacks, rackSysId)) {
            rackHardwareRacks[rackSysId] = {};
          }
          rackHardwareRacks[rackSysId][hardwareSysId] = true;
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
              // generate usageSlots
              if (!Object.prototype.hasOwnProperty.call(usageSlots, parent)) {
                usageSlots[parent] = {};
              }
              if (!Object.prototype.hasOwnProperty.call(usageSlots[parent], slotString)) {
                usageSlots[parent][slotString] = {};
              }
              usageSlots[parent][slotString][hardwareSysId] = true;
              // deal with duplicates
              if (Object.keys(usageSlots[parent][slotString]).length > 1) {
                Object.keys(usageSlots[parent][slotString]).forEach((collisionSledSysId) => {
                  collisionSled[collisionSledSysId] = true;
                });
              }
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
    //
    // process patchpanels
    //
    Object.keys(patchpanelData).forEach((patchpanelSysId) => {
      const { patchRackSysId } = patchpanelData[patchpanelSysId];
      const {
        patchModelSysId,
        patchRackU,
      } = patchpanelData[patchpanelSysId];
      let modelHeight = 0;
      if (patchModelSysId !== null && Object.prototype.hasOwnProperty.call(modelData, patchModelSysId)) {
        const testModelHeight = modelData[patchModelSysId].modelHeight;
        if (testModelHeight !== null) {
          modelHeight = testModelHeight;
        }
      }
      if (patchRackSysId) {
        // check if patchpanel is valid
        const resultPanel = testValidPatchpanel(
          patchpanelData[patchpanelSysId],
          modelData,
        );
        patchpanelSortResult[patchpanelSysId] = resultPanel.testReport;
        if (resultPanel.pass) {
          // valid patchpanel
          if (!Object.prototype.hasOwnProperty.call(patchpanelRackMounted, patchRackSysId)) {
            patchpanelRackMounted[patchRackSysId] = {};
          }
          patchpanelRackMounted[patchRackSysId][patchpanelSysId] = true;
          // build collision data
          if (patchRackU !== null) {
            for (let loop = 0; loop < modelHeight; loop += 1) {
              const unitString = (patchRackU + loop).toString();
              // generate usage
              if (!Object.prototype.hasOwnProperty.call(usageUnits, patchRackSysId)) {
                usageUnits[patchRackSysId] = {};
              }
              if (!Object.prototype.hasOwnProperty.call(usageUnits[patchRackSysId], unitString)) {
                usageUnits[patchRackSysId][unitString] = {};
              }
              usageUnits[patchRackSysId][unitString][patchRackSysId] = 'u_patch_panel';
              // deal with duplicates
              if (Object.keys(usageUnits[patchRackSysId][unitString]).length > 1) {
                Object.keys(usageUnits[patchRackSysId][unitString]).forEach((collisionSysId) => {
                  // alm_hardware or u_patch_panel
                  if (usageUnits[patchRackSysId][unitString][collisionSysId] === 'alm_hardware') {
                    collisionHardware[collisionSysId] = true;
                  }
                  if (usageUnits[patchRackSysId][unitString][collisionSysId] === 'u_patch_panel') {
                    collisionPatchpanel[collisionSysId] = true;
                  }
                });
              }
            }
          }
          // generate unit usage and check for collisions
        } else {
          // bad patchpanel
          if (!Object.prototype.hasOwnProperty.call(patchpanelBadData, patchRackSysId)) {
            patchpanelBadData[patchRackSysId] = {};
          }
          patchpanelBadData[patchRackSysId][patchpanelSysId] = true;
        }
      }
    });
    return {
      collisionHardware,
      collisionPatchpanel,
      collisionSled,
      patchpanelBadData,
      patchpanelRackMounted,
      patchpanelSortResult,
      rackHardwareBadData,
      rackHardwareChassisNetwork,
      rackHardwareChassisSled,
      rackHardwarePdu,
      rackHardwareRackMounted,
      rackHardwareRacks,
      rackHardwareResult,
      usageSlots,
      usageUnits,
    };
  };
  const getModel = (
    uniqueHardwareModelSysId: Record<string, boolean>,
  ) => {
    const modelData: Record<string, Model> = {};
    if (Object.keys(uniqueHardwareModelSysId).length > 0) {
      // @ts-ignore
      const grModel = new GlideRecord('cmdb_model');
      grModel.addQuery('sys_id', 'IN', Object.keys(uniqueHardwareModelSysId));
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
    const uniqueCiSysId: Record<string, boolean> = {};
    const hardwareData: Record<string, Hardware> = {};
    const uniqueHardwareSysId: Record<string, boolean> = {};
    const uniqueHardwareModelSysId: Record<string, boolean> = {};
    const uniqueSkuSysId: Record<string, boolean> = {};
    if (tempRackSysIdArray.length > 0) {
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
            uniqueHardwareSysId[tempHardwareSysId] = true;
          }
          if (tempCiSysId !== null) {
            uniqueCiSysId[tempCiSysId] = true;
          }
          if (tempSkuSysId !== null) {
            uniqueSkuSysId[tempSkuSysId] = true;
          }
          if (tempModelSysId !== null) {
            uniqueHardwareModelSysId[tempModelSysId] = true;
          }
        }
      }
    }
    return {
      uniqueCiSysId,
      hardwareData,
      uniqueHardwareSysId,
      uniqueHardwareModelSysId,
      uniqueSkuSysId,
    };
  };
  const getRackData = (
    tempRackSysIdArray: Array<string>,
  ) => {
    const rackData: Record<string, Rack> = {};
    const rackNameSysId: Record<string, string> = {};
    const rackSysIdName: Record<string, string> = {};
    const uniqueRackSysId: Record<string, boolean> = {};
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
          uniqueRackSysId[rackSysId] = true;
        }
      }
    }
    return {
      rackData,
      rackNameSysId,
      rackSysIdName,
      uniqueRackSysId,
    };
  };
  const getPatchPanelData = (
    testRackSysIds: Array<string>,
    uniqueHardwareModelSysId: Record<string, boolean>,
  ) => {
    const patchpanelData: Record<string, Patchpanel> = {};
    // take the hardware model sys_ids and add the patchpanel model sys_ids
    const uniqueModelSysId = uniqueHardwareModelSysId;
    // @ts-ignore
    const grPatch = new GlideRecord('u_patch_panel');
    grPatch.addQuery('u_rack', 'IN', testRackSysIds);
    grPatch.query();
    while (grPatch.next()) {
      const tempPatchPanelSysId = checkString(grPatch.getUniqueValue());
      const tempPatchModelSysId = checkString(grPatch.model_id.getValue());
      if (tempPatchPanelSysId !== null) {
        patchpanelData[tempPatchPanelSysId] = {
          patchAssetTag: checkString(grPatch.asset_tag.getValue()),
          patchModelSysId: tempPatchModelSysId,
          patchName: checkString(grPatch.name.getValue()),
          patchRackSysId: checkString(grPatch.u_rack.getValue()),
          patchRackU: checkInteger(grPatch.u_rack_u.getValue()),
        };
      }
      if (tempPatchModelSysId !== null) {
        uniqueModelSysId[tempPatchModelSysId] = true;
      }
    }
    return {
      patchpanelData,
      uniqueModelSysId,
    };
  };
  // collect data
  const {
    rackData,
    rackNameSysId,
    rackSysIdName,
    uniqueRackSysId,
  } = getRackData(rackSysIdArray);
  //
  const {
    uniqueCiSysId,
    hardwareData,
    uniqueHardwareSysId,
    uniqueHardwareModelSysId,
    uniqueSkuSysId,
  } = getHardware(rackSysIdArray);
  //
  const {
    patchpanelData,
    uniqueModelSysId,
  } = getPatchPanelData(
    rackSysIdArray,
    uniqueHardwareModelSysId,
  );
  //
  const modelData = getModel(uniqueModelSysId);
  //
  const {
    collisionHardware,
    collisionPatchpanel,
    collisionSled,
    patchpanelBadData,
    patchpanelRackMounted,
    patchpanelSortResult,
    rackHardwareBadData,
    rackHardwareChassisNetwork,
    rackHardwareChassisSled,
    rackHardwarePdu,
    rackHardwareRackMounted,
    rackHardwareRacks,
    rackHardwareResult,
    usageSlots,
    usageUnits,
  } = calculateSortedHardware(
    hardwareData,
    modelData,
    patchpanelData,
  );
  // return data
  return {
    collisionHardware,
    collisionPatchpanel,
    collisionSled,
    hardwareData,
    modelData,
    patchpanelBadData,
    patchpanelData,
    patchpanelRackMounted,
    patchpanelSortResult,
    rackData,
    rackHardwareBadData,
    rackHardwareChassisNetwork,
    rackHardwareChassisSled,
    rackHardwarePdu,
    rackHardwareRackMounted,
    rackHardwareRacks,
    rackHardwareResult,
    rackNameSysId,
    rackSysIdName,
    uniqueCiSysId,
    uniqueHardwareSysId,
    uniqueModelSysId,
    uniqueRackSysId,
    uniqueSkuSysId,
    usageSlots,
    usageUnits,
  };
};
// const testRackSysIds = [
//   'bc22df4adb1ec70cab79f7d41d9619f6',
//   'b817db4edb168bc010b6f1561d961914',
//   'f4738c21dbb1c7442b56541adc96196a',
//   'b1c34461dbb1c7442b56541adc96198f',
//   'efd3cc61dbb1c7442b56541adc961978',
//   'bdba2b74db271788259e5898dc9619a4',
//   '3abaa3f4db271788259e5898dc9619ab',
//   '3bba63f4db271788259e5898dc961971',
//   '30cae3f4db271788259e5898dc961926',
//   '0aca67f4db271788259e5898dc961979',
// ];
// const results: RackHardwareSortResult = redbeardRackHardwareSort(testRackSysIds);
// // @ts-ignore
// gs.print(results);
//
//
//
//
//
//
//
//
//
//
//
//
// non script include functions
//
//
//
//
//
//
//
//
//
//
//
//
const checkTime = (
  testVariable: any,
) => {
  // @ts-ignore
  const tempTime: number | null = new GlideDateTime(testVariable).getNumericValue();
  if (tempTime !== 0) {
    // @ts-ignore
    return tempTime;
  }
  return null;
};
const checkJiraUrl = (
  testVariable: any,
) => {
  if (typeof testVariable === 'string') {
    if (testVariable.startsWith('https://jira.godaddy.com/browse/')) {
      return testVariable;
    }
    if (testVariable.startsWith('https://godaddy-corp.atlassian.net/browse/')) {
      return testVariable;
    }
  }
  return null;
};
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
const checkFloat = (
  testVariable: any,
) => {
  if (typeof testVariable === 'string') {
    if (!Number.isNaN(parseFloat(testVariable))) {
      return parseFloat(testVariable);
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
const checkStringWithDefault = (
  defaultString: string,
  testVariable: any,
) => {
  if (typeof testVariable === 'string') {
    if (testVariable !== '') {
      return testVariable;
    }
  }
  return defaultString;
};
const getSkuData = (
  uniqueSkuSysId: Record<string, boolean>,
) => {
  const skuData: Record<string, UHardwareSkuConfigurations> = {};
  // @ts-ignore
  const grSkuData = new GlideRecord('u_hardware_sku_configurations');
  grSkuData.addQuery('sys_id', 'IN', Object.keys(uniqueSkuSysId));
  grSkuData.query();
  while (grSkuData.next()) {
    const testSkuSysId = checkString(grSkuData.getUniqueValue());
    if (testSkuSysId !== null) {
      skuData[testSkuSysId] = {
        skuHeight: checkInteger(grSkuData.u_space_calculation_height.getValue()),
        skuName: checkString(grSkuData.u_sku_name.getValue()),
        skuMultiple: checkInteger(grSkuData.u_space_calculation_multiple.getValue()),
        skuDerate: checkFloat(grSkuData.u_derate_kw.getValue()),
      };
    }
  }
  return skuData;
};
const getRemoteAdaptors = (
  uniqueSwitchCi: Record<string, boolean>,
) => {
  const switchRemotePorts: Record<string, Record<string, boolean>> = {};
  // @ts-ignore
  const portRemote = new GlideRecord('cmdb_ci_network_adapter');
  portRemote.addQuery('u_switch', 'IN', Object.keys(uniqueSwitchCi));
  // portRemote.addEncodedQuery('nameSTARTSWITHeth');
  // portRemote.addEncodedQuery('u_switchportSTARTSWITHeth');
  portRemote.query();
  while (portRemote.next()) {
    const switchCiSysId = checkString(portRemote.u_switch.getValue());
    const adaptorSysId = checkString(portRemote.getUniqueValue());
    if (switchCiSysId !== null && adaptorSysId !== null) {
      if (!Object.prototype.hasOwnProperty.call(switchRemotePorts, switchCiSysId)) {
        switchRemotePorts[switchCiSysId] = {};
      }
      switchRemotePorts[switchCiSysId][adaptorSysId] = true;
    }
  }
  return switchRemotePorts;
};
const getCiData = (
  uniqueCiSysId: Record<string, boolean>,
) => {
  const ciData: Record<string, CiData> = {};
  const uniqueSwitchCi: Record<string, boolean> = {};
  if (Object.keys(uniqueCiSysId).length > 0) {
    // @ts-ignore
    const grCiHardware = new GlideRecord('cmdb_ci_hardware');
    grCiHardware.addQuery('sys_id', 'IN', Object.keys(uniqueCiSysId));
    grCiHardware.query();
    while (grCiHardware.next()) {
      const tempCiSysId = checkString(grCiHardware.getUniqueValue());
      const tempCmdbStatus = checkString(grCiHardware.u_cmdb_ci_status.getDisplayValue());
      const tempSysClassName = checkString(grCiHardware.sys_class_name.getValue());
      if (tempCiSysId !== null) {
        ciData[tempCiSysId] = {
          assignmentGroupName: checkString(grCiHardware.assignment_group.getDisplayValue()),
          assignmentGroupSysId: checkString(grCiHardware.assignment_group.getValue()),
          cmdbNetworkSecurityZone: checkString(grCiHardware.u_cmdb_network_security_zone.getDisplayValue()),
          cmdbStatus: checkString(grCiHardware.u_cmdb_ci_status.getDisplayValue()),
          fqdn: checkString(grCiHardware.fqdn.getDisplayValue()),
          hardwareStatus: checkString(grCiHardware.hardware_status.getValue()),
          iPAddress: checkString(grCiHardware.ip_address.getDisplayValue()),
          primaryBusinessServiceName: checkString(grCiHardware.u_cmdb_ci_service.getDisplayValue()),
          primaryBusinessServiceSysId: checkString(grCiHardware.u_cmdb_ci_service.getValue()),
          serviceGroupName: checkString(grCiHardware.u_patching_group.getDisplayValue()),
          serviceGroupSysId: checkString(grCiHardware.u_patching_group.getValue()),
          status: checkString(grCiHardware.install_status.getDisplayValue()),
          supportGroupName: checkString(grCiHardware.support_group.getDisplayValue()),
          supportGroupSysId: checkString(grCiHardware.support_group.getValue()),
          sysClassName: checkString(grCiHardware.sys_class_name.getValue()),
        };
        if (tempSysClassName === 'cmdb_ci_ip_switch' && tempCmdbStatus !== 'Retired') {
          uniqueSwitchCi[tempCiSysId] = true;
        }
      }
    }
  }
  return {
    ciData,
    uniqueSwitchCi,
  };
};
const getMetaData = (
  environment: string | null,
  rackSysIdArray: Array<string>,
) => {
  const rackNameUnique: Record<string, boolean> = {};
  const rackSysIdMetaSysId: Record<string, string> = {};
  const rackSysIdPowerDesign: Record<string, number> = {};
  const filteredRackSysIdUnique: Record<string, boolean> = {};
  // @ts-ignore
  const grRackMeta = new GlideRecord('u_dc_rack_metadata');
  grRackMeta.addQuery('u_rack', 'IN', rackSysIdArray);
  if (environment !== null) {
    grRackMeta.addQuery('u_environment', environment);
  }
  grRackMeta.query();
  while (grRackMeta.next()) {
    const tempRackSysId = checkString(grRackMeta.u_rack.getValue());
    const tempRackMetaSysId = checkString(grRackMeta.getUniqueValue());
    const tempRackName = checkString(grRackMeta.u_rack.getDisplayValue());
    const tempPowerDesign = checkFloat(grRackMeta.u_power_design_kw.getValue());
    if (tempRackSysId !== null) {
      filteredRackSysIdUnique[tempRackSysId] = true;
      if (tempRackName !== null) {
        rackNameUnique[tempRackName] = true;
      }
      if (tempRackMetaSysId !== null) {
        rackSysIdMetaSysId[tempRackSysId] = tempRackMetaSysId;
      }
      if (tempPowerDesign !== null) {
        rackSysIdPowerDesign[tempRackSysId] = tempPowerDesign;
      }
    }
  }
  return {
    rackNameUnique,
    rackSysIdMetaSysId,
    rackSysIdPowerDesign,
  };
};
const getPowerIq = (
  rackNameUnique: Record<string, boolean>,
) => {
  const rackNamePowerIqMax: Record<string, number> = {};
  // @ts-ignore
  const grPowerIq = new GlideRecord('u_poweriq_staging');
  grPowerIq.addQuery('u_rack_name', 'IN', Object.keys(rackNameUnique));
  grPowerIq.addEncodedQuery('sys_created_on>=javascript:gs.beginningOfLast6Months()');
  grPowerIq.query();
  while (grPowerIq.next()) {
    const rackName = checkString(grPowerIq.u_rack_name.getValue());
    const maxPower = checkFloat(grPowerIq.u_maximum_active_power.getValue());
    if (rackName !== null && maxPower !== null) {
      // check if rackname already exists in data
      if (!Object.prototype.hasOwnProperty.call(rackNamePowerIqMax, rackName)) {
        // create if first time
        rackNamePowerIqMax[rackName] = maxPower;
      } else if (maxPower > rackNamePowerIqMax[rackName]) {
        // replace if greater
        rackNamePowerIqMax[rackName] = maxPower;
      }
    }
  }
  return rackNamePowerIqMax;
};
const getReservations = (
  rackSysIdArray: Array<string>,
) => {
  const rackReservation: Record<string, Record<string, Reservation>> = {};
  const rackUnitReservation: Record<string, Record<number, Record<string, Reservation>>> = {};
  // @ts-ignore
  const grResRack = new GlideRecord('u_reservation_rack');
  grResRack.addQuery('u_rack', 'IN', rackSysIdArray);
  grResRack.addEncodedQuery('u_reservation_ends>=javascript:gs.beginningOfToday()');
  grResRack.query();
  while (grResRack.next()) {
    // safe
    const tempRackResSysId: string = grResRack.getUniqueValue();
    // test
    const tempRackSysId = checkString(grResRack.u_rack.getValue());
    // store
    if (tempRackSysId !== null) {
      if (!Object.prototype.hasOwnProperty.call(rackReservation, tempRackSysId)) {
        rackReservation[tempRackSysId] = {};
      }
      if (tempRackResSysId !== null) {
        rackReservation[tempRackSysId][tempRackResSysId] = {
          jiraUrl: checkJiraUrl(grResRack.u_jira_url.getValue()),
          reservationMade: checkTime(grResRack.sys_created_on.getValue()),
          reservationExpires: checkTime(grResRack.u_reservation_ends.getValue()),
          reservationType: 'rack',
          userName: checkString(grResRack.sys_created_by.getValue()),
        };
      }
    }
  }
  // @ts-ignore
  const grResUnit = new GlideRecord('u_reservation_rack_unit');
  grResUnit.addQuery('u_rack', 'IN', rackSysIdArray);
  grResUnit.addEncodedQuery('u_reservation_ends>=javascript:gs.beginningOfToday()');
  grResUnit.query();
  while (grResUnit.next()) {
    // safe
    const tempUnitResSysId: string = grResUnit.getUniqueValue();
    // test
    const tempRackSysId = checkString(grResUnit.u_rack.getValue());
    const tempRackUnit = checkInteger(grResUnit.u_rack_unit.getValue());
    // store
    if (tempRackSysId !== null && tempRackUnit !== null) {
      if (!Object.prototype.hasOwnProperty.call(rackUnitReservation, tempRackSysId)) {
        rackUnitReservation[tempRackSysId] = {};
      }
      if (!Object.prototype.hasOwnProperty.call(rackUnitReservation[tempRackSysId], tempRackUnit)) {
        rackUnitReservation[tempRackSysId][tempRackUnit] = {};
      }
      rackUnitReservation[tempRackSysId][tempRackUnit][tempUnitResSysId] = {
        jiraUrl: checkJiraUrl(grResUnit.u_jira_url.getValue()),
        reservationMade: checkTime(grResUnit.sys_created_on.getValue()),
        reservationExpires: checkTime(grResUnit.u_reservation_ends.getValue()),
        reservationType: 'unit',
        userName: checkString(grResUnit.sys_created_by.getValue()),
      };
    }
  }
  return {
    rackReservation,
    rackUnitReservation,
  };
};
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// const testPatchPanel = (
//   patchpanelSysId: string,
// ) => {
//   const patchpanel = patchpanelData[patchpanelSysId];
//   const rackSysId = patchpanel.patchRackSysId;
//   const rackU = patchpanel.patchRackU;
//   const sortResult = testValidPatchpanel(patchpanelSysId);
//   if (rackSysId !== null) {
//     if (sortResult.pass && rackU !== null) {
//       if (!Object.prototype.hasOwnProperty.call(patchpanelRackMounted, rackSysId)) {
//         patchpanelRackMounted[rackSysId] = {};
//       }
//       patchpanelRackMounted[rackSysId][patchpanelSysId] = true;
//       // generate usageUnits for collision testing
//       let modelHeight = 0;
//       const modelSysId = patchpanel.patchModelSysId;
//       if (modelSysId !== null) {
//         if (Object.prototype.hasOwnProperty.call(modelData, modelSysId)) {
//           const testModelHeight = modelData[modelSysId].modelHeight;
//           if (testModelHeight !== null) {
//             modelHeight = testModelHeight;
//           }
//         }
//       }
//       generateUsageUnits(
//         modelHeight,
//         rackSysId,
//         rackU,
//         patchpanelSysId,
//         'u_patch_panel',
//       );
//     } else {
//       patchpanelSortResult[patchpanelSysId] = sortResult.testReport;
//       storePatchpanelBadData(
//         patchpanelSysId,
//         rackSysId,
//       );
//     }
//   }
// };
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// params from url
//
const chosenSkuSysId = 'afead3e913883f401287bd566144b006';
const environmentValue = 'ManagedHosting1';
// const numberOfServers = 9;
// const roomSysIdArray = ['5400288a37bc7e40362896d543990e9b'];
//
const testRackSysIds = [
  'bc22df4adb1ec70cab79f7d41d9619f6',
  'b817db4edb168bc010b6f1561d961914',
  'f4738c21dbb1c7442b56541adc96196a',
  'b1c34461dbb1c7442b56541adc96198f',
  'efd3cc61dbb1c7442b56541adc961978',
  'bdba2b74db271788259e5898dc9619a4',
  '3abaa3f4db271788259e5898dc9619ab',
  '3bba63f4db271788259e5898dc961971',
  '30cae3f4db271788259e5898dc961926',
  '0aca67f4db271788259e5898dc961979',
];
const results: RackHardwareSortResult = redbeardRackHardwareSort(testRackSysIds);
//
const { uniqueSkuSysId } = results;
uniqueSkuSysId[chosenSkuSysId] = true;
const {
  ciData,
  uniqueSwitchCi,
} = getCiData(results.uniqueCiSysId);
//
const switchRemotePorts = getRemoteAdaptors(uniqueSwitchCi);
//
const skuData = getSkuData(uniqueSkuSysId);
//
const {
  rackNameUnique,
  rackSysIdMetaSysId,
  rackSysIdPowerDesign,
} = getMetaData(
  environmentValue,
  testRackSysIds,
);
//
const rackNamePowerIqMax = getPowerIq(rackNameUnique);
//
const {
  rackReservation,
  rackUnitReservation,
} = getReservations(
  testRackSysIds,
);
//
//
//
//
//
//
//
//
//
//
// show data
//
let output = '';
output += `results = ${JSON.stringify(results, null, 2)};\n`;
output += `ciData = ${JSON.stringify(ciData, null, 2)};\n`;
output += `switchRemotePorts = ${JSON.stringify(switchRemotePorts, null, 2)};\n`;
output += `skuData = ${JSON.stringify(skuData, null, 2)};\n`;
output += `rackSysIdMetaSysId = ${JSON.stringify(rackSysIdMetaSysId, null, 2)};\n`;
output += `rackSysIdPowerDesign = ${JSON.stringify(rackSysIdPowerDesign, null, 2)};\n`;
output += `rackNamePowerIqMax = ${JSON.stringify(rackNamePowerIqMax, null, 2)};\n`;
output += `rackUnitReservation = ${JSON.stringify(rackUnitReservation, null, 2)};\n`;
output += `rackReservation = ${JSON.stringify(rackReservation, null, 2)};\n`;
// output += `xxxxxx = ${JSON.stringify(xxxxxx, null, 2)};\n`;
// output += `xxxxxx = ${JSON.stringify(xxxxxx, null, 2)};\n`;
// @ts-ignore
gs.print(output);
