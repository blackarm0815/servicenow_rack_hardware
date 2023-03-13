interface Core {
  collisionHardware: Record<string, boolean>;
  collisionPatchpanel: Record<string, boolean>;
  collisionSled: Record<string, boolean>,
  hardwareBadData: Record<string, Record<string, boolean>>;
  hardwareChassisNetwork: Record<string, Record<string, boolean>>;
  hardwareChassisSled: Record<string, Record<string, boolean>>;
  hardwareData: Record<string, Hardware>;
  hardwarePdu: Record<string, Record<string, boolean>>;
  hardwareRackMounted: Record<string, Record<string, boolean>>;
  hardwareRacks: Record<string, Record<string, boolean>>;
  hardwareResult: Record<string, Array<string>>;
  modelData: Record<string, Model>;
  patchpanelBadData: Record<string, Record<string, boolean>>;
  patchpanelData: Record<string, Patchpanel>;
  patchpanelRackMounted: Record<string, Record<string, boolean>>;
  patchpanelResult: Record<string, string>;
  rackData: Record<string, Rack>;
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
const redbeardRackHardwareSort = (
  rackSysIdArray: Array<string>,
) => {
  const checkInteger = (
    testVariable: unknown,
  ) => {
    if (typeof testVariable === 'string') {
      if (!Number.isNaN(parseInt(testVariable, 10))) {
        return parseInt(testVariable, 10);
      }
    }
    return null;
  };
  const checkString = (
    testVariable: unknown,
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
    if (parentSysId !== null) {
      if (hardwareData[parentSysId].rackSysId !== hardwareData[hardwareSysId].rackSysId) {
        return {
          pass: false,
          testReport: 'not a valid sled - parent not in same rack',
        };
      }
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
  const sortHardware = (
    hardware: Hardware,
    hardwareData: Record<string, Hardware>,
    hardwareSysId: string,
    modelData: Record<string, Model>,
  ) => {
    const allTestResults: Array<string> = [];
    // test for sleds
    const resultSled = testValidChassisSled(
      hardwareData,
      hardwareSysId,
    );
    allTestResults.push(resultSled.testReport);
    if (resultSled.pass) {
      return {
        sortName: 'sled',
        allTestResults,
      };
    }
    // check for rackmounted
    const resultRackMounted = testValidRackMounted(
      hardware,
      modelData,
    );
    allTestResults.push(resultRackMounted.testReport);
    if (resultRackMounted.pass) {
      return {
        sortName: 'rackMounted',
        allTestResults,
      };
    }
    // check for pdus
    const resultPdu = testValidPdu(
      hardware,
    );
    allTestResults.push(resultRackMounted.testReport);
    if (resultPdu.pass) {
      return {
        sortName: 'pdu',
        allTestResults,
      };
    }
    // check for network cards
    const resultNetworkCard = testValidChassisNetwork(
      hardwareData,
      hardware,
    );
    allTestResults.push(resultRackMounted.testReport);
    if (resultNetworkCard.pass) {
      return {
        sortName: 'networkCard',
        allTestResults,
      };
    }
    // test for racks
    const resultRack = testValidRack(
      hardware,
      modelData,
    );
    allTestResults.push(resultRack.testReport);
    if (resultRack.pass) {
      return {
        sortName: 'rack',
        allTestResults,
      };
    }
    // catch everything else
    return {
      sortName: 'badData',
      allTestResults,
    };
  };
  const calculateSortedHardware = (
    hardwareData: Record<string, Hardware>,
    modelData: Record<string, Model>,
    patchpanelData: Record<string, Patchpanel>,
  ) => {
    const collisionHardware: Record<string, boolean> = {};
    const collisionPatchpanel: Record<string, boolean> = {};
    const collisionSled: Record<string, boolean> = {};
    const patchpanelBadData: Record<string, Record<string, boolean>> = {};
    const patchpanelRackMounted: Record<string, Record<string, boolean>> = {};
    const patchpanelResult: Record<string, string> = {};
    const hardwareBadData: Record<string, Record<string, boolean>> = {};
    const hardwareChassisNetwork: Record<string, Record<string, boolean>> = {};
    const hardwareChassisSled: Record<string, Record<string, boolean>> = {};
    const hardwarePdu: Record<string, Record<string, boolean>> = {};
    const hardwareRackMounted: Record<string, Record<string, boolean>> = {};
    const hardwareRacks: Record<string, Record<string, boolean>> = {};
    const hardwareResult: Record<string, Array<string>> = {};
    const usageSlots: Record<string, Record<string, Record<string, true>>> = {};
    const usageUnits: Record<string, Record<string, Record<string, string>>> = {};
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
      let slotString = '';
      if (slot !== null) {
        slotString = slot.toString();
      }
      let modelHeight = 0;
      if (modelSysId !== null && Object.prototype.hasOwnProperty.call(modelData, modelSysId)) {
        const testModelHeight = modelData[modelSysId].modelHeight;
        if (testModelHeight !== null) {
          modelHeight = testModelHeight;
        }
      }
      if (rackSysId !== null) {
        const {
          sortName,
          allTestResults,
        } = sortHardware(
          hardware,
          hardwareData,
          hardwareSysId,
          modelData,
        );
        hardwareResult[hardwareSysId] = allTestResults;
        //
        // process sleds
        //
        if (sortName === 'sleds') {
          if (parent !== null) {
            if (!Object.prototype.hasOwnProperty.call(hardwareChassisSled, parent)) {
              hardwareChassisSled[parent] = {};
            }
            hardwareChassisSled[parent][hardwareSysId] = true;
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
        //
        // process rackMounted
        //
        if (sortName === 'rackMounted') {
          if (!Object.prototype.hasOwnProperty.call(hardwareRackMounted, rackSysId)) {
            hardwareRackMounted[rackSysId] = {};
          }
          hardwareRackMounted[rackSysId][hardwareSysId] = true;
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
        //
        // process pdu
        //
        if (sortName === 'pdu') {
          if (!Object.prototype.hasOwnProperty.call(hardwarePdu, rackSysId)) {
            hardwarePdu[rackSysId] = {};
          }
          hardwarePdu[rackSysId][hardwareSysId] = true;
        }
        //
        // process networkCard
        //
        if (sortName === 'networkCard') {
          if (!Object.prototype.hasOwnProperty.call(hardwareRackMounted, rackSysId)) {
            hardwareRackMounted[rackSysId] = {};
          }
          hardwareRackMounted[rackSysId][hardwareSysId] = true;
        }
        //
        // process rack
        //
        if (sortName === 'rack') {
          if (!Object.prototype.hasOwnProperty.call(hardwareRacks, rackSysId)) {
            hardwareRacks[rackSysId] = {};
          }
          hardwareRacks[rackSysId][hardwareSysId] = true;
        }
        //
        // process badData
        //
        if (sortName === 'badData') {
          if (!Object.prototype.hasOwnProperty.call(hardwareBadData, rackSysId)) {
            hardwareBadData[rackSysId] = {};
          }
          hardwareBadData[rackSysId][hardwareSysId] = true;
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
      if (patchModelSysId !== null) {
        if (Object.prototype.hasOwnProperty.call(modelData, patchModelSysId)) {
          const testModelHeight = modelData[patchModelSysId].modelHeight;
          if (testModelHeight !== null) {
            modelHeight = testModelHeight;
          }
        }
      }
      if (patchRackSysId) {
        // check if patchpanel is valid
        const resultPanel = testValidPatchpanel(
          patchpanelData[patchpanelSysId],
          modelData,
        );
        patchpanelResult[patchpanelSysId] = resultPanel.testReport;
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
      hardwareBadData,
      hardwareChassisNetwork,
      hardwareChassisSled,
      hardwarePdu,
      hardwareRackMounted,
      hardwareRacks,
      hardwareResult,
      patchpanelBadData,
      patchpanelRackMounted,
      patchpanelResult,
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
          const firmware = checkString(grModel.u_end_of_software_maintenance_date.getValue());
          modelData[tempModelSysId] = {
            deviceCategory: checkString(grModel.u_device_category.getDisplayValue()),
            displayName: checkString(grModel.display_name.getValue()),
            endOfFirmwareSupportDate: firmware,
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
        const tempBudget = checkString(grHardware.u_provisioning_budget_code.getValue());
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
            provisioningBudgetCodeSysId: tempBudget,
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
    patchpanelResult,
    hardwareBadData,
    hardwareChassisNetwork,
    hardwareChassisSled,
    hardwarePdu,
    hardwareRackMounted,
    hardwareRacks,
    hardwareResult,
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
    hardwareBadData,
    hardwareChassisNetwork,
    hardwareChassisSled,
    hardwareData,
    hardwarePdu,
    hardwareRackMounted,
    hardwareRacks,
    hardwareResult,
    modelData,
    patchpanelBadData,
    patchpanelData,
    patchpanelRackMounted,
    patchpanelResult,
    rackData,
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
// @ts-ignore
const core: Core = redbeardRackHardwareSort(testRackSysIds);
// @ts-ignore
gs.print(core);
