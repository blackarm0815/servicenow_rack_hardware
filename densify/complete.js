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
    var testValidPatchpanel = function (patchpanel, modelData) {
        if (patchpanel.patchRackU === null) {
            return {
                pass: false,
                testReport: 'not a valid  patchpanel - u_rack_u is missing'
            };
        }
        if (patchpanel.patchRackU === 0) {
            return {
                pass: false,
                testReport: 'not a valid  patchpanel - u_rack_u is zero'
            };
        }
        if (patchpanel.patchModelSysId === null) {
            return {
                pass: false,
                testReport: 'not a valid patchpanel - does not have a model'
            };
        }
        if (!Object.prototype.hasOwnProperty.call(modelData, patchpanel.patchModelSysId)) {
            return {
                pass: false,
                testReport: 'not a valid patchpanel - model not found'
            };
        }
        var model = modelData[patchpanel.patchModelSysId];
        if (model.modelHeight === null) {
            return {
                pass: false,
                testReport: 'not a valid patchpanel - model height missing'
            };
        }
        if (model.modelHeight < 1) {
            return {
                pass: false,
                testReport: 'not a valid patchpanel - model height is less than 1'
            };
        }
        return {
            pass: true,
            testReport: 'is a valid patchpanel'
        };
    };
    var calculateSortedHardware = function (hardwareData, modelData, patchpanelData) {
        // boolean to stop tests being run once the hardware is identified
        var isUnidentified;
        // datastructures
        var collisionHardware = {};
        var collisionPatchpanel = {};
        var collisionSled = {};
        var patchpanelBadData = {};
        var patchpanelRackMounted = {};
        var patchpanelSortResult = {};
        var rackHardwareBadData = {};
        var rackHardwareChassisNetwork = {};
        var rackHardwareChassisSled = {};
        var rackHardwarePdu = {};
        var rackHardwareRackMounted = {};
        var rackHardwareRacks = {};
        var rackHardwareResult = {};
        var usageSlots = {};
        var usageUnits = {};
        //
        // process hardware
        //
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
        //
        // process patchpanels
        //
        Object.keys(patchpanelData).forEach(function (patchpanelSysId) {
            var patchRackSysId = patchpanelData[patchpanelSysId].patchRackSysId;
            var _a = patchpanelData[patchpanelSysId], patchModelSysId = _a.patchModelSysId, patchRackU = _a.patchRackU;
            var modelHeight = 0;
            if (patchModelSysId !== null && Object.prototype.hasOwnProperty.call(modelData, patchModelSysId)) {
                var testModelHeight = modelData[patchModelSysId].modelHeight;
                if (testModelHeight !== null) {
                    modelHeight = testModelHeight;
                }
            }
            if (patchRackSysId) {
                // check if patchpanel is valid
                var resultPanel = testValidPatchpanel(patchpanelData[patchpanelSysId], modelData);
                patchpanelSortResult[patchpanelSysId] = resultPanel.testReport;
                if (resultPanel.pass) {
                    // valid patchpanel
                    if (!Object.prototype.hasOwnProperty.call(patchpanelRackMounted, patchRackSysId)) {
                        patchpanelRackMounted[patchRackSysId] = {};
                    }
                    patchpanelRackMounted[patchRackSysId][patchpanelSysId] = true;
                    // build collision data
                    if (patchRackU !== null) {
                        var _loop_2 = function (loop) {
                            var unitString = (patchRackU + loop).toString();
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
                                Object.keys(usageUnits[patchRackSysId][unitString]).forEach(function (collisionSysId) {
                                    // alm_hardware or u_patch_panel
                                    if (usageUnits[patchRackSysId][unitString][collisionSysId] === 'alm_hardware') {
                                        collisionHardware[collisionSysId] = true;
                                    }
                                    if (usageUnits[patchRackSysId][unitString][collisionSysId] === 'u_patch_panel') {
                                        collisionPatchpanel[collisionSysId] = true;
                                    }
                                });
                            }
                        };
                        for (var loop = 0; loop < modelHeight; loop += 1) {
                            _loop_2(loop);
                        }
                    }
                    // generate unit usage and check for collisions
                }
                else {
                    // bad patchpanel
                    if (!Object.prototype.hasOwnProperty.call(patchpanelBadData, patchRackSysId)) {
                        patchpanelBadData[patchRackSysId] = {};
                    }
                    patchpanelBadData[patchRackSysId][patchpanelSysId] = true;
                }
            }
        });
        return {
            collisionHardware: collisionHardware,
            collisionPatchpanel: collisionPatchpanel,
            collisionSled: collisionSled,
            patchpanelBadData: patchpanelBadData,
            patchpanelRackMounted: patchpanelRackMounted,
            patchpanelSortResult: patchpanelSortResult,
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
    var getModel = function (uniqueHardwareModelSysId) {
        var modelData = {};
        if (Object.keys(uniqueHardwareModelSysId).length > 0) {
            // @ts-ignore
            var grModel = new GlideRecord('cmdb_model');
            grModel.addQuery('sys_id', 'IN', Object.keys(uniqueHardwareModelSysId));
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
        var uniqueCiSysId = {};
        var hardwareData = {};
        var uniqueHardwareSysId = {};
        var uniqueHardwareModelSysId = {};
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
            uniqueCiSysId: uniqueCiSysId,
            hardwareData: hardwareData,
            uniqueHardwareSysId: uniqueHardwareSysId,
            uniqueHardwareModelSysId: uniqueHardwareModelSysId,
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
    var getPatchPanelData = function (testRackSysIds, uniqueHardwareModelSysId) {
        var patchpanelData = {};
        // take the hardware model sys_ids and add the patchpanel model sys_ids
        var uniqueModelSysId = uniqueHardwareModelSysId;
        // @ts-ignore
        var grPatch = new GlideRecord('u_patch_panel');
        grPatch.addQuery('u_rack', 'IN', testRackSysIds);
        grPatch.query();
        while (grPatch.next()) {
            var tempPatchPanelSysId = checkString(grPatch.getUniqueValue());
            var tempPatchModelSysId = checkString(grPatch.model_id.getValue());
            if (tempPatchPanelSysId !== null) {
                patchpanelData[tempPatchPanelSysId] = {
                    patchAssetTag: checkString(grPatch.asset_tag.getValue()),
                    patchModelSysId: tempPatchModelSysId,
                    patchName: checkString(grPatch.name.getValue()),
                    patchRackSysId: checkString(grPatch.u_rack.getValue()),
                    patchRackU: checkInteger(grPatch.u_rack_u.getValue())
                };
            }
            if (tempPatchModelSysId !== null) {
                uniqueModelSysId[tempPatchModelSysId] = true;
            }
        }
        return {
            patchpanelData: patchpanelData,
            uniqueModelSysId: uniqueModelSysId
        };
    };
    // collect data
    var _a = getRackData(rackSysIdArray), rackData = _a.rackData, rackNameSysId = _a.rackNameSysId, rackSysIdName = _a.rackSysIdName, uniqueRackSysId = _a.uniqueRackSysId;
    //
    var _b = getHardware(rackSysIdArray), uniqueCiSysId = _b.uniqueCiSysId, hardwareData = _b.hardwareData, uniqueHardwareSysId = _b.uniqueHardwareSysId, uniqueHardwareModelSysId = _b.uniqueHardwareModelSysId, uniqueSkuSysId = _b.uniqueSkuSysId;
    //
    var _c = getPatchPanelData(rackSysIdArray, uniqueHardwareModelSysId), patchpanelData = _c.patchpanelData, uniqueModelSysId = _c.uniqueModelSysId;
    //
    var modelData = getModel(uniqueModelSysId);
    //
    var _d = calculateSortedHardware(hardwareData, modelData, patchpanelData), collisionHardware = _d.collisionHardware, collisionPatchpanel = _d.collisionPatchpanel, collisionSled = _d.collisionSled, patchpanelBadData = _d.patchpanelBadData, patchpanelRackMounted = _d.patchpanelRackMounted, patchpanelSortResult = _d.patchpanelSortResult, rackHardwareBadData = _d.rackHardwareBadData, rackHardwareChassisNetwork = _d.rackHardwareChassisNetwork, rackHardwareChassisSled = _d.rackHardwareChassisSled, rackHardwarePdu = _d.rackHardwarePdu, rackHardwareRackMounted = _d.rackHardwareRackMounted, rackHardwareRacks = _d.rackHardwareRacks, rackHardwareResult = _d.rackHardwareResult, usageSlots = _d.usageSlots, usageUnits = _d.usageUnits;
    // return data
    return {
        collisionHardware: collisionHardware,
        collisionPatchpanel: collisionPatchpanel,
        collisionSled: collisionSled,
        hardwareData: hardwareData,
        modelData: modelData,
        patchpanelBadData: patchpanelBadData,
        patchpanelData: patchpanelData,
        patchpanelRackMounted: patchpanelRackMounted,
        patchpanelSortResult: patchpanelSortResult,
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
        uniqueCiSysId: uniqueCiSysId,
        uniqueHardwareSysId: uniqueHardwareSysId,
        uniqueModelSysId: uniqueModelSysId,
        uniqueRackSysId: uniqueRackSysId,
        uniqueSkuSysId: uniqueSkuSysId,
        usageSlots: usageSlots,
        usageUnits: usageUnits
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
var checkTime = function (testVariable) {
    // @ts-ignore
    var tempTime = new GlideDateTime(testVariable).getNumericValue();
    if (tempTime !== 0) {
        // @ts-ignore
        return tempTime;
    }
    return null;
};
var checkJiraUrl = function (testVariable) {
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
var checkInteger = function (testVariable) {
    if (typeof testVariable === 'string') {
        if (!Number.isNaN(parseInt(testVariable, 10))) {
            return parseInt(testVariable, 10);
        }
    }
    return null;
};
var checkFloat = function (testVariable) {
    if (typeof testVariable === 'string') {
        if (!Number.isNaN(parseFloat(testVariable))) {
            return parseFloat(testVariable);
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
var checkStringWithDefault = function (defaultString, testVariable) {
    if (typeof testVariable === 'string') {
        if (testVariable !== '') {
            return testVariable;
        }
    }
    return defaultString;
};
var getSkuData = function (uniqueSkuSysId) {
    var skuData = {};
    // @ts-ignore
    var grSkuData = new GlideRecord('u_hardware_sku_configurations');
    grSkuData.addQuery('sys_id', 'IN', Object.keys(uniqueSkuSysId));
    grSkuData.query();
    while (grSkuData.next()) {
        var testSkuSysId = checkString(grSkuData.getUniqueValue());
        if (testSkuSysId !== null) {
            skuData[testSkuSysId] = {
                skuHeight: checkInteger(grSkuData.u_space_calculation_height.getValue()),
                skuName: checkString(grSkuData.u_sku_name.getValue()),
                skuMultiple: checkInteger(grSkuData.u_space_calculation_multiple.getValue()),
                skuDerate: checkFloat(grSkuData.u_derate_kw.getValue())
            };
        }
    }
    return skuData;
};
var getRemoteAdaptors = function (uniqueSwitchCi) {
    var switchRemotePorts = {};
    // @ts-ignore
    var portRemote = new GlideRecord('cmdb_ci_network_adapter');
    portRemote.addQuery('u_switch', 'IN', Object.keys(uniqueSwitchCi));
    // portRemote.addEncodedQuery('nameSTARTSWITHeth');
    // portRemote.addEncodedQuery('u_switchportSTARTSWITHeth');
    portRemote.query();
    while (portRemote.next()) {
        var switchCiSysId = checkString(portRemote.u_switch.getValue());
        var adaptorSysId = checkString(portRemote.getUniqueValue());
        if (switchCiSysId !== null && adaptorSysId !== null) {
            if (!Object.prototype.hasOwnProperty.call(switchRemotePorts, switchCiSysId)) {
                switchRemotePorts[switchCiSysId] = {};
            }
            switchRemotePorts[switchCiSysId][adaptorSysId] = true;
        }
    }
    return switchRemotePorts;
};
var getCiData = function (uniqueCiSysId) {
    var ciData = {};
    var uniqueSwitchCi = {};
    if (Object.keys(uniqueCiSysId).length > 0) {
        // @ts-ignore
        var grCiHardware = new GlideRecord('cmdb_ci_hardware');
        grCiHardware.addQuery('sys_id', 'IN', Object.keys(uniqueCiSysId));
        grCiHardware.query();
        while (grCiHardware.next()) {
            var tempCiSysId = checkString(grCiHardware.getUniqueValue());
            var tempCmdbStatus = checkString(grCiHardware.u_cmdb_ci_status.getDisplayValue());
            var tempSysClassName = checkString(grCiHardware.sys_class_name.getValue());
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
                    sysClassName: checkString(grCiHardware.sys_class_name.getValue())
                };
                if (tempSysClassName === 'cmdb_ci_ip_switch' && tempCmdbStatus !== 'Retired') {
                    uniqueSwitchCi[tempCiSysId] = true;
                }
            }
        }
    }
    return {
        ciData: ciData,
        uniqueSwitchCi: uniqueSwitchCi
    };
};
var getMetaData = function (environment, rackSysIdArray) {
    var rackNameUnique = {};
    var rackSysIdMetaSysId = {};
    var rackSysIdPowerDesign = {};
    var filteredRackSysIdUnique = {};
    // @ts-ignore
    var grRackMeta = new GlideRecord('u_dc_rack_metadata');
    grRackMeta.addQuery('u_rack', 'IN', rackSysIdArray);
    if (environment !== null) {
        grRackMeta.addQuery('u_environment', environment);
    }
    grRackMeta.query();
    while (grRackMeta.next()) {
        var tempRackSysId = checkString(grRackMeta.u_rack.getValue());
        var tempRackMetaSysId = checkString(grRackMeta.getUniqueValue());
        var tempRackName = checkString(grRackMeta.u_rack.getDisplayValue());
        var tempPowerDesign = checkFloat(grRackMeta.u_power_design_kw.getValue());
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
        rackNameUnique: rackNameUnique,
        rackSysIdMetaSysId: rackSysIdMetaSysId,
        rackSysIdPowerDesign: rackSysIdPowerDesign
    };
};
var getPowerIq = function (rackNameUnique) {
    var rackNamePowerIqMax = {};
    // @ts-ignore
    var grPowerIq = new GlideRecord('u_poweriq_staging');
    grPowerIq.addQuery('u_rack_name', 'IN', Object.keys(rackNameUnique));
    grPowerIq.addEncodedQuery('sys_created_on>=javascript:gs.beginningOfLast6Months()');
    grPowerIq.query();
    while (grPowerIq.next()) {
        var rackName = checkString(grPowerIq.u_rack_name.getValue());
        var maxPower = checkFloat(grPowerIq.u_maximum_active_power.getValue());
        if (rackName !== null && maxPower !== null) {
            // check if rackname already exists in data
            if (!Object.prototype.hasOwnProperty.call(rackNamePowerIqMax, rackName)) {
                // create if first time
                rackNamePowerIqMax[rackName] = maxPower;
            }
            else if (maxPower > rackNamePowerIqMax[rackName]) {
                // replace if greater
                rackNamePowerIqMax[rackName] = maxPower;
            }
        }
    }
    return rackNamePowerIqMax;
};
var getReservations = function (rackSysIdArray) {
    var rackReservation = {};
    var rackUnitReservation = {};
    // @ts-ignore
    var grResRack = new GlideRecord('u_reservation_rack');
    grResRack.addQuery('u_rack', 'IN', rackSysIdArray);
    grResRack.addEncodedQuery('u_reservation_ends>=javascript:gs.beginningOfToday()');
    grResRack.query();
    while (grResRack.next()) {
        // safe
        var tempRackResSysId = grResRack.getUniqueValue();
        // test
        var tempRackSysId = checkString(grResRack.u_rack.getValue());
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
                    userName: checkString(grResRack.sys_created_by.getValue())
                };
            }
        }
    }
    // @ts-ignore
    var grResUnit = new GlideRecord('u_reservation_rack_unit');
    grResUnit.addQuery('u_rack', 'IN', rackSysIdArray);
    grResUnit.addEncodedQuery('u_reservation_ends>=javascript:gs.beginningOfToday()');
    grResUnit.query();
    while (grResUnit.next()) {
        // safe
        var tempUnitResSysId = grResUnit.getUniqueValue();
        // test
        var tempRackSysId = checkString(grResUnit.u_rack.getValue());
        var tempRackUnit = checkInteger(grResUnit.u_rack_unit.getValue());
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
                userName: checkString(grResUnit.sys_created_by.getValue())
            };
        }
    }
    return {
        rackReservation: rackReservation,
        rackUnitReservation: rackUnitReservation
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
var chosenSkuSysId = 'afead3e913883f401287bd566144b006';
var environmentValue = 'ManagedHosting1';
// const numberOfServers = 9;
// const roomSysIdArray = ['5400288a37bc7e40362896d543990e9b'];
//
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
//
var uniqueSkuSysId = results.uniqueSkuSysId;
uniqueSkuSysId[chosenSkuSysId] = true;
var _a = getCiData(results.uniqueCiSysId), ciData = _a.ciData, uniqueSwitchCi = _a.uniqueSwitchCi;
//
var switchRemotePorts = getRemoteAdaptors(uniqueSwitchCi);
//
var skuData = getSkuData(uniqueSkuSysId);
//
var _b = getMetaData(environmentValue, testRackSysIds), rackNameUnique = _b.rackNameUnique, rackSysIdMetaSysId = _b.rackSysIdMetaSysId, rackSysIdPowerDesign = _b.rackSysIdPowerDesign;
//
var rackNamePowerIqMax = getPowerIq(rackNameUnique);
//
var _c = getReservations(testRackSysIds), rackReservation = _c.rackReservation, rackUnitReservation = _c.rackUnitReservation;
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
var output = '';
output += "results = ".concat(JSON.stringify(results, null, 2), ";\n");
output += "ciData = ".concat(JSON.stringify(ciData, null, 2), ";\n");
output += "switchRemotePorts = ".concat(JSON.stringify(switchRemotePorts, null, 2), ";\n");
output += "skuData = ".concat(JSON.stringify(skuData, null, 2), ";\n");
output += "rackSysIdMetaSysId = ".concat(JSON.stringify(rackSysIdMetaSysId, null, 2), ";\n");
output += "rackSysIdPowerDesign = ".concat(JSON.stringify(rackSysIdPowerDesign, null, 2), ";\n");
output += "rackNamePowerIqMax = ".concat(JSON.stringify(rackNamePowerIqMax, null, 2), ";\n");
output += "rackUnitReservation = ".concat(JSON.stringify(rackUnitReservation, null, 2), ";\n");
output += "rackReservation = ".concat(JSON.stringify(rackReservation, null, 2), ";\n");
// output += `xxxxxx = ${JSON.stringify(xxxxxx, null, 2)};\n`;
// output += `xxxxxx = ${JSON.stringify(xxxxxx, null, 2)};\n`;
// @ts-ignore
gs.print(output);
