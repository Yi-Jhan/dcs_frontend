cp cicd/dockers/golang/Dockerfile-golang-build ./Dockerfile
docker build --no-cache -t uni-agent:1.0 . || exit 1
docker system prune -f

