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
        if (parentSysId !== null) {
            if (hardwareData[parentSysId].rackSysId !== hardwareData[hardwareSysId].rackSysId) {
                return {
                    pass: false,
                    testReport: 'not a valid sled - parent not in same rack'
                };
            }
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
    var sortHardware = function (hardware, hardwareData, hardwareSysId, modelData) {
        var allTestResults = [];
        // test for sleds
        var resultSled = testValidChassisSled(hardwareData, hardwareSysId);
        allTestResults.push(resultSled.testReport);
        if (resultSled.pass) {
            return {
                sortName: 'sled',
                allTestResults: allTestResults
            };
        }
        // check for rackmounted
        var resultRackMounted = testValidRackMounted(hardware, modelData);
        allTestResults.push(resultRackMounted.testReport);
        if (resultRackMounted.pass) {
            return {
                sortName: 'rackMounted',
                allTestResults: allTestResults
            };
        }
        // check for pdus
        var resultPdu = testValidPdu(hardware);
        allTestResults.push(resultRackMounted.testReport);
        if (resultPdu.pass) {
            return {
                sortName: 'pdu',
                allTestResults: allTestResults
            };
        }
        // check for network cards
        var resultNetworkCard = testValidChassisNetwork(hardwareData, hardware);
        allTestResults.push(resultRackMounted.testReport);
        if (resultNetworkCard.pass) {
            return {
                sortName: 'networkCard',
                allTestResults: allTestResults
            };
        }
        // test for racks
        var resultRack = testValidRack(hardware, modelData);
        allTestResults.push(resultRack.testReport);
        if (resultRack.pass) {
            return {
                sortName: 'rack',
                allTestResults: allTestResults
            };
        }
        // catch everything else
        return {
            sortName: 'badData',
            allTestResults: allTestResults
        };
    };
    var calculateSortedHardware = function (hardwareData, modelData) {
        var collisionHardware = {};
        var collisionPatchpanel = {};
        var collisionSled = {};
        var hardwareBadData = {};
        var hardwareChassisNetwork = {};
        var hardwareChassisSled = {};
        var hardwarePdu = {};
        var hardwareRackMounted = {};
        var hardwareRacks = {};
        var hardwareResult = {};
        var usageSlots = {};
        var usageUnits = {};
        Object.keys(hardwareData).forEach(function (hardwareSysId) {
            // generate needed variables
            var hardware = hardwareData[hardwareSysId];
            var modelSysId = hardware.modelSysId, parent = hardware.parent, rackSysId = hardware.rackSysId, rackU = hardware.rackU, slot = hardware.slot;
            var slotString = '';
            if (slot !== null) {
                slotString = slot.toString();
            }
            var modelHeight = 0;
            if (modelSysId !== null && Object.prototype.hasOwnProperty.call(modelData, modelSysId)) {
                var testModelHeight = modelData[modelSysId].modelHeight;
                if (testModelHeight !== null) {
                    modelHeight = testModelHeight;
                }
            }
            if (rackSysId !== null) {
                var _a = sortHardware(hardware, hardwareData, hardwareSysId, modelData), sortName = _a.sortName, allTestResults = _a.allTestResults;
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
                            Object.keys(usageSlots[parent][slotString]).forEach(function (collisionSledSysId) {
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
        return {
            collisionHardware: collisionHardware,
            collisionPatchpanel: collisionPatchpanel,
            collisionSled: collisionSled,
            hardwareBadData: hardwareBadData,
            hardwareChassisNetwork: hardwareChassisNetwork,
            hardwareChassisSled: hardwareChassisSled,
            hardwarePdu: hardwarePdu,
            hardwareRackMounted: hardwareRackMounted,
            hardwareRacks: hardwareRacks,
            hardwareResult: hardwareResult,
            usageSlots: usageSlots,
            usageUnits: usageUnits
        };
    };
    var getModel = function (uniqueModelSysId) {
        var modelData = {};
        if (Object.keys(uniqueModelSysId).length > 0) {
            // @ts-ignore
            var grModel = new GlideRecord('cmdb_model');
            grModel.addQuery('sys_id', 'IN', Object.keys(uniqueModelSysId));
            grModel.query();
            while (grModel.next()) {
                var tempModelSysId = checkString(grModel.getUniqueValue());
                if (tempModelSysId !== null) {
                    var firmware = checkString(grModel.u_end_of_software_maintenance_date.getValue());
                    modelData[tempModelSysId] = {
                        deviceCategory: checkString(grModel.u_device_category.getDisplayValue()),
                        displayName: checkString(grModel.display_name.getValue()),
                        endOfFirmwareSupportDate: firmware,
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
        var uniqueCiSysId = {};
        var hardwareData = {};
        var uniqueHardwareSysId = {};
        var uniqueModelSysId = {};
        var uniqueSkuSysId = {};
        if (tempRackSysIdArray.length > 0) {
            // @ts-ignore
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
                var tempBudget = checkString(grHardware.u_provisioning_budget_code.getValue());
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
                        substate: checkString(grHardware.substatus.getValue())
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
                        uniqueModelSysId[tempModelSysId] = true;
                    }
                }
            }
        }
        return {
            uniqueCiSysId: uniqueCiSysId,
            hardwareData: hardwareData,
            uniqueHardwareSysId: uniqueHardwareSysId,
            uniqueModelSysId: uniqueModelSysId,
            uniqueSkuSysId: uniqueSkuSysId
        };
    };
    var getRackData = function (tempRackSysIdArray) {
        var rackData = {};
        var rackNameSysId = {};
        var rackSysIdName = {};
        var uniqueRackSysId = {};
        if (tempRackSysIdArray.length > 0) {
            // @ts-ignore
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
                    uniqueRackSysId[rackSysId] = true;
                }
            }
        }
        return {
            rackData: rackData,
            rackNameSysId: rackNameSysId,
            rackSysIdName: rackSysIdName,
            uniqueRackSysId: uniqueRackSysId
        };
    };
    // collect data
    var _a = getRackData(rackSysIdArray), rackData = _a.rackData, rackNameSysId = _a.rackNameSysId, rackSysIdName = _a.rackSysIdName, uniqueRackSysId = _a.uniqueRackSysId;
    //
    var _b = getHardware(rackSysIdArray), uniqueCiSysId = _b.uniqueCiSysId, hardwareData = _b.hardwareData, uniqueHardwareSysId = _b.uniqueHardwareSysId, uniqueModelSysId = _b.uniqueModelSysId, uniqueSkuSysId = _b.uniqueSkuSysId;
    //
    var modelData = getModel(uniqueModelSysId);
    //
    var _c = calculateSortedHardware(hardwareData, modelData), collisionHardware = _c.collisionHardware, collisionPatchpanel = _c.collisionPatchpanel, collisionSled = _c.collisionSled, hardwareBadData = _c.hardwareBadData, hardwareChassisNetwork = _c.hardwareChassisNetwork, hardwareChassisSled = _c.hardwareChassisSled, hardwarePdu = _c.hardwarePdu, hardwareRackMounted = _c.hardwareRackMounted, hardwareRacks = _c.hardwareRacks, hardwareResult = _c.hardwareResult, usageSlots = _c.usageSlots, usageUnits = _c.usageUnits;
    // return data
    return {
        collisionHardware: collisionHardware,
        collisionPatchpanel: collisionPatchpanel,
        collisionSled: collisionSled,
        hardwareBadData: hardwareBadData,
        hardwareChassisNetwork: hardwareChassisNetwork,
        hardwareChassisSled: hardwareChassisSled,
        hardwareData: hardwareData,
        hardwarePdu: hardwarePdu,
        hardwareRackMounted: hardwareRackMounted,
        hardwareRacks: hardwareRacks,
        hardwareResult: hardwareResult,
        modelData: modelData,
        rackData: rackData,
        rackNameSysId: rackNameSysId,
        rackSysIdName: rackSysIdName,
        uniqueCiSysId: uniqueCiSysId,
        uniqueHardwareSysId: uniqueHardwareSysId,
        uniqueModelSysId: uniqueModelSysId,
        uniqueRackSysId: uniqueRackSysId,
        uniqueSkuSysId: uniqueSkuSysId,
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
// @ts-ignore
var core = redbeardRackHardwareSort(testRackSysIds);
// @ts-ignore
gs.print(core);
