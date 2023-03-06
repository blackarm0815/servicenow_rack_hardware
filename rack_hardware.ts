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
  const getRackData = (
    tempRackSysIdArray: Array<string>,
  ) => {
    const tempRackData: Record<string, Rack> = {};
    const tempRackNameSysId: Record<string, string> = {};
    const tempRackSysIdName: Record<string, string> = {};
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
            tempRackSysIdName[rackSysId] = rackName;
          }
        }
      }
    }
    return {
      rackData: tempRackData,
      rackNameSysId: tempRackNameSysId,
      rackSysIdName: tempRackSysIdName,
    };
  };
  // collect data
  const {
    rackData,
    rackNameSysId,
    rackSysIdName,
  } = getRackData(rackSysIdArray);
  // return data
  return {
    rackData,
    rackNameSysId,
    rackSysIdName,
  };
};
const testRackSysIds = [
  '14ef148a37bc7e40362896d543990ef4',
  '46fb332a2b45820054a41bc5a8da15fa',
  '163c772a2b45820054a41bc5a8da15f6',
  '5e3c772a2b45820054a41bc5a8da15f6',
];
const foo = getSortedRackHardware(testRackSysIds); // remove this line
// @ts-ignore
gs.print(foo); // remove this line
