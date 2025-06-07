cp cicd/dockers/golang/Dockerfile-golang-ut ./Dockerfile
docker build --no-cache -t uni-agent:1.0 . || exit 1
docker system prune -f