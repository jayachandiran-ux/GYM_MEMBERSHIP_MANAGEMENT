# Use official Tomcat 10.1 with JDK 21 (stable for production)
FROM tomcat:10.1-jdk21

# Remove default Tomcat apps (not needed)
RUN rm -rf /usr/local/tomcat/webapps/ROOT \
           /usr/local/tomcat/webapps/docs \
           /usr/local/tomcat/webapps/examples \
           /usr/local/tomcat/webapps/host-manager \
           /usr/local/tomcat/webapps/manager

# Copy the WAR file into Tomcat webapps
# Naming it ROOT.war makes it available at / instead of /GYM_MEMBERSHIP_MANAGEMENT
COPY GYM_MEMBERSHIP_MANAGEMENT.war /usr/local/tomcat/webapps/ROOT.war

# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
