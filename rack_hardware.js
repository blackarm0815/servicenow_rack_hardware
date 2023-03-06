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
    // collect data
    var _a = getRackData(rackSysIdArray), rackData = _a.rackData, rackNameSysId = _a.rackNameSysId, rackSysIdName = _a.rackSysIdName;
    var _b = getHardware(rackSysIdArray), ciSysIdUnique = _b.ciSysIdUnique, hardwareData = _b.hardwareData, hardwareSysIdUnique = _b.hardwareSysIdUnique, modelSysIdUnique = _b.modelSysIdUnique, skuSysIdUnique = _b.skuSysIdUnique;
    var _c = getRackZoneData(rackSysIdName), rackSysIdRowSysId = _c.rackSysIdRowSysId, rowNameRackNameList = _c.rowNameRackNameList, rowNameRowSysId = _c.rowNameRowSysId, rowSysIdRoomSysId = _c.rowSysIdRoomSysId;
    // return data
    return {
        ciSysIdUnique: ciSysIdUnique,
        hardwareData: hardwareData,
        hardwareSysIdUnique: hardwareSysIdUnique,
        modelSysIdUnique: modelSysIdUnique,
        skuSysIdUnique: skuSysIdUnique,
        rackData: rackData,
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
