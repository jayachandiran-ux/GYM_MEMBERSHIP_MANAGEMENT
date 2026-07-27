import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DBConnection {

    static Connection con;

    public static Connection getConnection() {

        try {

            Class.forName("com.mysql.cj.jdbc.Driver");

            // Read from environment variables (set in Render dashboard)
            // Falls back to localhost for local development
            String host     = getEnv("DB_HOST",     "localhost");
            String port     = getEnv("DB_PORT",     "3306");
            String dbName   = getEnv("DB_NAME",     "gym_management_system");
            String user     = getEnv("DB_USER",     "root");
            String password = getEnv("DB_PASSWORD", "Jai@2007");

            String dbUrl = "jdbc:mysql://" + host + ":" + port + "/" + dbName
                         + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

            con = DriverManager.getConnection(dbUrl, user, password);
            initializeSchema();

        } catch (Exception e) {
            System.out.println("DB Connection Error: " + e.getMessage());
        }

        return con;
    }

    // Helper: read env var, return defaultValue if not set
    private static String getEnv(String key, String defaultValue) {
        String val = System.getenv(key);
        return (val != null && !val.isEmpty()) ? val : defaultValue;
    }

    private static void initializeSchema() throws Exception {
        Statement stmt = con.createStatement();

        stmt.executeUpdate("CREATE TABLE IF NOT EXISTS admin (id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(100) NOT NULL)");
        stmt.executeUpdate("INSERT INTO admin(username, password) VALUES('admin', 'Jai@2007') ON DUPLICATE KEY UPDATE password = VALUES(password)");

        stmt.executeUpdate("CREATE TABLE IF NOT EXISTS members (member_id INT PRIMARY KEY AUTO_INCREMENT, full_name VARCHAR(100) NOT NULL, age INT, gender VARCHAR(20), phone_number VARCHAR(20) UNIQUE, email VARCHAR(100) UNIQUE, address VARCHAR(255), membership_plan VARCHAR(50), join_date VARCHAR(20), expiry_date VARCHAR(20), membership_status VARCHAR(20))");
        stmt.executeUpdate("CREATE TABLE IF NOT EXISTS attendance (attendance_id INT PRIMARY KEY AUTO_INCREMENT, member_id INT, attendance_date VARCHAR(20), check_in_time VARCHAR(20), attendance_status VARCHAR(20))");
        stmt.executeUpdate("CREATE TABLE IF NOT EXISTS payments (payment_id INT PRIMARY KEY AUTO_INCREMENT, member_id INT, amount DOUBLE, payment_date VARCHAR(20), payment_method VARCHAR(50), payment_status VARCHAR(20))");
        stmt.executeUpdate("CREATE TABLE IF NOT EXISTS trainers (trainer_id INT PRIMARY KEY AUTO_INCREMENT, member_id INT, member_name VARCHAR(100), trainer_name VARCHAR(100), specialization VARCHAR(100), assigned_date VARCHAR(20))");

        stmt.close();
    }

}
