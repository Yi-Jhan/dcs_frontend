cp cicd/dockers/$CI_PROJECT_NAME/Dockerfile-deploy ./Dockerfile
docker build --build-arg dcs_frontend_feature=l12 --network=host --no-cache -t $CONTAINER_REGISTRY/$CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME:0.1 .
docker system prune -f
docker login -u=$DOCKER_USERNAME -p=$DOCKER_PASSWORD $CONTAINER_REGISTRY
docker push $CONTAINER_REGISTRY/$CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME:0.1
echo "$K8S_DEV_CONFIG" > /home/gitlab-runner/.kube/config
cat /home/gitlab-runner/.kube/config
chmod 777 /home/gitlab-runner/.kube/config
helm upgrade $CI_PROJECT_NAME --set ingress.hosts[0].host="$DEV_DNS_NAME",env.env="dev",env.JAVA_OPTS="-Dspring.profiles.active=dev -XX:+UseContainerSupport -XX:MinRAMPercentage=80.0 -XX:MinMetaspaceFreeRatio=0 -XX:MaxMetaspaceFreeRatio=85" -f ./helm-charts/$CI_PROJECT_NAME/values.yaml ./helm-charts/$CI_PROJECT_NAME -n $NAMESPACE
kubectl rollout restart deployment $CI_PROJECT_NAME -n $NAMESPACE

