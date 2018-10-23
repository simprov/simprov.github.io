set -e

# define color
RED='\033[0;31m'
NC='\033[0m' # No Color


# 0.1 Check if jq has been installed
type jq >/dev/null 2>&1 || { echo >&2 "I require jq but it's not installed.  Aborting."; exit 1; }

# 0.3 Check if all files are committed
if [ -z "$(git status --porcelain)" ]; then
  echo "All tracked files are committed.  Publishing on npm and bower. \n"
else
  echo "${RED}There are uncommitted files. Please commit or stash first!${NC} \n\n"
  git status
  exit 1
fi

git clone https://github.com/cchandurkar/polestar.git gh-pages
cd gh-pages
git checkout gh-pages
cd ..
npm run build
rm -rf dist/.git
mv gh-pages/.git dist
cp -r src/provenance dist
cp -r src/jsondiffpatch dist
rm -rf gh-pages
cd dist
git add --all
git commit -m "release"
git push origin gh-pages
cd ..
