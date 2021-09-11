git add .
echo "Commit Message: "
read commitMessage
git commit -m "$commitMessage"
git push origin master