#!/usr/bin/env sh
set -e

cd out/

git init 
git config --local user.name "Seungwoo Lee"
git config --local user.email "seungwoo321@gmail.com"
git add -A
git commit -m "chore: by deploy.sh"
git push -f git@github.com:Seungwoo321/Seungwoo321.github.io.git master:gh-pages

cd -