var getSortedRackHardware = function (rackSysIdArray) {
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
    var testValidRackMounted = function (hardware, modelData) {
        if (hardware.parent !== null) {
            return {
                pass: false,
                failReport: 'not a valid rack mounted - has a parent'
            };
        }
        if (hardware.rackU === null) {
            return {
                pass: false,
                failReport: 'not a valid  rack mounted - u_rack_u is missing'
            };
        }
        if (hardware.rackU === 0) {
            return {
                pass: false,
                failReport: 'not a valid  rack mounted - u_rack_u is zero'
            };
        }
        if (hardware.modelSysId === null) {
            return {
                pass: false,
                failReport: 'not a valid  rack mounted - does not have a model'
            };
        }
        if (!Object.prototype.hasOwnProperty.call(modelData, hardware.modelSysId)) {
            return {
                pass: false,
                failReport: 'not a valid  rack mounted - model not found'
            };
        }
        if (modelData[hardware.modelSysId].modelHeight === null) {
            return {
                pass: false,
                failReport: 'not a valid  rack mounted - model height is missing'
            };
        }
        if (modelData[hardware.modelSysId].modelHeight === 0) {
            return {
                pass: false,
                failReport: 'not a valid  rack mounted - model height is zero'
            };
        }
        return {
            pass: true,
            failReport: ''
        };
    };
    var testValidChassisSled = function (hardwareData, hardwareSysId) {
        var parentSysId = hardwareData[hardwareSysId].parent;
        if (hardwareData[hardwareSysId].slot === null) {
            return {
                pass: false,
                failReport: 'not a valid sled - slot missing'
            };
        }
        if (hardwareData[hardwareSysId].slot === 0) {
            return {
                pass: false,
                failReport: 'not a valid sled - slot is zero'
            };
        }
        if (parentSysId === null) {
            return {
                pass: false,
                failReport: 'not a valid sled - parent missing'
            };
        }
        if (parentSysId !== null && !Object.prototype.hasOwnProperty.call(hardwareData, parentSysId)) {
            return {
                pass: false,
                failReport: 'not a valid sled - parent not found in hardwareData'
            };
        }
        if (parentSysId !== null && hardwareData[parentSysId].rackSysId !== hardwareData[hardwareSysId].rackSysId) {
            return {
                pass: false,
                failReport: 'not a valid sled - parent not in same rack'
            };
        }
        return {
            pass: true,
            failReport: ''
        };
    };
    var testValidRack = function (hardware, modelData) {
        if (hardware.modelSysId !== null) {
            if (Object.prototype.hasOwnProperty.call(modelData, hardware.modelSysId)) {
                if (modelData[hardware.modelSysId].deviceCategory === 'Rack') {
                    return true;
                }
            }
        }
        return false;
    };
    var calculateSortedHardware = function (hardwareData, modelData) {
        // test booleans
        var isRack;
        var isSled;
        var isRackMounted;
        var isPdu;
        var isNetworkCard;
        var pass;
        // feedback about result
        var failReason;
        // datastructures
        var rackHardwareBadData = {};
        var rackHardwareChassisNetwork = {};
        var rackHardwareChassisSled = {};
        var rackHardwarePdu = {};
        var rackHardwareRackMounted = {};
        var rackHardwareResult = {};
        Object.keys(hardwareData).forEach(function (hardwareSysId) {
            var hardware = hardwareData[hardwareSysId];
            var rackSysId = hardware.rackSysId;
            var parent = hardware.parent;
            if (rackSysId !== null) {
                rackHardwareResult[hardwareSysId] = [];
                // set test booleans to false
                isRack = false;
                isSled = false;
                isRackMounted = false;
                isPdu = false;
                isNetworkCard = false;
                // check for rack
                isRack = testValidRack(hardware, modelData);
                if (isRack) {
                    rackHardwareResult[hardwareSysId].push('is a rack');
                }
                // check for sled
                if (!isRack) {
                    var resultSled = testValidChassisSled(hardwareData, hardwareSysId);
                    isSled = resultSled.pass;
                    if (isSled && parent !== null) {
                        if (!Object.prototype.hasOwnProperty.call(rackHardwareChassisSled, parent)) {
                            rackHardwareChassisSled[parent] = {};
                        }
                        rackHardwareChassisSled[parent][hardwareSysId] = true;
                    }
                    else {
                        rackHardwareResult[hardwareSysId].push(resultSled.failReport);
                    }
                }
                // check for rackmounted
                if (!isSled) {
                    var resultRackMounted = testValidRackMounted(hardware, modelData);
                    isRackMounted = resultRackMounted.pass;
                    if (isRackMounted) {
                        if (!Object.prototype.hasOwnProperty.call(rackHardwareRackMounted, rackSysId)) {
                            rackHardwareRackMounted[rackSysId] = {};
                        }
                        rackHardwareRackMounted[rackSysId][hardwareSysId] = true;
                    }
                    else {
                        rackHardwareResult[hardwareSysId].push(resultRackMounted.failReport);
                    }
                }
            }
        });
        return {
            rackHardwareBadData: rackHardwareBadData,
            rackHardwareChassisNetwork: rackHardwareChassisNetwork,
            rackHardwareChassisSled: rackHardwareChassisSled,
            rackHardwarePdu: rackHardwarePdu,
            rackHardwareRackMounted: rackHardwareRackMounted,
            rackHardwareResult: rackHardwareResult
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
            ciSysIdUnique: ciSysIdUnique,
            hardwareData: hardwareData,
            hardwareSysIdUnique: hardwareSysIdUnique,
            modelSysIdUnique: modelSysIdUnique,
            skuSysIdUnique: skuSysIdUnique
        };
    };
    var getRackZoneData = function (rackSysIdName) {
        var rackSysIdRowSysId = {};
        var rowNameRowSysId = {};
        var rowNameRackNameList = {};
        var rowSysIdRackSysIds = {};
        var rowSysIdRoomSysId = {};
        var rowSysIdRowName = {};
        var rowSysIdUnique = {};
        var grRackToRow = new GlideRecord('cmdb_rel_ci');
        grRackToRow.addQuery('child', 'IN', Object.keys(rackSysIdName));
        grRackToRow.query();
        while (grRackToRow.next()) {
            // test
            var rackSysId = checkString(grRackToRow.child.getValue());
            var rowSysId = checkString(grRackToRow.parent.getValue());
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
            var grRowData = new GlideRecord('cmdb_ci_zone');
            grRowData.addQuery('sys_id', 'IN', Object.keys(rowSysIdUnique));
            grRowData.query();
            while (grRowData.next()) {
                var tempZoneSysId = checkString(grRowData.getUniqueValue());
                var zoneName = checkString(grRowData.name.getValue());
                if (tempZoneSysId !== null && zoneName !== null) {
                    rowNameRowSysId[zoneName] = tempZoneSysId;
                    rowSysIdRowName[tempZoneSysId] = zoneName;
                }
            }
        }
        // get the relationships between zones and rooms
        // this is used for the 3d button
        if (Object.keys(rowSysIdUnique).length > 0) {
            var grRowToRoom = new GlideRecord('cmdb_rel_ci');
            grRowToRoom.addQuery('child', 'IN', Object.keys(rowSysIdUnique));
            grRowToRoom.query();
            while (grRowToRoom.next()) {
                // test
                var rowSysId = checkString(grRowToRoom.child.getValue());
                var roomSysId = checkString(grRowToRoom.parent.getValue());
                // store
                if (rowSysId !== null && roomSysId !== null) {
                    rowSysIdRoomSysId[rowSysId] = roomSysId;
                }
            }
        }
        // build object where the key is the row name and the value is a list of rack names
        // have a 'Row missing' backup for orphan racks (client side will handle it)
        Object.keys(rackSysIdName).forEach(function (rackSysId) {
            var rackName = rackSysIdName[rackSysId];
            var tempRowName = 'Row missing';
            if (Object.prototype.hasOwnProperty.call(rackSysIdRowSysId, rackSysId)) {
                var tempRowSysId = rackSysIdRowSysId[rackSysId];
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
            rackSysIdRowSysId: rackSysIdRowSysId,
            rowNameRackNameList: rowNameRackNameList,
            rowNameRowSysId: rowNameRowSysId,
            rowSysIdRoomSysId: rowSysIdRoomSysId
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
    var _a = getRackData(rackSysIdArray), rackData = _a.rackData, rackNameSysId = _a.rackNameSysId, rackSysIdName = _a.rackSysIdName;
    var _b = getHardware(rackSysIdArray), ciSysIdUnique = _b.ciSysIdUnique, hardwareData = _b.hardwareData, hardwareSysIdUnique = _b.hardwareSysIdUnique, modelSysIdUnique = _b.modelSysIdUnique, skuSysIdUnique = _b.skuSysIdUnique;
    var _c = getRackZoneData(rackSysIdName), rackSysIdRowSysId = _c.rackSysIdRowSysId, rowNameRackNameList = _c.rowNameRackNameList, rowNameRowSysId = _c.rowNameRowSysId, rowSysIdRoomSysId = _c.rowSysIdRoomSysId;
    var modelData = getModel(modelSysIdUnique);
    var _d = calculateSortedHardware(hardwareData, modelData), rackHardwareBadData = _d.rackHardwareBadData, rackHardwareChassisNetwork = _d.rackHardwareChassisNetwork, rackHardwareChassisSled = _d.rackHardwareChassisSled, rackHardwarePdu = _d.rackHardwarePdu, rackHardwareRackMounted = _d.rackHardwareRackMounted, rackHardwareResult = _d.rackHardwareResult;
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
        ciSysIdUnique: ciSysIdUnique,
        hardwareData: hardwareData,
        hardwareSysIdUnique: hardwareSysIdUnique,
        modelData: modelData,
        modelSysIdUnique: modelSysIdUnique,
        skuSysIdUnique: skuSysIdUnique,
        rackData: rackData,
        rackHardwareBadData: rackHardwareBadData,
        rackHardwareChassisNetwork: rackHardwareChassisNetwork,
        rackHardwareChassisSled: rackHardwareChassisSled,
        rackHardwarePdu: rackHardwarePdu,
        rackHardwareRackMounted: rackHardwareRackMounted,
        rackHardwareResult: rackHardwareResult,
        rackNameSysId: rackNameSysId,
        rackSysIdName: rackSysIdName,
        rackSysIdRowSysId: rackSysIdRowSysId,
        rowNameRackNameList: rowNameRackNameList,
        rowNameRowSysId: rowNameRowSysId,
        rowSysIdRoomSysId: rowSysIdRoomSysId
    };
};
var testRackSysIds = ['f4738c21dbb1c7442b56541adc96196a'];
gs.print(getSortedRackHardware(testRackSysIds));
