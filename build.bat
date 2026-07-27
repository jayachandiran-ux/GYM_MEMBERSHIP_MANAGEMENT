@echo off
SETLOCAL

REM ============================================================
REM  GYM MEMBERSHIP MANAGEMENT - Build & Deploy Script
REM  Run this file from the project root directory
REM ============================================================

REM --- CONFIGURE THESE PATHS FOR YOUR MACHINE ---
SET TOMCAT_HOME=C:\apache-tomcat-10.1.x\apache-tomcat-10.1.57
SET JAVA_HOME=C:\Program Files\Java\jdk-25.0.2

REM --- Project paths (do not change) ---
SET PROJECT_ROOT=%~dp0
SET SRC=%PROJECT_ROOT%src
SET WEB_INF=%PROJECT_ROOT%WEB-INF
SET CLASSES=%WEB_INF%\classes
SET LIB=%PROJECT_ROOT%lib
SET WEBAPP_DIR=%TOMCAT_HOME%\webapps\GYM_MEMBERSHIP_MANAGEMENT

echo.
echo ============================================
echo  GYM MEMBERSHIP MANAGEMENT - BUILD STARTED
echo ============================================
echo.

REM --- Step 1: Create WEB-INF\classes directory ---
IF NOT EXIST "%CLASSES%" (
    mkdir "%CLASSES%"
    echo Created: WEB-INF\classes
)

REM --- Step 2: Compile all Java source files ---
echo Compiling Java source files...
"%JAVA_HOME%\bin\javac" -cp "%LIB%\mysql-connector-j-9.7.0 (1).jar;%TOMCAT_HOME%\lib\servlet-api.jar" -d "%CLASSES%" "%SRC%\*.java"

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Compilation failed. Fix errors above and try again.
    pause
    exit /b 1
)
echo Compilation successful.
echo.

REM --- Step 3: Create webapp directory in Tomcat ---
IF NOT EXIST "%WEBAPP_DIR%" (
    mkdir "%WEBAPP_DIR%"
    echo Created Tomcat webapp directory.
)

REM --- Step 4: Copy HTML files ---
IF NOT EXIST "%WEBAPP_DIR%" mkdir "%WEBAPP_DIR%"
xcopy /Y /E "%PROJECT_ROOT%html\*" "%WEBAPP_DIR%\"
echo Copied HTML files.

REM --- Step 5: Copy CSS files ---
IF NOT EXIST "%WEBAPP_DIR%\css" mkdir "%WEBAPP_DIR%\css"
xcopy /Y "%PROJECT_ROOT%css\*" "%WEBAPP_DIR%\css\"
echo Copied CSS files.

REM --- Step 6: Copy images ---
IF NOT EXIST "%WEBAPP_DIR%\images" mkdir "%WEBAPP_DIR%\images"
xcopy /Y "%PROJECT_ROOT%images\*" "%WEBAPP_DIR%\images\"
echo Copied image files.

REM --- Step 7: Copy WEB-INF ---
IF NOT EXIST "%WEBAPP_DIR%\WEB-INF" mkdir "%WEBAPP_DIR%\WEB-INF"
copy /Y "%WEB_INF%\web.xml" "%WEBAPP_DIR%\WEB-INF\web.xml"
echo Copied web.xml.

REM --- Step 8: Copy compiled classes ---
IF NOT EXIST "%WEBAPP_DIR%\WEB-INF\classes" mkdir "%WEBAPP_DIR%\WEB-INF\classes"
xcopy /Y "%CLASSES%\*" "%WEBAPP_DIR%\WEB-INF\classes\"
echo Copied compiled classes.

REM --- Step 9: Copy MySQL JAR to WEB-INF\lib ---
IF NOT EXIST "%WEBAPP_DIR%\WEB-INF\lib" mkdir "%WEBAPP_DIR%\WEB-INF\lib"
copy /Y "%LIB%\mysql-connector-j-9.7.0 (1).jar" "%WEBAPP_DIR%\WEB-INF\lib\"
echo Copied MySQL JDBC driver.

echo.
echo ============================================
echo  BUILD SUCCESSFUL
echo ============================================
echo.
echo  Open browser and go to:
echo  http://localhost:8080/GYM_MEMBERSHIP_MANAGEMENT/
echo.
echo  Login with:
echo  Username : admin
echo  Password : Jai@2007
echo.
pause
ENDLOCAL
