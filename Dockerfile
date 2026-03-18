# Build stage
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy only what is needed to build the backend
COPY backend-springboot/pom.xml ./
COPY backend-springboot/src ./src

RUN mvn -B clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copy the built jar
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
