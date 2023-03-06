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
  const getRackData = (
    tempRackSysIdArray: Array<string>,
  ) => {
    const tempRackData: Record<string, Rack> = {};
    const tempRackNameSysId: Record<string, string> = {};
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
          tempRackData[rackSysId] = {
            rackName,
            rackHeight,
          };
          if (rackName !== null) {
            tempRackNameSysId[rackName] = rackSysId;
          }
        }
      }
    }
    return {
      rackData: tempRackData,
      rackNameSysId: tempRackNameSysId,
    };
  };
  // collect data
  const {
    rackData,
    rackNameSysId,
  } = getRackData(rackSysIdArray);
  const {
    ciSysIdUnique,
    hardwareData,
    hardwareSysIdUnique,
    modelSysIdUnique,
    skuSysIdUnique,
  } = getHardware(rackSysIdArray);
  // return data
  return {
    ciSysIdUnique,
    hardwareData,
    hardwareSysIdUnique,
    modelSysIdUnique,
    skuSysIdUnique,
    rackData,
    rackNameSysId,
  };
};
const testRackSysIds = ['f4738c21dbb1c7442b56541adc96196a'];
// @ts-ignore
gs.print(getSortedRackHardware(testRackSysIds));
