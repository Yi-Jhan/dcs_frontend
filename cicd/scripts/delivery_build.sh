docker login -u="admin" -p="!QAZ1qaz" 10.10.31.108:30002
docker build . -t 10.10.31.108:30002/demo/springboot:latest -f dockers/Dockerfile
docker push 10.10.31.108:30002/demo/springboot:latest
