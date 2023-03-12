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
