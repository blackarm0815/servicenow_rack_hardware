
// interface Color {
//   blue: number;
//   green: number;
//   red: number;
// }
// interface NetworkAdaptor {
//   adaptorName: string;
//   cmdbCiStatus: string;
// }
// interface RackMeta {
//   dimensionX: null | number;
//   dimensionY: null | number;
//   dimensionZ: null | number;
//   dimensionZUnitStart: null | number;
//   environment: null | string;
//   locationX: null | number;
//   locationY: null | number;
//   locationZ: null | number;
//   powerAverageKw: null | number;
//   powerDesignKw: null | number;
//   powerMaximumKw: null | number;
//   powerUpdated: null | number;
//   rackState: null | string;
//   rotation: null | number;
// }



  // const checkTime = (
  //   testVariable: any,
  // ) => {
  //   // @ts-ignore
  //   const tempTime: number | null = new GlideDateTime(testVariable).getNumericValue();
  //   if (tempTime !== 0) {
  //     // @ts-ignore
  //     return tempTime;
  //   }
  //   return null;
  // };

  // const checkFloat = (
  //   testVariable: any,
  // ) => {
  //   if (typeof testVariable === 'string') {
  //     if (!Number.isNaN(parseFloat(testVariable))) {
  //       return parseFloat(testVariable);
  //     }
  //   }
  //   return null;
  // };






  //
  // not returned to client, just for queries
  //
  // group sys_ids
  const groupsUnique: Record<string, boolean> = {};
  // alm_hardware sys_ids
  // manager sys_user sys_ids
  const managerSysIdUnique: Record<string, boolean> = {};
  // cmdb_model sys_ids
  // u_dc_rack_metadata sys_ids
  const rackMetaSysIdUnique: Record<string, boolean> = {};
  // cmdb_ci_service sys_ids
  const serviceSysIdUnique: Record<string, boolean> = {};
  // u_hardware_sku_configurations sys_ids
  // switches ci sys_ids, used for network adaptor queries
  const switchCiUnique: Record<string, boolean> = {};
  //
  // returned to client
  //
  // cmdb_ci_hardware sys_id, data from cmdb_ci_hardware
  const ciData: Record<string, CiData> = {};
  // unique cmdb_ci_hardware sys_id, passed to client side for change and incident queries
  // sleds that are in a collision
  // alm_hardware sys_id, true
  const collisionSled: Record<string, boolean> = {};
  // hardware that is in a collision
  // alm_hardware sys_id, true
  // patchpanels that are in a collision
  // u_patch_panel sys_id, true
  const collisionPatchpanel: Record<string, boolean> = {};
  // group sys_id to manager sys_id
  // sys_user_group sys_id, sys_user sys_id
  // related to managerSysIdName
  const groupSysIdManagerSysId: Record<string, string> = {};
  // rack sys_id, hardware sys_id, true
  const hardwareBadData: Record<string, Record<string, boolean>> = {};
  // actual hardware data from alm_hardware
  // chassis sys_id, network card sys_id, true
  const hardwareChassisNetwork: Record<string, Record<string, boolean>> = {};
  // chassis sys_id, sled sys_id, true
  const hardwareChassisSled: Record<string, Record<string, boolean>> = {};
  // rack sys_id, pdu hardware sys_id, true
  const hardwarePdu: Record<string, Record<string, boolean>> = {};
  // rack sys_id, hardware sys_id, true
  const hardwareRackMounted: Record<string, Record<string, boolean>> = {};
  // reasons why hardware failed the various tests
  // hardware sys_id, array of failures
  // u_hardware_sku_configurations sys_id, derate kw as float
  const hardwareSkuSysIdDerateKw: Record<string, number> = {};
  // u_hardware_sku_configurations sys_id, name
  const hardwareSkuSysIdName: Record<string, string> = {};
  // sys_user sys_id, manager name string
  // related to groupSysIdManagerSysId
  const managerSysIdName: Record<string, string> = {};
  // cmdb_model sys_id, data from cmdb_model
  const modelData: Record<string, Model> = {};
  // cmdb_ci_network_adapter ports on switches in the racks
  // first key is switch alm_hardware sys_id
  // second key is adaaptors cmdb_ci_network_adapter sys_id
  const networkAdaptorsLocal: Record<string, Record<string, NetworkAdaptor>> = {};
  // cmdb_ci_network_adapter ports on other machiens that connect to switches in the racks
  // first key is switch alm_hardware sys_id
  // second key is the cmdb_ci_network_adapter sys_id of the port on the switch
  // third key is the cmdb_ci_network_adapter sys_id of the remote port (allows duplicates)
  // first key is ci sys_id from alm_hardware
  // second key is rack sys_id
  // this is used when finding the network environment of racks
  const netEnvCiSysIdRackSysId: Record<string, string> = {};
  // first key is cmdb_ci_rack sys_id
  // second key is u_patch_panel sys_id
  // true if patchpanel is bad data
  const patchpanelBadData: Record<string, Record<string, boolean>> = {};
  // key is u_patch_panel sys_id
  // value is patchpanel data
  // first key is cmdb_ci_rack sys_id
  // second key is u_patch_panel sys_id of patchpanel in rack
  // boolean only true
  const patchpanelRackMounted: Record<string, Record<string, boolean>> = {};
  // reasons why patchpanels ended up in patchpanelBadData
  // key is u_patch_panel sys_id
  // value is failure
  // unlike hardwareSortResult this does not have an array of failures
  // since patchpanels only have one test
  const patchpanelSortResult: Record<string, string> = {};
  // key is cmdb_ci_service sys_id
  // value is u_ci_business_service_rollup name
  const primaryBusinessProduct: Record<string, string> = {};
  // a color for each rack. the colors are generated client side.
  // key is cmdb_ci_rack sys_id
  const rackColor: Record<string, Color> = {};
  // data from cmdb_ci_rack
  // key is cmdb_ci_rack sys_id
  const rackData: Record<string, Rack> = {};
  // data from u_dc_rack_metadata
  // key is u_dc_rack_metadata sys_id
  const rackMetaData: Record<string, RackMeta> = {};
  // key is rack name from cmdb_ci_rack
  // value is cmdb_ci_rack sys_id
  const rackNameRackSysId: Record<string, string> = {};
  // rack reservations
  // key is cmdb_ci_rack sys_id
  // second key is u_reservation_rack sys_id
  // rack network environments (from switches in racks)
  // first key is cmdb_ci_rack sys_id
  // second key is u_cmdb_ci_network_environment name
  const rackSysIdNetEnv: Record<string, string> = {};
  // key is cmdb_ci_rack sys_id
  // value is cmdb_ci_rack name
  const rackSysIdRackName: Record<string, string> = {};
  // first key is cmdb_ci_rack sys_id
  // second key is the unit number
  // third key is u_reservation_rack_unit sys_id (allows multiple per unit)
  // key is ci sys_id
  // if hardware's ci appears in sc_req_item it indicates it is Pending hardware reclaim
  const scReqItemCI: Record<string, boolean> = {};
  // first key is chassis alm_hardware sys_id
  // second key is slot number
  // third key is reservation u_reservation_slot sys_id
  const slotReservation: Record<string, Record<number, Record<string, Reservation>>> = {};
  // first key is rack sys_id
  // second key is unit as string
  // third string is either alm_hardware or u_patch_panel sys_id
  // value is the table (alm_hardware or u_patch_panel)
  // first string is chassis alm_hardware sys_id
  // second key is slot as string
  // third key is sled alm_hardware sys_id
  const usageSlots: Record<string, Record<string, Record<string, true>>> = {};
  //
  //
  //
  //
  const errorLog = (
    functionName: string,
    errorMessage: string,
  ) => {
    // @ts-ignore
    const testStringUndefined: string | undefined = gs.getUserName();
    if (testStringUndefined !== undefined) {
      let logMessage = `Error - function ${functionName} failed for `;
      // @ts-ignore
      logMessage += `${testStringUndefined} with error ${errorMessage}`;
      // @ts-ignore
      gs.error(logMessage, 'rack_view');
      // @ts-ignore
      gs.addErrorMessage(`Error encountered in function ${functionName}`, errorMessage);
    }
  };
  const testValidChassisSled = (
    tempHardwareSysId: string,
  ) => {
    const hardware = hardwareData[tempHardwareSysId];
    try {
      if (hardware.slot === null) {
        return {
          pass: false,
          failReport: 'not a valid sled - slot missing',
        };
      }
      if (hardware.slot === 0) {
        return {
          pass: false,
          failReport: 'not a valid sled - slot is zero',
        };
      }
      if (hardware.parent === null) {
        return {
          pass: false,
          failReport: 'not a valid sled - parent missing',
        };
      }
      if (!Object.prototype.hasOwnProperty.call(hardwareData, hardware.parent)) {
        return {
          pass: false,
          failReport: 'not a valid sled - parent not found in hardwareData',
        };
      }
      if (hardwareData[hardware.parent].rackSysId !== hardware.rackSysId) {
        return {
          pass: false,
          failReport: 'not a valid sled - parent not in same rack',
        };
      }
      return {
        pass: true,
        failReport: '',
      };
    } catch (err) {
      errorLog('testValidChassisSled', <string>err);
      return {
        pass: false,
        failReport: 'not a valid sled - function crashed',
      };
    }
  };
  const testValidChassisNetwork = (
    hardwareSysId: string,
  ) => {
    const hardware = hardwareData[hardwareSysId];
    try {
      if (hardware.parent === null) {
        return {
          pass: false,
          failReport: 'not valid network gear - no parent',
        };
      }
      if (!Object.prototype.hasOwnProperty.call(hardwareData, hardware.parent)) {
        return {
          pass: false,
          failReport: 'not valid network gear - parent not found in hardwareData',
        };
      }
      if (hardwareData[hardware.parent].rackSysId !== hardware.rackSysId) {
        return {
          pass: false,
          failReport: 'not valid network gear - parent not in the same rack',
        };
      }
      if (hardware.modelCategoryName !== 'Network Gear') {
        return {
          pass: false,
          failReport: 'not valid network gear - model category is not network gear',
        };
      }
      return {
        pass: true,
        failReport: '',
      };
    } catch (err) {
      errorLog('testValidChassisNetwork', <string>err);
      return {
        pass: false,
        failReport: 'not valid network gear - function crashed',
      };
    }
  };
  const storePatchpanelBadData = (
    patchpanelSysId: string,
    rackSysId: string,
  ) => {
    if (!Object.prototype.hasOwnProperty.call(patchpanelBadData, rackSysId)) {
      patchpanelBadData[rackSysId] = {};
    }
    patchpanelBadData[rackSysId][patchpanelSysId] = true;
  };
  const generateUsageUnits = (
    modelHeight: number,
    rackSysId: string,
    rackU: number,
    sysId: string,
    table: string,
  ) => {
    for (let loop = 0; loop < modelHeight; loop += 1) {
      const unitString = (rackU + loop).toString();
      // generate usage
      if (!Object.prototype.hasOwnProperty.call(usageUnits, rackSysId)) {
        usageUnits[rackSysId] = {};
      }
      if (!Object.prototype.hasOwnProperty.call(usageUnits[rackSysId], unitString)) {
        usageUnits[rackSysId][unitString] = {};
      }
      usageUnits[rackSysId][unitString][sysId] = table;
      // deal with duplicates
      if (Object.keys(usageUnits[rackSysId][unitString]).length > 1) {
        Object.keys(usageUnits[rackSysId][unitString]).forEach((collisionSysId) => {
          // alm_hardware or u_patch_panel
          if (usageUnits[rackSysId][unitString][collisionSysId] === 'alm_hardware') {
            collisionHardware[collisionSysId] = true;
          }
          if (usageUnits[rackSysId][unitString][collisionSysId] === 'u_patch_panel') {
            collisionPatchpanel[collisionSysId] = true;
          }
        });
      }
    }
  };
  const storeHardwareBadData = (
    hardwareSysId: string,
  ) => {
    const hardware = hardwareData[hardwareSysId];
    const { rackSysId } = hardware;
    if (!Object.prototype.hasOwnProperty.call(hardwareBadData, rackSysId)) {
      hardwareBadData[rackSysId] = {};
    }
    hardwareBadData[rackSysId][hardwareSysId] = true;
  };
  const testPdu = (
    hardwareSysId: string,
  ) => {
    const hardware = hardwareData[hardwareSysId];
    const { rackSysId } = hardware;
    if (hardware.modelCategoryName === 'PDU') {
      if (!Object.prototype.hasOwnProperty.call(hardwarePdu, rackSysId)) {
        hardwarePdu[rackSysId] = {};
      }
      hardwarePdu[rackSysId][hardwareSysId] = true;
    } else {
      hardwareSortResult[hardwareSysId].push('modelCategoryName was not PDU');
      storeHardwareBadData(hardwareSysId);
    }
  };
  const testNetworkCards = (
    hardwareSysId: string,
  ) => {
    const sortResult = testValidChassisNetwork(hardwareSysId);
    const chassisSysId = hardwareData[hardwareSysId].parent;
    if (sortResult.pass && chassisSysId !== null) {
      if (!Object.prototype.hasOwnProperty.call(hardwareChassisNetwork, chassisSysId)) {
        hardwareChassisNetwork[chassisSysId] = {};
      }
      hardwareChassisNetwork[chassisSysId][hardwareSysId] = true;
    } else {
      hardwareSortResult[hardwareSysId].push(sortResult.failReport);
      testPdu(hardwareSysId);
    }
  };
  const testRackMounted = (
    hardwareSysId: string,
  ) => {
    const sortResult = testValidRackMounted(hardwareSysId);
    const { modelSysId } = hardwareData[hardwareSysId];
    const { rackSysId } = hardwareData[hardwareSysId];
    const { rackU } = hardwareData[hardwareSysId];
    if (sortResult.pass && rackU !== null) {
      if (!Object.prototype.hasOwnProperty.call(hardwareRackMounted, rackSysId)) {
        hardwareRackMounted[rackSysId] = {};
      }
      hardwareRackMounted[rackSysId][hardwareSysId] = true;
      // generate usageUnits for collision testing
      let modelHeight = 0;
      if (modelSysId !== null) {
        if (Object.prototype.hasOwnProperty.call(modelData, modelSysId)) {
          const testModelHeight = modelData[modelSysId].modelHeight;
          if (testModelHeight !== null) {
            modelHeight = testModelHeight;
          }
        }
      }
      generateUsageUnits(
        modelHeight,
        rackSysId,
        rackU,
        hardwareSysId,
        'alm_hardware',
      );
    } else {
      hardwareSortResult[hardwareSysId].push(sortResult.failReport);
      // test for network cards
      testNetworkCards(hardwareSysId);
    }
  };
  const generateUsageSlots = (
    sledSysId: string,
    testParent: string,
    testSlot: number,
  ) => {
    const slotString = testSlot.toString();
    // generate usage
    if (!Object.prototype.hasOwnProperty.call(usageSlots, testParent)) {
      usageSlots[testParent] = {};
    }
    if (!Object.prototype.hasOwnProperty.call(usageSlots[testParent], slotString)) {
      usageSlots[testParent][slotString] = {};
    }
    usageSlots[testParent][slotString][sledSysId] = true;
    // deal with duplicates
    if (Object.keys(usageSlots[testParent][slotString]).length > 1) {
      Object.keys(usageSlots[testParent][slotString]).forEach((collisionSledSysId) => {
        collisionSled[collisionSledSysId] = true;
      });
    }
  };
  const testSleds = (
    hardwareSysId: string,
  ) => {
    const sortResult = testValidChassisSled(hardwareSysId);
    const testParent = hardwareData[hardwareSysId].parent;
    const testSlot = hardwareData[hardwareSysId].slot;
    if (sortResult.pass && testParent !== null && testSlot !== null) {
      // valid sled detected
      if (!Object.prototype.hasOwnProperty.call(hardwareChassisSled, testParent)) {
        hardwareChassisSled[testParent] = {};
      }
      hardwareChassisSled[testParent][hardwareSysId] = true;
      generateUsageSlots(
        hardwareSysId,
        testParent,
        testSlot,
      );
    } else {
      hardwareSortResult[hardwareSysId].push(sortResult.failReport);
      testRackMounted(hardwareSysId);
    }
  };
  const calculateSortedHardware = () => {
    let ignore: boolean;
    Object.keys(hardwareData).forEach((hardwareSysId) => {
      // create array to store sort failures
      hardwareSortResult[hardwareSysId] = [];
      const hardware = hardwareData[hardwareSysId];
      const { rackSysId } = hardware;
      if (rackSysId !== null) {
        // ignore racks
        ignore = false;
        if (hardware.modelSysId !== null) {
          if (Object.prototype.hasOwnProperty.call(modelData, hardware.modelSysId)) {
            if (modelData[hardware.modelSysId].deviceCategory === 'Rack') {
              ignore = true;
              hardwareSortResult[hardwareSysId].push('it is a rack');
            }
          }
        }
        if (ignore === false) {
          // start testing with sleds
          testSleds(hardwareSysId);
        }
      }
    });
    // @ts-ignore
    data.hardwareBadData = hardwareBadData;
    // @ts-ignore
    data.hardwareChassisNetwork = hardwareChassisNetwork;
    // @ts-ignore
    data.hardwareChassisSled = hardwareChassisSled;
    // @ts-ignore
    data.hardwareData = hardwareData;
    // @ts-ignore
    data.hardwarePdu = hardwarePdu;
    // @ts-ignore
    data.hardwareRackMounted = hardwareRackMounted;
    // @ts-ignore
    data.hardwareSortResult = hardwareSortResult;
    // @ts-ignore
    data.patchpanelData = patchpanelData;
    // @ts-ignore
    data.patchpanelBadData = patchpanelBadData;
    // @ts-ignore
    data.patchpanelRackMounted = patchpanelRackMounted;
    // @ts-ignore
    data.patchpanelSortResult = patchpanelSortResult;
  };

  const getData = (
    rackSysIdList: Array<string>,
  ) => {
      getRackZoneData();
      // @ts-ignore
      const grRackMeta = new GlideRecord('u_dc_rack_metadata');
      grRackMeta.addQuery('sys_id', 'IN', Object.keys(rackMetaSysIdUnique));
      grRackMeta.query();
      while (grRackMeta.next()) {
        const tempMetaSysId: string = grRackMeta.getUniqueValue();
        rackMetaData[tempMetaSysId] = {
          dimensionX: checkFloat(grRackMeta.u_dimension_x.getValue()),
          dimensionY: checkFloat(grRackMeta.u_dimension_y.getValue()),
          dimensionZ: checkFloat(grRackMeta.u_dimension_z.getValue()),
          dimensionZUnitStart: checkFloat(grRackMeta.u_dimension_z_unit_start.getValue()),
          environment: checkString(grRackMeta.u_environment.getDisplayValue()),
          locationX: checkFloat(grRackMeta.u_location_x.getValue()),
          locationY: checkFloat(grRackMeta.u_location_y.getValue()),
          locationZ: checkFloat(grRackMeta.u_location_z.getValue()),
          powerAverageKw: checkFloat(grRackMeta.u_power_average_kw.getValue()),
          powerMaximumKw: checkFloat(grRackMeta.u_power_maximum_kw.getValue()),
          powerDesignKw: checkFloat(grRackMeta.u_power_design_kw.getValue()),
          powerUpdated: checkTime(grRackMeta.u_power_updated.getValue()),
          rackState: checkString(grRackMeta.u_state.getDisplayValue()),
          rotation: checkInteger(grRackMeta.u_rotation.getValue()),
        };
      }






















      if (Object.keys(netEnvCiSysIdRackSysId).length > 0) {
        // @ts-ignore
        const grNetEnv = new GlideRecord('cmdb_ci_ip_switch');
        grNetEnv.addQuery('sys_id', 'IN', Object.keys(netEnvCiSysIdRackSysId));
        grNetEnv.addNotNullQuery('u_network_environment');
        grNetEnv.query();
        while (grNetEnv.next()) {
          // safe
          const testNetEnvCiSysId = checkString(grNetEnv.getUniqueValue());
          const testNetEnvName = checkString(grNetEnv.u_network_environment.getDisplayValue());
          if (testNetEnvCiSysId !== null && testNetEnvName !== null) {
            // find the rack sys_id
            if (Object.prototype.hasOwnProperty.call(netEnvCiSysIdRackSysId, testNetEnvCiSysId)) {
              const netEnvRackSysId = netEnvCiSysIdRackSysId[testNetEnvCiSysId];
              // store
              rackSysIdNetEnv[netEnvRackSysId] = testNetEnvName;
            }
          }
        }
      }
      if (Object.keys(hardwareSysIdUnique).length > 0) {
        // @ts-ignore
        const grResSlot = new GlideRecord('u_reservation_slot');
        grResSlot.addQuery('u_chassis', 'IN', Object.keys(hardwareSysIdUnique));
        grResSlot.query();
        while (grResSlot.next()) {
          const tempResSlotSysId = checkString(grResSlot.getUniqueValue());
          const tempSlot = checkInteger(grResSlot.u_slot.getValue());
          const tempChassisSysId = checkString(grResSlot.u_chassis.getValue());
          if (tempChassisSysId !== null && tempResSlotSysId !== null) {
            if (!Object.prototype.hasOwnProperty.call(slotReservation, tempChassisSysId)) {
              slotReservation[tempChassisSysId] = {};
            }
            if (tempSlot !== null) {
              if (!Object.prototype.hasOwnProperty.call(slotReservation[tempChassisSysId], tempSlot)) {
                slotReservation[tempChassisSysId][tempSlot] = {};
              }
              slotReservation[tempChassisSysId][tempSlot][tempResSlotSysId] = {
                jiraUrl: checkJiraUrl(grResSlot.u_jira_url.getValue()),
                reservationMade: checkTime(grResSlot.sys_created_on.getValue()),
                reservationExpires: checkTime(grResSlot.u_reservation_ends.getValue()),
                reservationType: 'slot',
                userName: checkString(grResSlot.sys_created_by.getValue()),
              };
            }
          }
        }
      }
      if (Object.keys(skuSysIdUnique).length > 0) {
        // @ts-ignore
        const grHardwareSku = new GlideRecord('u_hardware_sku_configurations');
        grHardwareSku.addQuery('sys_id', 'IN', Object.keys(skuSysIdUnique));
        grHardwareSku.query();
        while (grHardwareSku.next()) {
          const derateKw = checkFloat(grHardwareSku.u_derate_kw.getValue());
          const hardwareSkuName = checkString(grHardwareSku.u_sku_name.getValue());
          const tempSkuSysId = checkString(grHardwareSku.getUniqueValue());
          if (hardwareSkuName !== null && tempSkuSysId !== null) {
            hardwareSkuSysIdName[tempSkuSysId] = hardwareSkuName;
          }
          if (derateKw !== null && tempSkuSysId !== null) {
            hardwareSkuSysIdDerateKw[tempSkuSysId] = derateKw;
          }
        }
      }
      if (Object.keys(groupsUnique).length > 0) {
        // @ts-ignore
        const grGroup = new GlideRecord('sys_user_group');
        grGroup.addQuery('sys_id', 'IN', Object.keys(groupsUnique));
        grGroup.query();
        while (grGroup.next()) {
          const tempUserGroupSysId = checkString(grGroup.getUniqueValue());
          const tempSserGroupManager = checkString(grGroup.manager.getValue());
          // store
          if (tempUserGroupSysId !== null && tempSserGroupManager !== null) {
            groupSysIdManagerSysId[tempUserGroupSysId] = tempSserGroupManager;
            managerSysIdUnique[tempSserGroupManager] = true;
          }
        }
      }
      if (Object.keys(managerSysIdUnique).length > 0) {
        // @ts-ignore
        const grManager = new GlideRecord('sys_user');
        grManager.addQuery('sys_id', 'IN', Object.keys(managerSysIdUnique));
        grManager.query();
        while (grManager.next()) {
          const tempSysUserName = checkString(grManager.name.getValue());
          const tempUserSysId = checkString(grManager.getUniqueValue());
          if (tempSysUserName !== null && tempUserSysId !== null) {
            managerSysIdName[tempUserSysId] = tempSysUserName;
          }
        }
      }
      if (Object.keys(serviceSysIdUnique).length > 0) {
        // @ts-ignore
        const grPrimary = new GlideRecord('cmdb_ci_service');
        grPrimary.addQuery('sys_id', 'IN', Object.keys(serviceSysIdUnique));
        grPrimary.query();
        while (grPrimary.next()) {
          const tempServiceName = checkString(grPrimary.u_business_service_rollup.getDisplayValue());
          const tempServiceSysId = checkString(grPrimary.getUniqueValue());
          if (tempServiceName !== null && tempServiceSysId !== null) {
            primaryBusinessProduct[tempServiceSysId] = tempServiceName;
          }
        }
      }
      if (Object.keys(ciSysIdUnique).length > 0) {
        // @ts-ignore
        const grScReqItem = new GlideRecord('sc_req_item');
        grScReqItem.addQuery('cmdb_ci', 'IN', Object.keys(ciSysIdUnique));
        grScReqItem.query();
        while (grScReqItem.next()) {
          const tempScReqItemCmdbCi = checkString(grScReqItem.cmdb_ci.getValue());
          if (tempScReqItemCmdbCi !== null) {
            scReqItemCI[tempScReqItemCmdbCi] = true;
          }
        }
      }
      // network adaptors
      // @ts-ignore
      const portLocal = new GlideRecord('cmdb_ci_network_adapter');
      portLocal.addQuery('cmdb_ci', 'IN', Object.keys(switchCiUnique));
      // portLocal.addEncodedQuery('nameSTARTSWITHeth');
      portLocal.query();
      while (portLocal.next()) {
        const adaptorSysId = checkString(portLocal.getUniqueValue());
        const localAdaptorName = checkStringWithDefault('name missing', portLocal.name.getValue());
        const localCmdbCiStatus = checkStringWithDefault('status missing', portLocal.u_cmdb_ci_status.getDisplayValue());
        const switchCiSysId = checkString(portLocal.cmdb_ci.getValue());
        if (adaptorSysId !== null && switchCiSysId !== null) {
          if (!Object.prototype.hasOwnProperty.call(networkAdaptorsLocal, switchCiSysId)) {
            networkAdaptorsLocal[switchCiSysId] = {};
          }
          networkAdaptorsLocal[switchCiSysId][adaptorSysId] = {
            adaptorName: localAdaptorName,
            cmdbCiStatus: localCmdbCiStatus,
          };
        }
      }
      calculateSortedHardware();
    }
    // @ts-ignore
    data.collisionHardware = collisionHardware;
    // @ts-ignore
    data.collisionPatchpanel = collisionPatchpanel;
    // @ts-ignore
    data.collisionSled = collisionSled;
    // @ts-ignore
    data.ciData = ciData;
    // @ts-ignore
    data.ciSysIdUnique = ciSysIdUnique;
    // @ts-ignore
    data.groupSysIdManagerSysId = groupSysIdManagerSysId;
    // @ts-ignore
    data.hardwareSkuSysIdDerateKw = hardwareSkuSysIdDerateKw;
    // @ts-ignore
    data.hardwareSkuSysIdName = hardwareSkuSysIdName;
    // @ts-ignore
    data.managerSysIdName = managerSysIdName;
    // @ts-ignore
    data.modelData = modelData;
    // @ts-ignore
    data.networkAdaptorsRemote = networkAdaptorsRemote;
    // @ts-ignore
    data.networkAdaptorsLocal = networkAdaptorsLocal;
    // @ts-ignore
    data.primaryBusinessProduct = primaryBusinessProduct;
    // @ts-ignore
    data.rackColor = rackColor;
    // @ts-ignore
    data.rackData = rackData;
    // @ts-ignore
    data.rackMetaData = rackMetaData;
    // @ts-ignore
    data.rackNameRackSysId = rackNameRackSysId;
    // @ts-ignore
    data.rackReservation = rackReservation;
    // @ts-ignore
    data.rackSysIdNetEnv = rackSysIdNetEnv;
    // @ts-ignore
    data.rackSysIdRackName = rackSysIdRackName;
    // @ts-ignore
    data.rackUnitReservation = rackUnitReservation;
    // @ts-ignore
    data.scReqItemCI = scReqItemCI;
    // @ts-ignore
    data.skuSysIdUnique = skuSysIdUnique;
    // @ts-ignore
    data.slotReservation = slotReservation;
    // @ts-ignore
    data.usageSlots = usageSlots;
    // @ts-ignore
    data.usageUnits = usageUnits;
  };
  getData(rackSysIdArray);