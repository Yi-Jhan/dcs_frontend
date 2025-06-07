cp cicd/dockers/angular/Dockerfile-ng-build ./Dockerfile
echo "Build the docker image... docker build . -t  '$CI_REGISTRY'/'$CI_IMAGE'"
echo "build docker image complete."
sleep 3
echo "push docker image... docker push '$CI_REGISTRY'/'$CI_IMAGE'"
echo "push docker image complete."
echo "Remove all unused images."
