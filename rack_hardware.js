var getSortedRackHardware = function (rackSysIdArray) {
    //
    // not returned to client, just for queries
    //
    // group sys_ids
    var groupsUnique = {};
    // alm_hardware sys_ids
    var hardwareSysIdUnique = {};
    // manager sys_user sys_ids
    var managerSysIdUnique = {};
    // cmdb_model sys_ids
    var modelSysIdUnique = {};
    // u_dc_rack_metadata sys_ids
    var rackMetaSysIdUnique = {};
    // cmdb_ci_service sys_ids
    var serviceSysIdUnique = {};
    // u_hardware_sku_configurations sys_ids
    var skuSysIdUnique = {};
    // switches ci sys_ids, used for network adaptor queries
    var switchCiUnique = {};
    //
    // returned to client
    //
    // cmdb_ci_hardware sys_id, data from cmdb_ci_hardware
    var ciData = {};
    // unique cmdb_ci_hardware sys_id, passed to client side for change and incident queries
    var ciSysIdUnique = {};
    // sleds that are in a collision
    // alm_hardware sys_id, true
    var collisionSled = {};
    // hardware that is in a collision
    // alm_hardware sys_id, true
    var collisionHardware = {};
    // patchpanels that are in a collision
    // u_patch_panel sys_id, true
    var collisionPatchpanel = {};
    // group sys_id to manager sys_id
    // sys_user_group sys_id, sys_user sys_id
    // related to managerSysIdName
    var groupSysIdManagerSysId = {};
    // rack sys_id, hardware sys_id, true
    var hardwareBadData = {};
    // actual hardware data from alm_hardware
    var hardwareData = {};
    // chassis sys_id, network card sys_id, true
    var hardwareChassisNetwork = {};
    // chassis sys_id, sled sys_id, true
    var hardwareChassisSled = {};
    // rack sys_id, pdu hardware sys_id, true
    var hardwarePdu = {};
    // rack sys_id, hardware sys_id, true
    var hardwareRackMounted = {};
    // reasons why hardware failed the various tests
    // hardware sys_id, array of failures
    var hardwareSortResult = {};
    // u_hardware_sku_configurations sys_id, derate kw as float
    var hardwareSkuSysIdDerateKw = {};
    // u_hardware_sku_configurations sys_id, name
    var hardwareSkuSysIdName = {};
    // sys_user sys_id, manager name string
    // related to groupSysIdManagerSysId
    var managerSysIdName = {};
    // cmdb_model sys_id, data from cmdb_model
    var modelData = {};
    // cmdb_ci_network_adapter ports on switches in the racks
    // first key is switch alm_hardware sys_id
    // second key is adaaptors cmdb_ci_network_adapter sys_id
    var networkAdaptorsLocal = {};
    // cmdb_ci_network_adapter ports on other machiens that connect to switches in the racks
    // first key is switch alm_hardware sys_id
    // second key is the cmdb_ci_network_adapter sys_id of the port on the switch
    // third key is the cmdb_ci_network_adapter sys_id of the remote port (allows duplicates)
    var networkAdaptorsRemote = {};
    // first key is ci sys_id from alm_hardware
    // second key is rack sys_id
    // this is used when finding the network environment of racks
    var netEnvCiSysIdRackSysId = {};
    // first key is cmdb_ci_rack sys_id
    // second key is u_patch_panel sys_id
    // true if patchpanel is bad data
    var patchpanelBadData = {};
    // key is u_patch_panel sys_id
    // value is patchpanel data
    var patchpanelData = {};
    // first key is cmdb_ci_rack sys_id
    // second key is u_patch_panel sys_id of patchpanel in rack
    // boolean only true
    var patchpanelRackMounted = {};
    // reasons why patchpanels ended up in patchpanelBadData
    // key is u_patch_panel sys_id
    // value is failure
    // unlike hardwareSortResult this does not have an array of failures
    // since patchpanels only have one test
    var patchpanelSortResult = {};
    // key is cmdb_ci_service sys_id
    // value is u_ci_business_service_rollup name
    var primaryBusinessProduct = {};
    // a color for each rack. the colors are generated client side.
    // key is cmdb_ci_rack sys_id
    var rackColor = {};
    // data from cmdb_ci_rack
    // key is cmdb_ci_rack sys_id
    var rackData = {};
    // data from u_dc_rack_metadata
    // key is u_dc_rack_metadata sys_id
    var rackMetaData = {};
    // key is rack name from cmdb_ci_rack
    // value is cmdb_ci_rack sys_id
    var rackNameRackSysId = {};
    // rack reservations
    // key is cmdb_ci_rack sys_id
    // second key is u_reservation_rack sys_id
    var rackReservation = {};
    // rack network environments (from switches in racks)
    // first key is cmdb_ci_rack sys_id
    // second key is u_cmdb_ci_network_environment name
    var rackSysIdNetEnv = {};
    // key is cmdb_ci_rack sys_id
    // value is cmdb_ci_rack name
    var rackSysIdRackName = {};
    // first key is cmdb_ci_rack sys_id
    // second key is the unit number
    // third key is u_reservation_rack_unit sys_id (allows multiple per unit)
    var rackUnitReservation = {};
    // key is ci sys_id
    // if hardware's ci appears in sc_req_item it indicates it is Pending hardware reclaim
    var scReqItemCI = {};
    // first key is chassis alm_hardware sys_id
    // second key is slot number
    // third key is reservation u_reservation_slot sys_id
    var slotReservation = {};
    // first key is rack sys_id
    // second key is unit as string
    // third string is either alm_hardware or u_patch_panel sys_id
    // value is the table (alm_hardware or u_patch_panel)
    var usageUnits = {};
    // first string is chassis alm_hardware sys_id
    // second key is slot as string
    // third key is sled alm_hardware sys_id
    var usageSlots = {};
    //
    //
    //
    //
    var errorLog = function (functionName, errorMessage) {
        // @ts-ignore
        var testStringUndefined = gs.getUserName();
        if (testStringUndefined !== undefined) {
            var logMessage = "Error - function ".concat(functionName, " failed for ");
            // @ts-ignore
            logMessage += "".concat(testStringUndefined, " with error ").concat(errorMessage);
            // @ts-ignore
            gs.error(logMessage, 'rack_view');
            // @ts-ignore
            gs.addErrorMessage("Error encountered in function ".concat(functionName), errorMessage);
        }
    };
    var checkFloat = function (testVariable) {
        if (typeof testVariable === 'string') {
            if (!Number.isNaN(parseFloat(testVariable))) {
                return parseFloat(testVariable);
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
    var checkTime = function (testVariable) {
        // @ts-ignore
        var tempTime = new GlideDateTime(testVariable).getNumericValue();
        if (tempTime !== 0) {
            // @ts-ignore
            return tempTime;
        }
        return null;
    };
    var testValidChassisSled = function (tempHardwareSysId) {
        var hardware = hardwareData[tempHardwareSysId];
        try {
            if (hardware.slot === null) {
                return {
                    pass: false,
                    failReport: 'not a valid sled - slot missing'
                };
            }
            if (hardware.slot === 0) {
                return {
                    pass: false,
                    failReport: 'not a valid sled - slot is zero'
                };
            }
            if (hardware.parent === null) {
                return {
                    pass: false,
                    failReport: 'not a valid sled - parent missing'
                };
            }
            if (!Object.prototype.hasOwnProperty.call(hardwareData, hardware.parent)) {
                return {
                    pass: false,
                    failReport: 'not a valid sled - parent not found in hardwareData'
                };
            }
            if (hardwareData[hardware.parent].rackSysId !== hardware.rackSysId) {
                return {
                    pass: false,
                    failReport: 'not a valid sled - parent not in same rack'
                };
            }
            return {
                pass: true,
                failReport: ''
            };
        }
        catch (err) {
            errorLog('testValidChassisSled', err);
            return {
                pass: false,
                failReport: 'not a valid sled - function crashed'
            };
        }
    };
    var testValidRackMounted = function (hardwareSysId) {
        var hardware = hardwareData[hardwareSysId];
        try {
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
        }
        catch (err) {
            errorLog('testValidRackMounted', err);
            return {
                pass: false,
                failReport: 'not a valid rack mounted - function crashed'
            };
        }
    };
    var testValidPatchpanel = function (patchpanelSysId) {
        var patchpanel = patchpanelData[patchpanelSysId];
        try {
            if (patchpanel.patchRackU === null) {
                return {
                    pass: false,
                    failReport: 'not a valid  patchpanel - u_rack_u is missing'
                };
            }
            if (patchpanel.patchRackU === 0) {
                return {
                    pass: false,
                    failReport: 'not a valid  patchpanel - u_rack_u is zero'
                };
            }
            if (patchpanel.patchModelSysId === null) {
                return {
                    pass: false,
                    failReport: 'not a valid patchpanel - does not have a model'
                };
            }
            if (!Object.prototype.hasOwnProperty.call(modelData, patchpanel.patchModelSysId)) {
                return {
                    pass: false,
                    failReport: 'not a valid patchpanel - model not found'
                };
            }
            var model = modelData[patchpanel.patchModelSysId];
            if (model.modelHeight === null) {
                return {
                    pass: false,
                    failReport: 'not a valid patchpanel - model height missing'
                };
            }
            if (model.modelHeight < 1) {
                return {
                    pass: false,
                    failReport: 'not a valid patchpanel - model height is less than 1'
                };
            }
            return {
                pass: true,
                failReport: ''
            };
        }
        catch (err) {
            errorLog('testValidPatchpanel', err);
            return {
                pass: false,
                failReport: 'not a valid patchpanel - function crashed'
            };
        }
    };
    var testValidChassisNetwork = function (hardwareSysId) {
        var hardware = hardwareData[hardwareSysId];
        try {
            if (hardware.parent === null) {
                return {
                    pass: false,
                    failReport: 'not valid network gear - no parent'
                };
            }
            if (!Object.prototype.hasOwnProperty.call(hardwareData, hardware.parent)) {
                return {
                    pass: false,
                    failReport: 'not valid network gear - parent not found in hardwareData'
                };
            }
            if (hardwareData[hardware.parent].rackSysId !== hardware.rackSysId) {
                return {
                    pass: false,
                    failReport: 'not valid network gear - parent not in the same rack'
                };
            }
            if (hardware.modelCategoryName !== 'Network Gear') {
                return {
                    pass: false,
                    failReport: 'not valid network gear - model category is not network gear'
                };
            }
            return {
                pass: true,
                failReport: ''
            };
        }
        catch (err) {
            errorLog('testValidChassisNetwork', err);
            return {
                pass: false,
                failReport: 'not valid network gear - function crashed'
            };
        }
    };
    var storePatchpanelBadData = function (patchpanelSysId, rackSysId) {
        if (!Object.prototype.hasOwnProperty.call(patchpanelBadData, rackSysId)) {
            patchpanelBadData[rackSysId] = {};
        }
        patchpanelBadData[rackSysId][patchpanelSysId] = true;
    };
    var generateUsageUnits = function (modelHeight, rackSysId, rackU, sysId, table) {
        var _loop_1 = function (loop) {
            var unitString = (rackU + loop).toString();
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
                Object.keys(usageUnits[rackSysId][unitString]).forEach(function (collisionSysId) {
                    // alm_hardware or u_patch_panel
                    if (usageUnits[rackSysId][unitString][collisionSysId] === 'alm_hardware') {
                        collisionHardware[collisionSysId] = true;
                    }
                    if (usageUnits[rackSysId][unitString][collisionSysId] === 'u_patch_panel') {
                        collisionPatchpanel[collisionSysId] = true;
                    }
                });
            }
        };
        for (var loop = 0; loop < modelHeight; loop += 1) {
            _loop_1(loop);
        }
    };
    var testPatchPanel = function (patchpanelSysId) {
        var patchpanel = patchpanelData[patchpanelSysId];
        var rackSysId = patchpanel.patchRackSysId;
        var rackU = patchpanel.patchRackU;
        var sortResult = testValidPatchpanel(patchpanelSysId);
        if (rackSysId !== null) {
            if (sortResult.pass && rackU !== null) {
                if (!Object.prototype.hasOwnProperty.call(patchpanelRackMounted, rackSysId)) {
                    patchpanelRackMounted[rackSysId] = {};
                }
                patchpanelRackMounted[rackSysId][patchpanelSysId] = true;
                // generate usageUnits for collision testing
                var modelHeight = 0;
                var modelSysId = patchpanel.patchModelSysId;
                if (modelSysId !== null) {
                    if (Object.prototype.hasOwnProperty.call(modelData, modelSysId)) {
                        var testModelHeight = modelData[modelSysId].modelHeight;
                        if (testModelHeight !== null) {
                            modelHeight = testModelHeight;
                        }
                    }
                }
                generateUsageUnits(modelHeight, rackSysId, rackU, patchpanelSysId, 'u_patch_panel');
            }
            else {
                patchpanelSortResult[patchpanelSysId] = sortResult.failReport;
                storePatchpanelBadData(patchpanelSysId, rackSysId);
            }
        }
    };
    var storeHardwareBadData = function (hardwareSysId) {
        var hardware = hardwareData[hardwareSysId];
        var rackSysId = hardware.rackSysId;
        if (!Object.prototype.hasOwnProperty.call(hardwareBadData, rackSysId)) {
            hardwareBadData[rackSysId] = {};
        }
        hardwareBadData[rackSysId][hardwareSysId] = true;
    };
    var testPdu = function (hardwareSysId) {
        var hardware = hardwareData[hardwareSysId];
        var rackSysId = hardware.rackSysId;
        if (hardware.modelCategoryName === 'PDU') {
            if (!Object.prototype.hasOwnProperty.call(hardwarePdu, rackSysId)) {
                hardwarePdu[rackSysId] = {};
            }
            hardwarePdu[rackSysId][hardwareSysId] = true;
        }
        else {
            hardwareSortResult[hardwareSysId].push('modelCategoryName was not PDU');
            storeHardwareBadData(hardwareSysId);
        }
    };
    var testNetworkCards = function (hardwareSysId) {
        var sortResult = testValidChassisNetwork(hardwareSysId);
        var chassisSysId = hardwareData[hardwareSysId].parent;
        if (sortResult.pass && chassisSysId !== null) {
            if (!Object.prototype.hasOwnProperty.call(hardwareChassisNetwork, chassisSysId)) {
                hardwareChassisNetwork[chassisSysId] = {};
            }
            hardwareChassisNetwork[chassisSysId][hardwareSysId] = true;
        }
        else {
            hardwareSortResult[hardwareSysId].push(sortResult.failReport);
            testPdu(hardwareSysId);
        }
    };
    var testRackMounted = function (hardwareSysId) {
        var sortResult = testValidRackMounted(hardwareSysId);
        var modelSysId = hardwareData[hardwareSysId].modelSysId;
        var rackSysId = hardwareData[hardwareSysId].rackSysId;
        var rackU = hardwareData[hardwareSysId].rackU;
        if (sortResult.pass && rackU !== null) {
            if (!Object.prototype.hasOwnProperty.call(hardwareRackMounted, rackSysId)) {
                hardwareRackMounted[rackSysId] = {};
            }
            hardwareRackMounted[rackSysId][hardwareSysId] = true;
            // generate usageUnits for collision testing
            var modelHeight = 0;
            if (modelSysId !== null) {
                if (Object.prototype.hasOwnProperty.call(modelData, modelSysId)) {
                    var testModelHeight = modelData[modelSysId].modelHeight;
                    if (testModelHeight !== null) {
                        modelHeight = testModelHeight;
                    }
                }
            }
            generateUsageUnits(modelHeight, rackSysId, rackU, hardwareSysId, 'alm_hardware');
        }
        else {
            hardwareSortResult[hardwareSysId].push(sortResult.failReport);
            // test for network cards
            testNetworkCards(hardwareSysId);
        }
    };
    var generateUsageSlots = function (sledSysId, testParent, testSlot) {
        var slotString = testSlot.toString();
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
            Object.keys(usageSlots[testParent][slotString]).forEach(function (collisionSledSysId) {
                collisionSled[collisionSledSysId] = true;
            });
        }
    };
    var testSleds = function (hardwareSysId) {
        var sortResult = testValidChassisSled(hardwareSysId);
        var testParent = hardwareData[hardwareSysId].parent;
        var testSlot = hardwareData[hardwareSysId].slot;
        if (sortResult.pass && testParent !== null && testSlot !== null) {
            // valid sled detected
            if (!Object.prototype.hasOwnProperty.call(hardwareChassisSled, testParent)) {
                hardwareChassisSled[testParent] = {};
            }
            hardwareChassisSled[testParent][hardwareSysId] = true;
            generateUsageSlots(hardwareSysId, testParent, testSlot);
        }
        else {
            hardwareSortResult[hardwareSysId].push(sortResult.failReport);
            testRackMounted(hardwareSysId);
        }
    };
    var calculateSortedHardware = function () {
        var ignore;
        Object.keys(hardwareData).forEach(function (hardwareSysId) {
            // create array to store sort failures
            hardwareSortResult[hardwareSysId] = [];
            var hardware = hardwareData[hardwareSysId];
            var rackSysId = hardware.rackSysId;
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
        Object.keys(patchpanelData).forEach(function (patchpanelSysId) {
            testPatchPanel(patchpanelSysId);
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
    var getRackZoneData = function () {
        var child;
        var parent;
        var rackSysIdRowSysId = {};
        var rowNameRowSysId = {};
        var rowNameRackNameList = {};
        var rowSysIdRackSysIds = {};
        var rowSysIdRoomSysId = {};
        var rowSysIdRowName = {};
        var rowSysIdUnique = {};
        // @ts-ignore
        var grRackToRow = new GlideRecord('cmdb_rel_ci');
        grRackToRow.addQuery('child', 'IN', Object.keys(rackSysIdRackName));
        grRackToRow.query();
        while (grRackToRow.next()) {
            // test
            child = checkString(grRackToRow.child.getValue());
            parent = checkString(grRackToRow.parent.getValue());
            // store
            if (child !== null && parent !== null) {
                rackSysIdRowSysId[child] = parent;
                rowSysIdUnique[parent] = true;
                // build zone rack relationships
                if (!Object.prototype.hasOwnProperty.call(rowSysIdRackSysIds, parent)) {
                    rowSysIdRackSysIds[parent] = {};
                }
                rowSysIdRackSysIds[parent][child] = true;
            }
        }
        if (Object.keys(rowSysIdUnique).length > 0) {
            // @ts-ignore
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
            // @ts-ignore
            var grRowToRoom = new GlideRecord('cmdb_rel_ci');
            grRowToRoom.addQuery('child', 'IN', Object.keys(rowSysIdUnique));
            grRowToRoom.query();
            while (grRowToRoom.next()) {
                // test
                child = checkString(grRowToRoom.child.getValue());
                parent = checkString(grRowToRoom.parent.getValue());
                // store
                if (child !== null && parent !== null) {
                    rowSysIdRoomSysId[child] = parent;
                }
            }
        }
        // build object where the key is the row name and the value is a list of rack names
        // have a 'Row missing' backup for orphan racks (client side will handle it)
        Object.keys(rackSysIdRackName).forEach(function (rackSysId) {
            var rackName = rackSysIdRackName[rackSysId];
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
        // @ts-ignore
        data.rackSysIdRowSysId = rackSysIdRowSysId;
        // @ts-ignore
        data.rowNameRackNameList = rowNameRackNameList;
        // @ts-ignore
        data.rowNameRowSysId = rowNameRowSysId;
        // @ts-ignore
        data.rowSysIdRoomSysId = rowSysIdRoomSysId;
    };
    var getData = function (rackSysIdList) {
        var tempRack;
        var tempRackSysId;
        var tempRackUnit;
        if (rackSysIdList.length > 0) {
            // @ts-ignore
            var grRack = new GlideRecord('cmdb_ci_rack');
            grRack.addQuery('sys_id', 'IN', rackSysIdList);
            grRack.query();
            while (grRack.next()) {
                // safe
                tempRackSysId = grRack.getUniqueValue();
                // test
                tempRack = {
                    metaSysId: null,
                    rackName: null,
                    rackHeight: null
                };
                tempRack.metaSysId = checkString(grRack.u_dcs_rack_metadata.getValue());
                tempRack.rackName = checkString(grRack.name.getValue());
                tempRack.rackHeight = checkInteger(grRack.rack_units.getValue());
                // store
                if (tempRackSysId !== null) {
                    rackData[tempRackSysId] = {
                        metaSysId: tempRack.metaSysId,
                        rackName: tempRack.rackName,
                        rackHeight: tempRack.rackHeight
                    };
                    if (tempRack.rackName !== null) {
                        rackNameRackSysId[tempRack.rackName] = tempRackSysId;
                        rackSysIdRackName[tempRackSysId] = tempRack.rackName;
                    }
                    if (tempRack.metaSysId !== null) {
                        rackMetaSysIdUnique[tempRack.metaSysId] = true;
                    }
                    rackColor[tempRackSysId] = {
                        red: 0,
                        green: 0,
                        blue: 0
                    };
                }
            }
            getRackZoneData();
            // @ts-ignore
            var grRackMeta = new GlideRecord('u_dc_rack_metadata');
            grRackMeta.addQuery('sys_id', 'IN', Object.keys(rackMetaSysIdUnique));
            grRackMeta.query();
            while (grRackMeta.next()) {
                var tempMetaSysId = grRackMeta.getUniqueValue();
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
                    rotation: checkInteger(grRackMeta.u_rotation.getValue())
                };
            }
            // @ts-ignore
            var grResRack = new GlideRecord('u_reservation_rack');
            grResRack.addQuery('u_rack', 'IN', rackSysIdList);
            grResRack.addEncodedQuery('u_reservation_ends>=javascript:gs.beginningOfToday()');
            grResRack.query();
            while (grResRack.next()) {
                // safe
                var tempRackResSysId = grResRack.getUniqueValue();
                // test
                tempRackSysId = checkString(grResRack.u_rack.getValue());
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
            grResUnit.addQuery('u_rack', 'IN', rackSysIdList);
            grResUnit.addEncodedQuery('u_reservation_ends>=javascript:gs.beginningOfToday()');
            grResUnit.query();
            while (grResUnit.next()) {
                // safe
                var tempUnitResSysId = grResUnit.getUniqueValue();
                // test
                tempRackSysId = checkString(grResUnit.u_rack.getValue());
                tempRackUnit = checkInteger(grResUnit.u_rack_unit.getValue());
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
            // @ts-ignore
            var grHardware = new GlideRecord('alm_hardware');
            grHardware.addQuery('u_rack', 'IN', rackSysIdList);
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
                    // store leaf switches for network environment query
                    if (tempCiSysId !== null && hardRackSysId !== null) {
                        if (tempCiName !== null && tempCiName.startsWith('LFAS')) {
                            netEnvCiSysIdRackSysId[tempCiSysId] = hardRackSysId;
                        }
                    }
                }
            }
            if (Object.keys(netEnvCiSysIdRackSysId).length > 0) {
                // @ts-ignore
                var grNetEnv = new GlideRecord('cmdb_ci_ip_switch');
                grNetEnv.addQuery('sys_id', 'IN', Object.keys(netEnvCiSysIdRackSysId));
                grNetEnv.addNotNullQuery('u_network_environment');
                grNetEnv.query();
                while (grNetEnv.next()) {
                    // safe
                    var testNetEnvCiSysId = checkString(grNetEnv.getUniqueValue());
                    var testNetEnvName = checkString(grNetEnv.u_network_environment.getDisplayValue());
                    if (testNetEnvCiSysId !== null && testNetEnvName !== null) {
                        // find the rack sys_id
                        if (Object.prototype.hasOwnProperty.call(netEnvCiSysIdRackSysId, testNetEnvCiSysId)) {
                            var netEnvRackSysId = netEnvCiSysIdRackSysId[testNetEnvCiSysId];
                            // store
                            rackSysIdNetEnv[netEnvRackSysId] = testNetEnvName;
                        }
                    }
                }
            }
            if (Object.keys(hardwareSysIdUnique).length > 0) {
                // @ts-ignore
                var grResSlot = new GlideRecord('u_reservation_slot');
                grResSlot.addQuery('u_chassis', 'IN', Object.keys(hardwareSysIdUnique));
                grResSlot.query();
                while (grResSlot.next()) {
                    var tempResSlotSysId = checkString(grResSlot.getUniqueValue());
                    var tempSlot = checkInteger(grResSlot.u_slot.getValue());
                    var tempChassisSysId = checkString(grResSlot.u_chassis.getValue());
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
                                userName: checkString(grResSlot.sys_created_by.getValue())
                            };
                        }
                    }
                }
            }
            if (Object.keys(skuSysIdUnique).length > 0) {
                // @ts-ignore
                var grHardwareSku = new GlideRecord('u_hardware_sku_configurations');
                grHardwareSku.addQuery('sys_id', 'IN', Object.keys(skuSysIdUnique));
                grHardwareSku.query();
                while (grHardwareSku.next()) {
                    var derateKw = checkFloat(grHardwareSku.u_derate_kw.getValue());
                    var hardwareSkuName = checkString(grHardwareSku.u_sku_name.getValue());
                    var tempSkuSysId = checkString(grHardwareSku.getUniqueValue());
                    if (hardwareSkuName !== null && tempSkuSysId !== null) {
                        hardwareSkuSysIdName[tempSkuSysId] = hardwareSkuName;
                    }
                    if (derateKw !== null && tempSkuSysId !== null) {
                        hardwareSkuSysIdDerateKw[tempSkuSysId] = derateKw;
                    }
                }
            }
            if (Object.keys(ciSysIdUnique).length > 0) {
                // @ts-ignore
                var grCiHardware = new GlideRecord('cmdb_ci_hardware');
                grCiHardware.addQuery('sys_id', 'IN', Object.keys(ciSysIdUnique));
                grCiHardware.query();
                while (grCiHardware.next()) {
                    var tempAssignmentGroupSysId = checkString(grCiHardware.assignment_group.getValue());
                    var tempCiSysId = checkString(grCiHardware.getUniqueValue());
                    var tempCmdbStatus = checkString(grCiHardware.u_cmdb_ci_status.getDisplayValue());
                    var tempPrimaryBusinessServiceSysId = checkString(grCiHardware.u_cmdb_ci_service.getValue());
                    var tempServiceGroupSysId = checkString(grCiHardware.u_patching_group.getValue());
                    var tempSysClassName = checkString(grCiHardware.sys_class_name.getValue());
                    if (tempCiSysId !== null) {
                        ciData[tempCiSysId] = {
                            assignmentGroupName: checkString(grCiHardware.assignment_group.getDisplayValue()),
                            assignmentGroupSysId: tempAssignmentGroupSysId,
                            cmdbNetworkSecurityZone: checkString(grCiHardware.u_cmdb_network_security_zone.getDisplayValue()),
                            cmdbStatus: tempCmdbStatus,
                            fqdn: checkString(grCiHardware.fqdn.getDisplayValue()),
                            hardwareStatus: checkString(grCiHardware.hardware_status.getValue()),
                            iPAddress: checkString(grCiHardware.ip_address.getDisplayValue()),
                            primaryBusinessServiceName: checkString(grCiHardware.u_cmdb_ci_service.getDisplayValue()),
                            primaryBusinessServiceSysId: tempPrimaryBusinessServiceSysId,
                            serviceGroupName: checkString(grCiHardware.u_patching_group.getDisplayValue()),
                            serviceGroupSysId: tempServiceGroupSysId,
                            status: checkString(grCiHardware.install_status.getDisplayValue()),
                            supportGroupName: checkString(grCiHardware.support_group.getDisplayValue()),
                            supportGroupSysId: checkString(grCiHardware.support_group.getValue()),
                            sysClassName: tempSysClassName
                        };
                        if (tempSysClassName === 'cmdb_ci_ip_switch' && tempCmdbStatus !== 'Retired') {
                            switchCiUnique[tempCiSysId] = true;
                        }
                    }
                    if (tempAssignmentGroupSysId !== null) {
                        groupsUnique[tempAssignmentGroupSysId] = true;
                    }
                    if (tempServiceGroupSysId !== null) {
                        groupsUnique[tempServiceGroupSysId] = true;
                    }
                    if (tempPrimaryBusinessServiceSysId !== null) {
                        serviceSysIdUnique[tempPrimaryBusinessServiceSysId] = true;
                    }
                }
            }
            if (Object.keys(groupsUnique).length > 0) {
                // @ts-ignore
                var grGroup = new GlideRecord('sys_user_group');
                grGroup.addQuery('sys_id', 'IN', Object.keys(groupsUnique));
                grGroup.query();
                while (grGroup.next()) {
                    var tempUserGroupSysId = checkString(grGroup.getUniqueValue());
                    var tempSserGroupManager = checkString(grGroup.manager.getValue());
                    // store
                    if (tempUserGroupSysId !== null && tempSserGroupManager !== null) {
                        groupSysIdManagerSysId[tempUserGroupSysId] = tempSserGroupManager;
                        managerSysIdUnique[tempSserGroupManager] = true;
                    }
                }
            }
            if (Object.keys(managerSysIdUnique).length > 0) {
                // @ts-ignore
                var grManager = new GlideRecord('sys_user');
                grManager.addQuery('sys_id', 'IN', Object.keys(managerSysIdUnique));
                grManager.query();
                while (grManager.next()) {
                    var tempSysUserName = checkString(grManager.name.getValue());
                    var tempUserSysId = checkString(grManager.getUniqueValue());
                    if (tempSysUserName !== null && tempUserSysId !== null) {
                        managerSysIdName[tempUserSysId] = tempSysUserName;
                    }
                }
            }
            if (Object.keys(serviceSysIdUnique).length > 0) {
                // @ts-ignore
                var grPrimary = new GlideRecord('cmdb_ci_service');
                grPrimary.addQuery('sys_id', 'IN', Object.keys(serviceSysIdUnique));
                grPrimary.query();
                while (grPrimary.next()) {
                    var tempServiceName = checkString(grPrimary.u_business_service_rollup.getDisplayValue());
                    var tempServiceSysId = checkString(grPrimary.getUniqueValue());
                    if (tempServiceName !== null && tempServiceSysId !== null) {
                        primaryBusinessProduct[tempServiceSysId] = tempServiceName;
                    }
                }
            }
            if (Object.keys(ciSysIdUnique).length > 0) {
                // @ts-ignore
                var grScReqItem = new GlideRecord('sc_req_item');
                grScReqItem.addQuery('cmdb_ci', 'IN', Object.keys(ciSysIdUnique));
                grScReqItem.query();
                while (grScReqItem.next()) {
                    var tempScReqItemCmdbCi = checkString(grScReqItem.cmdb_ci.getValue());
                    if (tempScReqItemCmdbCi !== null) {
                        scReqItemCI[tempScReqItemCmdbCi] = true;
                    }
                }
            }
            // @ts-ignore
            var grPatch = new GlideRecord('u_patch_panel');
            grPatch.addQuery('u_rack', 'IN', rackSysIdList);
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
                    modelSysIdUnique[tempPatchModelSysId] = true;
                }
            }
            if (Object.keys(modelSysIdUnique).length > 0) {
                // @ts-ignore
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
            // network adaptors
            // @ts-ignore
            var portLocal = new GlideRecord('cmdb_ci_network_adapter');
            portLocal.addQuery('cmdb_ci', 'IN', Object.keys(switchCiUnique));
            // portLocal.addEncodedQuery('nameSTARTSWITHeth');
            portLocal.query();
            while (portLocal.next()) {
                var adaptorSysId = checkString(portLocal.getUniqueValue());
                var localAdaptorName = checkStringWithDefault('name missing', portLocal.name.getValue());
                var localCmdbCiStatus = checkStringWithDefault('status missing', portLocal.u_cmdb_ci_status.getDisplayValue());
                var switchCiSysId = checkString(portLocal.cmdb_ci.getValue());
                if (adaptorSysId !== null && switchCiSysId !== null) {
                    if (!Object.prototype.hasOwnProperty.call(networkAdaptorsLocal, switchCiSysId)) {
                        networkAdaptorsLocal[switchCiSysId] = {};
                    }
                    networkAdaptorsLocal[switchCiSysId][adaptorSysId] = {
                        adaptorName: localAdaptorName,
                        cmdbCiStatus: localCmdbCiStatus
                    };
                }
            }
            // @ts-ignore
            var portRemote = new GlideRecord('cmdb_ci_network_adapter');
            portRemote.addQuery('u_switch', 'IN', Object.keys(switchCiUnique));
            portRemote.addNotNullQuery('u_switch');
            // portRemote.addEncodedQuery('nameSTARTSWITHeth');
            // portRemote.addEncodedQuery('u_switchportSTARTSWITHeth');
            portRemote.query();
            while (portRemote.next()) {
                var adaptorName = checkStringWithDefault('name missing', portRemote.name.getValue());
                var adaptorSysId = checkString(portRemote.getUniqueValue());
                var remoteCmdbCiStatus = checkStringWithDefault('status missing', portRemote.u_cmdb_ci_status.getDisplayValue());
                var remoteName = checkStringWithDefault('name_missing', portRemote.cmdb_ci.getDisplayValue());
                var switchCiSysId = checkString(portRemote.u_switch.getValue());
                var switchPortSysId = checkString(portRemote.u_switchport.getValue());
                if (adaptorSysId !== null && switchCiSysId !== null && switchPortSysId !== null) {
                    // switch has a match
                    if (Object.prototype.hasOwnProperty.call(networkAdaptorsLocal, switchCiSysId)) {
                        // switchport exists on switch
                        if (Object.prototype.hasOwnProperty.call(networkAdaptorsLocal[switchCiSysId], switchPortSysId)) {
                            // prepare networkAdaptorsRemote
                            if (!Object.prototype.hasOwnProperty.call(networkAdaptorsRemote, switchCiSysId)) {
                                networkAdaptorsRemote[switchCiSysId] = {};
                            }
                            if (!Object.prototype.hasOwnProperty.call(networkAdaptorsRemote[switchCiSysId], switchPortSysId)) {
                                networkAdaptorsRemote[switchCiSysId][switchPortSysId] = {};
                            }
                            // store by adaptor sys_id. allows multiples to detect collisions
                            networkAdaptorsRemote[switchCiSysId][switchPortSysId][adaptorSysId] = {
                                adaptorName: "".concat(remoteName, " - ").concat(adaptorName),
                                cmdbCiStatus: remoteCmdbCiStatus
                            };
                        }
                    }
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
};
var foo = getSortedRackHardware(['test']); // remove this line
// @ts-ignore
gs.print(foo); // remove this line
