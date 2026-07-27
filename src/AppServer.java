import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;

public class AppServer {

    private static final int PORT = 8080;
    private static final Path ROOT = Paths.get(System.getProperty("user.dir")).toAbsolutePath();
    private static final Path HTML_DIR = ROOT.resolve("html");
    private static final Path CSS_DIR = ROOT.resolve("css");
    private static final Path IMAGE_DIR = ROOT.resolve("images");

    public static void main(String[] args) throws Exception {
        start();
    }

    public static void start() throws Exception {
        DBConnection.getConnection();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", AppServer::handleRequest);
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();

        System.out.println("GYM MEMBERSHIP MANAGEMENT SYSTEM");
        System.out.println("Server running at http://localhost:" + PORT);
        System.out.println("Open http://localhost:" + PORT + "/login.html");
    }

    private static void handleRequest(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        if (path == null || path.isEmpty()) {
            path = "/login.html";
        }

        if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            handleGet(exchange, path);
        }
        else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            handlePost(exchange, path);
        }
        else {
            sendText(exchange, 405, "Method not allowed");
        }
    }

    private static void handleGet(HttpExchange exchange, String path) throws IOException {
        if ("/".equals(path)) {
            path = "/login.html";
        }

        if ("/report.html".equals(path)) {
            sendReportPage(exchange);
            return;
        }

        if (path.startsWith("/css/")) {
            serveFile(exchange, CSS_DIR.resolve(path.substring(1)), "text/css; charset=utf-8");
            return;
        }

        if (path.startsWith("/images/")) {
            serveFile(exchange, IMAGE_DIR.resolve(path.substring(1)), "image/*");
            return;
        }

        if (path.endsWith(".html")) {
            serveFile(exchange, HTML_DIR.resolve(path.substring(1)), "text/html; charset=utf-8");
            return;
        }

        sendText(exchange, 404, "Page not found");
    }

    private static void handlePost(HttpExchange exchange, String path) throws IOException {
        Map<String, String> formData = readForm(exchange);

        switch (path) {
            case "/api/login":
                handleLogin(exchange, formData);
                break;
            case "/api/members":
                handleMember(exchange, formData);
                break;
            case "/api/attendance":
                handleAttendance(exchange, formData);
                break;
            case "/api/payments":
                handlePayment(exchange, formData);
                break;
            case "/api/trainers":
                handleTrainer(exchange, formData);
                break;
            default:
                sendText(exchange, 404, "Endpoint not found");
                break;
        }
    }

    private static void handleLogin(HttpExchange exchange, Map<String, String> formData) throws IOException {
        String username = formData.getOrDefault("username", "");
        String password = formData.getOrDefault("password", "");

        Login login = new Login();
        if (login.checkLogin(username, password)) {
            redirect(exchange, "/dashboard.html");
        }
        else {
            String body = "<html><body><h2>Invalid Username or Password</h2><a href=\"/login.html\">Back to Login</a></body></html>";
            sendHtml(exchange, 401, body);
        }
    }

    private static void handleMember(HttpExchange exchange, Map<String, String> formData) throws IOException {
        try {
            String name = formData.getOrDefault("name", "");
            int age = Integer.parseInt(formData.getOrDefault("age", "0"));
            String gender = formData.getOrDefault("gender", "Other");
            String phone = formData.getOrDefault("phone", "");
            String email = formData.getOrDefault("email", "");
            String address = formData.getOrDefault("address", "");
            String plan = formData.getOrDefault("plan", "Basic");
            String joinDate = formData.getOrDefault("joinDate", "");
            String expiryDate = formData.getOrDefault("expiryDate", "");

            Member member = new Member();
            member.addMember(name, age, gender, phone, email, address, plan, joinDate, expiryDate);
            redirect(exchange, "/dashboard.html");
        }
        catch (Exception e) {
            String body = "<html><body><h2>Unable to add member</h2><a href=\"/add-member.html\">Try again</a></body></html>";
            sendHtml(exchange, 400, body);
        }
    }

    private static void handleAttendance(HttpExchange exchange, Map<String, String> formData) throws IOException {
        try {
            int memberId = Integer.parseInt(formData.getOrDefault("memberId", "0"));
            String date = formData.getOrDefault("date", "");
            String time = formData.getOrDefault("checkInTime", "");
            String status = formData.getOrDefault("status", "Present");

            Attendance attendance = new Attendance();
            attendance.markAttendance(memberId, date, time, status);
            redirect(exchange, "/dashboard.html");
        }
        catch (Exception e) {
            String body = "<html><body><h2>Unable to save attendance</h2><a href=\"/attendance.html\">Try again</a></body></html>";
            sendHtml(exchange, 400, body);
        }
    }

    private static void handlePayment(HttpExchange exchange, Map<String, String> formData) throws IOException {
        try {
            int memberId = Integer.parseInt(formData.getOrDefault("memberId", "0"));
            double amount = Double.parseDouble(formData.getOrDefault("amount", "0"));
            String paymentDate = formData.getOrDefault("paymentDate", "");
            String paymentMethod = formData.getOrDefault("paymentMethod", "Cash");
            String paymentStatus = "Paid";

            Payment payment = new Payment(memberId, amount, paymentDate, paymentMethod, paymentStatus);
            payment.savePayment();
            redirect(exchange, "/dashboard.html");
        }
        catch (Exception e) {
            String body = "<html><body><h2>Unable to save payment</h2><a href=\"/payment.html\">Try again</a></body></html>";
            sendHtml(exchange, 400, body);
        }
    }

    private static void handleTrainer(HttpExchange exchange, Map<String, String> formData) throws IOException {
        try {
            int memberId = Integer.parseInt(formData.getOrDefault("memberId", "0"));
            String memberName = formData.getOrDefault("memberName", "");
            String trainerName = formData.getOrDefault("trainer", "Arun");
            String specialization = formData.getOrDefault("specialization", "Fitness");
            String assignedDate = formData.getOrDefault("assignedDate", "");

            Trainer trainer = new Trainer(memberId, memberName, specialization, trainerName);
            trainer.assignTrainer(memberId, memberName, trainerName, specialization, assignedDate);
            redirect(exchange, "/dashboard.html");
        }
        catch (Exception e) {
            String body = "<html><body><h2>Unable to assign trainer</h2><a href=\"/trainer.html\">Try again</a></body></html>";
            sendHtml(exchange, 400, body);
        }
    }

    private static void serveFile(HttpExchange exchange, Path file, String contentType) throws IOException {
        if (!Files.exists(file)) {
            sendText(exchange, 404, "File not found");
            return;
        }

        byte[] data = Files.readAllBytes(file);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(200, data.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(data);
        }
    }

    private static void sendReportPage(HttpExchange exchange) throws IOException {
        String reportTemplate = Files.readString(HTML_DIR.resolve("report.html"));
        String renderedRows = ReportService.renderRows();
        String page = reportTemplate.replace("<!--REPORT_ROWS-->", renderedRows);
        sendHtml(exchange, 200, page);
    }

    private static void sendHtml(HttpExchange exchange, int status, String body) throws IOException {
        byte[] data = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
        exchange.sendResponseHeaders(status, data.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(data);
        }
    }

    private static void sendText(HttpExchange exchange, int status, String body) throws IOException {
        byte[] data = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
        exchange.sendResponseHeaders(status, data.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(data);
        }
    }

    private static void redirect(HttpExchange exchange, String location) throws IOException {
        exchange.getResponseHeaders().set("Location", location);
        exchange.sendResponseHeaders(303, -1);
    }

    private static Map<String, String> readForm(HttpExchange exchange) throws IOException {
        InputStream inputStream = exchange.getRequestBody();
        String body = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        Map<String, String> formData = new HashMap<>();

        if (body.isEmpty()) {
            return formData;
        }

        String[] pairs = body.split("&");
        for (String pair : pairs) {
            String[] parts = pair.split("=", 2);
            if (parts.length == 2) {
                formData.put(URLDecoder.decode(parts[0], StandardCharsets.UTF_8), URLDecoder.decode(parts[1], StandardCharsets.UTF_8));
            }
        }

        return formData;
    }
}
