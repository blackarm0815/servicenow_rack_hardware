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

# copy script include without the line that runs the function (needed for eslint)
echo "making rack_hardware.js"
# 
# keep this for when it's finally a script include
# grep -v '// remove this line' rack_hardware.js > script_include.js
# rm rack_hardware.js