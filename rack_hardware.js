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
    var getRackData = function (tempRackSysIdArray) {
        var tempRackData = {};
        var tempRackNameSysId = {};
        var tempRackSysIdName = {};
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
                    tempRackData[rackSysId] = {
                        rackName: rackName,
                        rackHeight: rackHeight
                    };
                    if (rackName !== null) {
                        tempRackNameSysId[rackName] = rackSysId;
                        tempRackSysIdName[rackSysId] = rackName;
                    }
                }
            }
        }
        return {
            rackData: tempRackData,
            rackNameSysId: tempRackNameSysId,
            rackSysIdName: tempRackSysIdName
        };
    };
    // collect data
    var _a = getRackData(rackSysIdArray), rackData = _a.rackData, rackNameSysId = _a.rackNameSysId, rackSysIdName = _a.rackSysIdName;
    // return data
    return {
        rackData: rackData,
        rackNameSysId: rackNameSysId,
        rackSysIdName: rackSysIdName
    };
};
var testRackSysIds = [
    '14ef148a37bc7e40362896d543990ef4',
    '46fb332a2b45820054a41bc5a8da15fa',
    '163c772a2b45820054a41bc5a8da15f6',
    '5e3c772a2b45820054a41bc5a8da15f6',
];
var foo = getSortedRackHardware(testRackSysIds); // remove this line
// @ts-ignore
gs.print(foo); // remove this line
