@echo off
SET CATALINA_HOME=C:\apache-tomcat-10.1.x\apache-tomcat-10.1.57
SET JAVA_HOME=C:\Program Files\Java\jdk-25.0.2

echo.
echo ============================================
echo  Starting Tomcat...
echo ============================================
echo.
echo  Once started, open your browser and go to:
echo  http://localhost:8080/GYM_MEMBERSHIP_MANAGEMENT/
echo.
echo  Login:  admin / Jai@2007
echo.
echo  Press Ctrl+C to stop the server.
echo ============================================
echo.

"%CATALINA_HOME%\bin\catalina.bat" run
