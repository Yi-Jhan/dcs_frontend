#base image
FROM adoptopenjdk/openjdk8

# copy artifact build from the 'build environment'
RUN mkdir /app
COPY target/* /app/

CMD java $JAVA_OPTS -jar /app/demo-0.0.1-SNAPSHOT.jar

# expose port 8080
EXPOSE 8080
