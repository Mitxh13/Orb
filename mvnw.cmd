@REM Maven Wrapper script for Windows
@REM Downloads Maven if not already installed and runs it

@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "WRAPPER_PROPERTIES=%SCRIPT_DIR%.mvn\wrapper\maven-wrapper.properties"
set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists"
set "DIST_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
set "MAVEN_VERSION=3.9.9"
set "MAVEN_DIR=%MAVEN_HOME%\apache-maven-%MAVEN_VERSION%"

if exist "%MAVEN_DIR%\bin\mvn.cmd" goto runMaven

echo Downloading Maven %MAVEN_VERSION%...
if not exist "%MAVEN_HOME%" mkdir "%MAVEN_HOME%"

set "TMP_FILE=%MAVEN_HOME%\maven.zip"
powershell -Command "Invoke-WebRequest -Uri '%DIST_URL%' -OutFile '%TMP_FILE%'"
powershell -Command "Expand-Archive -Path '%TMP_FILE%' -DestinationPath '%MAVEN_HOME%' -Force"
del /f /q "%TMP_FILE%" 2>nul

:runMaven
"%MAVEN_DIR%\bin\mvn.cmd" %*
