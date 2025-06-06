#! /bin/bash
# Edit package.json to set proxy
echo "Setting proxy to __BACKEND_URL__"
# Load package.json file and edit proxy
sed -E 's#"proxy"\s*:\s*".*"#"proxy": "__BACKEND_URL__"#' package.json