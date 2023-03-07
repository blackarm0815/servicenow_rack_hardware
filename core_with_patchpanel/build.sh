echo "eslint rack_hardware_patchpanel.ts"
if npx eslint rack_hardware_patchpanel.ts
then
  echo "done"
else
  exit
fi
echo
#
echo "transpiling rack_hardware_patchpanel.ts"
if npx tsc rack_hardware_patchpanel.ts
then
  echo "done"
else
  exit
fi
echo

# clean up
grep -v '// @ts-ignore' rack_hardware_patchpanel.js | sed 's/    /  /g' > ../rack_hardware_patchpanel.js
rm rack_hardware_patchpanel.js