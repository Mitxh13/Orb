#!/bin/sh
# Maven Wrapper script for Unix
# Downloads Maven if not already installed and runs it

set -e

# Determine script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WRAPPER_PROPERTIES="$SCRIPT_DIR/.mvn/wrapper/maven-wrapper.properties"
WRAPPER_JAR="$SCRIPT_DIR/.mvn/wrapper/maven-wrapper.jar"
MAVEN_HOME="$HOME/.m2/wrapper/dists"

# Read distribution URL from properties
if [ -f "$WRAPPER_PROPERTIES" ]; then
    DIST_URL=$(grep 'distributionUrl' "$WRAPPER_PROPERTIES" | cut -d'=' -f2-)
fi

if [ -z "$DIST_URL" ]; then
    DIST_URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
fi

# Extract Maven version from URL
MAVEN_VERSION=$(echo "$DIST_URL" | grep -oP 'apache-maven-\K[0-9.]+')
MAVEN_DIR="$MAVEN_HOME/apache-maven-$MAVEN_VERSION"

# Download and extract Maven if not present
if [ ! -d "$MAVEN_DIR" ]; then
    echo "Downloading Maven $MAVEN_VERSION..."
    mkdir -p "$MAVEN_HOME"
    TMP_FILE="$MAVEN_HOME/maven.zip"
    curl -fsSL "$DIST_URL" -o "$TMP_FILE"
    unzip -qo "$TMP_FILE" -d "$MAVEN_HOME"
    rm -f "$TMP_FILE"
fi

export MAVEN_HOME="$MAVEN_DIR"
exec "$MAVEN_DIR/bin/mvn" "$@"
