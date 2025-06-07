cp cicd/dockers/dcs-backend/Dockerfile-build ./Dockerfile
docker build --network=host --no-cache -t dcs-backend:1.0 . || exit 1
docker system prune -f
