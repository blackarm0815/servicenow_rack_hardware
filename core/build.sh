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
