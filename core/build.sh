echo "eslint rack_hardware.ts"
if npx eslint rack_hardware.ts
then
  echo "done"
else
  exit
fi
echo
#
echo "transpiling rack_hardware.ts"
if npx tsc rack_hardware.ts
then
  echo "done"
else
  exit
fi
echo

# clean up
grep -v '// @ts-ignore' rack_hardware.js | sed 's/    /  /g' > ../rack_hardware_core.js
rm rack_hardware.js