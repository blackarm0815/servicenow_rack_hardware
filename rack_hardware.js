var redbeardRackHardwareSort = function (rackSysIdArray) {
  var checkInteger = function (testVariable) {
    if (typeof testVariable === 'string') {
      if (!Number.isNaN(parseInt(testVariable, 10))) {
        return parseInt(testVariable, 10);
      }
    }
    return null;
  };
  var checkString = function (testVariable) {
    if (typeof testVariable === 'string') {
      if (testVariable !== '') {
        return testVariable;
      }
    }
    return null;
  };
  var testValidChassisNetwork = function (hardwareData, hardware) {
    if (hardware.parent === null) {
      return {
        pass: false,
        testReport: 'not valid network gear - no parent'
      };
    }
    if (!Object.prototype.hasOwnProperty.call(hardwareData, hardware.parent)) {
      return {
        pass: false,
        testReport: 'not valid network gear - parent not found in hardwareData'
      };
    }
    if (hardwareData[hardware.parent].rackSysId !== hardware.rackSysId) {
      return {
        pass: false,
        testReport: 'not valid network gear - parent not in the same rack'
      };
    }
    if (hardware.modelCategoryName !== 'Network Gear') {
      return {
        pass: false,
        testReport: 'not valid network gear - model category is not network gear'
      };
    }
    return {
      pass: true,
      testReport: 'is valid network gear'
    };
  };
  var testValidRackMounted = function (hardware, modelData) {
    if (hardware.parent !== null) {
      return {
        pass: false,
        testReport: 'not a valid rack mounted - has a parent'
      };
    }
    if (hardware.rackU === null) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - u_rack_u is missing'
      };
    }
    if (hardware.rackU === 0) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - u_rack_u is zero'
      };
    }
    if (hardware.modelSysId === null) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - does not have a model'
      };
    }
    if (!Object.prototype.hasOwnProperty.call(modelData, hardware.modelSysId)) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - model not found'
      };
    }
    if (modelData[hardware.modelSysId].modelHeight === null) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - model height is missing'
      };
    }
    if (modelData[hardware.modelSysId].modelHeight === 0) {
      return {
        pass: false,
        testReport: 'not a valid  rack mounted - model height is zero'
      };
    }
    return {
      pass: true,
      testReport: 'is a valid rack mounted'
    };
  };
  var testValidChassisSled = function (hardwareData, hardwareSysId) {
    var parentSysId = hardwareData[hardwareSysId].parent;
    if (hardwareData[hardwareSysId].slot === null) {
      return {
        pass: false,
        testReport: 'not a valid sled - slot missing'
      };
    }
    if (hardwareData[hardwareSysId].slot === 0) {
      return {
        pass: false,
        testReport: 'not a valid sled - slot is zero'
      };
    }
    if (parentSysId === null) {
      return {
        pass: false,
        testReport: 'not a valid sled - parent missing'
      };
    }
    if (parentSysId !== null && !Object.prototype.hasOwnProperty.call(hardwareData, parentSysId)) {
      return {
        pass: false,
        testReport: 'not a valid sled - parent not found in hardwareData'
      };
    }
    if (parentSysId !== null && hardwareData[parentSysId].rackSysId !== hardwareData[hardwareSysId].rackSysId) {
      return {
        pass: false,
        testReport: 'not a valid sled - parent not in same rack'
      };
    }
    return {
      pass: true,
      testReport: 'is a valid sled'
    };
  };
  var testValidPdu = function (hardware) {
    if (hardware.modelCategoryName !== 'PDU') {
      return {
        pass: false,
        testReport: 'not a valid pdu - hardware.modelCategoryName is not PDU'
      };
    }
    return {
      pass: true,
      testReport: 'is a valid pdu'
    };
  };
  var testValidRack = function (hardware, modelData) {
    if (hardware.modelSysId !== null) {
      if (Object.prototype.hasOwnProperty.call(modelData, hardware.modelSysId)) {
        if (modelData[hardware.modelSysId].deviceCategory === 'Rack') {
          return {
            pass: true,
            testReport: 'is a valid rack'
          };
        }
      }
    }
    return {
      pass: false,
      testReport: 'not a valid rack - model deviceCategory is not Rack'
    };
  };
  var calculateSortedHardware = function (hardwareData, modelData) {
    // boolean to stop tests being run once the hardware is identified
    var isUnidentified;
    // datastructures
    var collisionHardware = {};
    var collisionSled = {};
    var rackHardwareBadData = {};
    var rackHardwareChassisNetwork = {};
    var rackHardwareChassisSled = {};
    var rackHardwarePdu = {};
    var rackHardwareRackMounted = {};
    var rackHardwareRacks = {};
    var rackHardwareResult = {};
    var usageSlots = {};
    var usageUnits = {};
    Object.keys(hardwareData).forEach(function (hardwareSysId) {
      // generate needed variables
      var hardware = hardwareData[hardwareSysId];
      var modelSysId = hardware.modelSysId, parent = hardware.parent, rackSysId = hardware.rackSysId, rackU = hardware.rackU, slot = hardware.slot;
      //
      var slotString = '';
      if (slot !== null) {
        slotString = slot.toString();
      }
      //
      var modelHeight = 0;
      if (modelSysId !== null && Object.prototype.hasOwnProperty.call(modelData, modelSysId)) {
        var testModelHeight = modelData[modelSysId].modelHeight;
        if (testModelHeight !== null) {
          modelHeight = testModelHeight;
        }
      }
      //
      if (rackSysId !== null) {
        rackHardwareResult[hardwareSysId] = [];
        isUnidentified = true;
        // check for racks in alm hardware (weird, but it happens)
        var resultRack = testValidRack(hardware, modelData);
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
          var resultSled = testValidChassisSled(hardwareData, hardwareSysId);
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
                Object.keys(usageSlots[parent][slotString]).forEach(function (collisionSledSysId) {
                  collisionSled[collisionSledSysId] = true;
                });
              }
            }
          }
        }
        // check for rackmounted
        if (isUnidentified) {
          var resultRackMounted = testValidRackMounted(hardware, modelData);
          rackHardwareResult[hardwareSysId].push(resultRackMounted.testReport);
          if (resultRackMounted.pass) {
            isUnidentified = false;
            if (!Object.prototype.hasOwnProperty.call(rackHardwareRackMounted, rackSysId)) {
              rackHardwareRackMounted[rackSysId] = {};
            }
            rackHardwareRackMounted[rackSysId][hardwareSysId] = true;
            // build collision data
            if (rackU !== null) {
              var _loop_1 = function (loop) {
                var unitString = (rackU + loop).toString();
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
                  Object.keys(usageUnits[rackSysId][unitString]).forEach(function (collisionSysId) {
                    // alm_hardware or u_patch_panel
                    if (usageUnits[rackSysId][unitString][collisionSysId] === 'alm_hardware') {
                      collisionHardware[collisionSysId] = true;
                    }
                  });
                }
              };
              for (var loop = 0; loop < modelHeight; loop += 1) {
                _loop_1(loop);
              }
            }
          }
        }
        // check for network cards
        if (isUnidentified) {
          var resultNetworkCard = testValidChassisNetwork(hardwareData, hardware);
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
          var resultPdu = testValidPdu(hardware);
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
      collisionHardware: collisionHardware,
      collisionSled: collisionSled,
      rackHardwareBadData: rackHardwareBadData,
      rackHardwareChassisNetwork: rackHardwareChassisNetwork,
      rackHardwareChassisSled: rackHardwareChassisSled,
      rackHardwarePdu: rackHardwarePdu,
      rackHardwareRackMounted: rackHardwareRackMounted,
      rackHardwareRacks: rackHardwareRacks,
      rackHardwareResult: rackHardwareResult,
      usageSlots: usageSlots,
      usageUnits: usageUnits
    };
  };
  var getModel = function (modelSysIdUnique) {
    var modelData = {};
    if (Object.keys(modelSysIdUnique).length > 0) {
      var grModel = new GlideRecord('cmdb_model');
      grModel.addQuery('sys_id', 'IN', Object.keys(modelSysIdUnique));
      grModel.query();
      while (grModel.next()) {
        var tempModelSysId = checkString(grModel.getUniqueValue());
        if (tempModelSysId !== null) {
          modelData[tempModelSysId] = {
            deviceCategory: checkString(grModel.u_device_category.getDisplayValue()),
            displayName: checkString(grModel.display_name.getValue()),
            endOfFirmwareSupportDate: checkString(grModel.u_end_of_software_maintenance_date.getValue()),
            endOfLife: checkString(grModel.u_end_of_life.getValue()),
            endOfSale: checkString(grModel.u_end_of_sale.getValue()),
            maxChildren: checkInteger(grModel.u_max_children.getValue()),
            modelHeight: checkInteger(grModel.rack_units.getValue()),
            modelName: checkString(grModel.name.getValue())
          };
        }
      }
    }
    return modelData;
  };
  var getHardware = function (tempRackSysIdArray) {
    var ciSysIdUnique = {};
    var hardwareData = {};
    var hardwareSysIdUnique = {};
    var modelSysIdUnique = {};
    var skuSysIdUnique = {};
    if (tempRackSysIdArray.length > 0) {
      var grHardware = new GlideRecord('alm_hardware');
      grHardware.addQuery('u_rack', 'IN', tempRackSysIdArray);
      grHardware.query();
      while (grHardware.next()) {
        // used as keys
        var tempHardwareSysId = checkString(grHardware.getUniqueValue());
        var tempCiSysId = checkString(grHardware.ci.getValue());
        var tempCiName = checkString(grHardware.ci.getDisplayValue());
        var tempModelSysId = checkString(grHardware.model.getValue());
        var hardRackSysId = checkString(grHardware.u_rack.getValue());
        var tempSkuSysId = checkString(grHardware.u_hardware_sku.getValue());
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
            substate: checkString(grHardware.substatus.getValue())
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
    }
    return {
      ciSysIdUnique: ciSysIdUnique,
      hardwareData: hardwareData,
      hardwareSysIdUnique: hardwareSysIdUnique,
      modelSysIdUnique: modelSysIdUnique,
      skuSysIdUnique: skuSysIdUnique
    };
  };
  var getRackData = function (tempRackSysIdArray) {
    var rackData = {};
    var rackNameSysId = {};
    var rackSysIdName = {};
    if (tempRackSysIdArray.length > 0) {
      var grRack = new GlideRecord('cmdb_ci_rack');
      grRack.addQuery('sys_id', 'IN', tempRackSysIdArray);
      grRack.query();
      while (grRack.next()) {
        var rackSysId = checkString(grRack.getUniqueValue());
        var rackName = checkString(grRack.name.getValue());
        var rackHeight = checkInteger(grRack.rack_units.getValue());
        if (rackSysId !== null) {
          rackData[rackSysId] = {
            rackName: rackName,
            rackHeight: rackHeight
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
      rackData: rackData,
      rackNameSysId: rackNameSysId,
      rackSysIdName: rackSysIdName
    };
  };
  // collect data
  var _a = getRackData(rackSysIdArray), rackData = _a.rackData, rackNameSysId = _a.rackNameSysId, rackSysIdName = _a.rackSysIdName;
  //
  var _b = getHardware(rackSysIdArray), ciSysIdUnique = _b.ciSysIdUnique, hardwareData = _b.hardwareData, hardwareSysIdUnique = _b.hardwareSysIdUnique, modelSysIdUnique = _b.modelSysIdUnique, skuSysIdUnique = _b.skuSysIdUnique;
  //
  var modelData = getModel(modelSysIdUnique);
  //
  var _c = calculateSortedHardware(hardwareData, modelData), collisionHardware = _c.collisionHardware, collisionSled = _c.collisionSled, rackHardwareBadData = _c.rackHardwareBadData, rackHardwareChassisNetwork = _c.rackHardwareChassisNetwork, rackHardwareChassisSled = _c.rackHardwareChassisSled, rackHardwarePdu = _c.rackHardwarePdu, rackHardwareRackMounted = _c.rackHardwareRackMounted, rackHardwareRacks = _c.rackHardwareRacks, rackHardwareResult = _c.rackHardwareResult, usageSlots = _c.usageSlots, usageUnits = _c.usageUnits;
  // return data
  return {
    ciSysIdUnique: ciSysIdUnique,
    collisionHardware: collisionHardware,
    collisionSled: collisionSled,
    hardwareData: hardwareData,
    hardwareSysIdUnique: hardwareSysIdUnique,
    modelData: modelData,
    modelSysIdUnique: modelSysIdUnique,
    rackData: rackData,
    rackHardwareBadData: rackHardwareBadData,
    rackHardwareChassisNetwork: rackHardwareChassisNetwork,
    rackHardwareChassisSled: rackHardwareChassisSled,
    rackHardwarePdu: rackHardwarePdu,
    rackHardwareRackMounted: rackHardwareRackMounted,
    rackHardwareRacks: rackHardwareRacks,
    rackHardwareResult: rackHardwareResult,
    rackNameSysId: rackNameSysId,
    rackSysIdName: rackSysIdName,
    skuSysIdUnique: skuSysIdUnique,
    usageSlots: usageSlots,
    usageUnits: usageUnits
  };
};
var testRackSysIds = [
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
var results = redbeardRackHardwareSort(testRackSysIds);
gs.print(results);
