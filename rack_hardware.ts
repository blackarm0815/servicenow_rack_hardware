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
const getSortedRackHardware = (
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
  const testValidRackMounted = (
    hardware: Hardware,
    modelData: Record<string, Model>,
  ) => {
    if (hardware.parent !== null) {
      return {
        pass: false,
        failReport: 'not a valid rack mounted - has a parent',
      };
    }
    if (hardware.rackU === null) {
      return {
        pass: false,
        failReport: 'not a valid  rack mounted - u_rack_u is missing',
      };
    }
    if (hardware.rackU === 0) {
      return {
        pass: false,
        failReport: 'not a valid  rack mounted - u_rack_u is zero',
      };
    }
    if (hardware.modelSysId === null) {
      return {
        pass: false,
        failReport: 'not a valid  rack mounted - does not have a model',
      };
    }
    if (!Object.prototype.hasOwnProperty.call(modelData, hardware.modelSysId)) {
      return {
        pass: false,
        failReport: 'not a valid  rack mounted - model not found',
      };
    }
    if (modelData[hardware.modelSysId].modelHeight === null) {
      return {
        pass: false,
        failReport: 'not a valid  rack mounted - model height is missing',
      };
    }
    if (modelData[hardware.modelSysId].modelHeight === 0) {
      return {
        pass: false,
        failReport: 'not a valid  rack mounted - model height is zero',
      };
    }
    return {
      pass: true,
      failReport: '',
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
        failReport: 'not a valid sled - slot missing',
      };
    }
    if (hardwareData[hardwareSysId].slot === 0) {
      return {
        pass: false,
        failReport: 'not a valid sled - slot is zero',
      };
    }
    if (parentSysId === null) {
      return {
        pass: false,
        failReport: 'not a valid sled - parent missing',
      };
    }
    if (parentSysId !== null && !Object.prototype.hasOwnProperty.call(hardwareData, parentSysId)) {
      return {
        pass: false,
        failReport: 'not a valid sled - parent not found in hardwareData',
      };
    }
    if (parentSysId !== null && hardwareData[parentSysId].rackSysId !== hardwareData[hardwareSysId].rackSysId) {
      return {
        pass: false,
        failReport: 'not a valid sled - parent not in same rack',
      };
    }
    return {
      pass: true,
      failReport: '',
    };
  };
  const testValidRack = (
    hardware: Hardware,
    modelData: Record<string, Model>,
  ) => {
    if (hardware.modelSysId !== null) {
      if (Object.prototype.hasOwnProperty.call(modelData, hardware.modelSysId)) {
        if (modelData[hardware.modelSysId].deviceCategory === 'Rack') {
          return true;
        }
      }
    }
    return false;
  };
  const calculateSortedHardware = (
    hardwareData: Record<string, Hardware>,
    modelData: Record<string, Model>,
  ) => {
    // test booleans
    let isRack: boolean;
    let isSled: boolean;
    let isRackMounted: boolean;
    let isPdu: boolean;
    let isNetworkCard: boolean;
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
        // set test booleans to false
        isRack = false;
        isSled = false;
        isRackMounted = false;
        isPdu = false;
        isNetworkCard = false;
        // check for rack
        isRack = testValidRack(
          hardware,
          modelData,
        );
        if (isRack) {
          rackHardwareResult[hardwareSysId].push('is a rack');
        }
        // check for sled
        if (!isRack) {
          const resultSled = testValidChassisSled(
            hardwareData,
            hardwareSysId,
          );
          isSled = resultSled.pass;
          if (isSled && parent !== null) {
            if (!Object.prototype.hasOwnProperty.call(rackHardwareChassisSled, parent)) {
              rackHardwareChassisSled[parent] = {};
            }
            rackHardwareChassisSled[parent][hardwareSysId] = true;
          } else {
            rackHardwareResult[hardwareSysId].push(resultSled.failReport);
          }
        }
        // check for rackmounted
        if (!isSled) {
          const resultRackMounted = testValidRackMounted(
            hardware,
            modelData,
          );
          isRackMounted = resultRackMounted.pass;
          if (isRackMounted) {
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
          } else {
            rackHardwareResult[hardwareSysId].push(resultRackMounted.failReport);
          }
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
        // // store leaf switches for network environment query
        // if (tempCiSysId !== null && hardRackSysId !== null) {
        //   if (tempCiName !== null && tempCiName.startsWith('LFAS')) {
        //     netEnvCiSysIdRackSysId[tempCiSysId] = hardRackSysId;
        //   }
        // }
        // this will get replaced with the new maxPorts field in the model table
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
  const getRackZoneData = (
    rackSysIdName: Record<string, string>,
  ) => {
    const rackSysIdRowSysId: Record<string, string> = {};
    const rowNameRowSysId: Record<string, string> = {};
    const rowNameRackNameList: Record<string, Array<string>> = {};
    const rowSysIdRackSysIds: Record<string, Record<string, boolean>> = {};
    const rowSysIdRoomSysId: Record<string, string> = {};
    const rowSysIdRowName: Record<string, string> = {};
    const rowSysIdUnique: Record<string, boolean> = {};
    // @ts-ignore
    const grRackToRow = new GlideRecord('cmdb_rel_ci');
    grRackToRow.addQuery('child', 'IN', Object.keys(rackSysIdName));
    grRackToRow.query();
    while (grRackToRow.next()) {
      // test
      const rackSysId = checkString(grRackToRow.child.getValue());
      const rowSysId = checkString(grRackToRow.parent.getValue());
      // store
      if (rackSysId !== null && rowSysId !== null) {
        rackSysIdRowSysId[rackSysId] = rowSysId;
        rowSysIdUnique[rowSysId] = true;
        // build zone rack relationships
        if (!Object.prototype.hasOwnProperty.call(rowSysIdRackSysIds, rowSysId)) {
          rowSysIdRackSysIds[rowSysId] = {};
        }
        rowSysIdRackSysIds[rowSysId][rackSysId] = true;
      }
    }
    if (Object.keys(rowSysIdUnique).length > 0) {
      // @ts-ignore
      const grRowData = new GlideRecord('cmdb_ci_zone');
      grRowData.addQuery('sys_id', 'IN', Object.keys(rowSysIdUnique));
      grRowData.query();
      while (grRowData.next()) {
        const tempZoneSysId = checkString(grRowData.getUniqueValue());
        const zoneName = checkString(grRowData.name.getValue());
        if (tempZoneSysId !== null && zoneName !== null) {
          rowNameRowSysId[zoneName] = tempZoneSysId;
          rowSysIdRowName[tempZoneSysId] = zoneName;
        }
      }
    }
    // get the relationships between zones and rooms
    // this is used for the 3d button
    if (Object.keys(rowSysIdUnique).length > 0) {
      // @ts-ignore
      const grRowToRoom = new GlideRecord('cmdb_rel_ci');
      grRowToRoom.addQuery('child', 'IN', Object.keys(rowSysIdUnique));
      grRowToRoom.query();
      while (grRowToRoom.next()) {
        // test
        const rowSysId = checkString(grRowToRoom.child.getValue());
        const roomSysId = checkString(grRowToRoom.parent.getValue());
        // store
        if (rowSysId !== null && roomSysId !== null) {
          rowSysIdRoomSysId[rowSysId] = roomSysId;
        }
      }
    }
    // build object where the key is the row name and the value is a list of rack names
    // have a 'Row missing' backup for orphan racks (client side will handle it)
    Object.keys(rackSysIdName).forEach((rackSysId) => {
      const rackName = rackSysIdName[rackSysId];
      let tempRowName = 'Row missing';
      if (Object.prototype.hasOwnProperty.call(rackSysIdRowSysId, rackSysId)) {
        const tempRowSysId = rackSysIdRowSysId[rackSysId];
        if (Object.prototype.hasOwnProperty.call(rowSysIdRowName, tempRowSysId)) {
          tempRowName = rowSysIdRowName[tempRowSysId];
        }
      }
      if (!Object.prototype.hasOwnProperty.call(rowNameRackNameList, tempRowName)) {
        rowNameRackNameList[tempRowName] = [];
      }
      rowNameRackNameList[tempRowName].push(rackName);
    });
    return {
      rackSysIdRowSysId,
      rowNameRackNameList,
      rowNameRowSysId,
      rowSysIdRoomSysId,
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
  //
  //
  //
  //
  //
  //
  //
  //
  //
  // collect data
  const {
    rackData,
    rackNameSysId,
    rackSysIdName,
  } = getRackData(rackSysIdArray);
  const {
    ciSysIdUnique,
    hardwareData,
    hardwareSysIdUnique,
    modelSysIdUnique,
    skuSysIdUnique,
  } = getHardware(rackSysIdArray);
  const {
    rackSysIdRowSysId,
    rowNameRackNameList,
    rowNameRowSysId,
    rowSysIdRoomSysId,
  } = getRackZoneData(rackSysIdName);
  const modelData = getModel(modelSysIdUnique);
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
  //
  //
  //
  //
  //
  //
  //
  //
  //
  // return data
  return {
    ciSysIdUnique,
    collisionHardware,
    hardwareData,
    hardwareSysIdUnique,
    modelData,
    modelSysIdUnique,
    skuSysIdUnique,
    rackData,
    rackHardwareBadData,
    rackHardwareChassisNetwork,
    rackHardwareChassisSled,
    rackHardwarePdu,
    rackHardwareRackMounted,
    rackHardwareResult,
    rackNameSysId,
    rackSysIdName,
    rackSysIdRowSysId,
    rowNameRackNameList,
    rowNameRowSysId,
    rowSysIdRoomSysId,
    usageUnits,
  };
};
const testRackSysIds = ['f4738c21dbb1c7442b56541adc96196a'];
// @ts-ignore
gs.print(getSortedRackHardware(testRackSysIds));
