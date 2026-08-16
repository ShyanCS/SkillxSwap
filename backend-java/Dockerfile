# ---------- build ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Resolve dependencies in their own layer so source edits don't re-download
# the whole tree on every build.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- runtime ----------
FROM eclipse-temurin:17-jre-alpine AS runtime

# Run as an unprivileged user: a container compromise shouldn't mean root.
RUN addgroup -S app && adduser -S -G app app

WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
RUN chown -R app:app /app
USER app

EXPOSE 8080

# MaxRAMPercentage lets the JVM size its heap from the container memory
# limit instead of the host's total RAM, which is what causes containers to
# get OOM-killed under a cgroup limit.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseContainerSupport -Duser.timezone=UTC"

# Compose/orchestrators use this to gate traffic until Flyway and the
# connection pool are actually ready.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health/readiness | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
