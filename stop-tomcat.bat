@echo off
SET CATALINA_HOME=C:\apache-tomcat-10.1.x\apache-tomcat-10.1.57
SET JAVA_HOME=C:\Program Files\Java\jdk-25.0.2

echo Stopping Tomcat...
"%CATALINA_HOME%\bin\shutdown.bat"
echo Tomcat stopped.
pause
