echo "eslint complete.ts"
if npx eslint complete.ts
then
  echo "done"
else
  exit
fi
echo
#
echo "transpiling complete.ts"
if npx tsc complete.ts
then
  echo "done"
else
  exit
fi
echo

# clean up
grep -v '// @ts-ignore' complete.js | sed 's/    /  /g' > ../complete.js
rm complete.js
