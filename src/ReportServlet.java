import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/api/report")
public class ReportServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html; charset=UTF-8");
        PrintWriter out = response.getWriter();

        out.println("<!DOCTYPE html>");
        out.println("<html>");
        out.println("<head>");
        out.println("  <title>Reports</title>");
        out.println("  <link rel='stylesheet' href='" + request.getContextPath() + "/css/report.css'>");
        out.println("</head>");
        out.println("<body>");

        out.println("  <div class='header'><h2>GYM MEMBERSHIP MANAGEMENT</h2></div>");
        out.println("  <div class='report-box'>");
        out.println("    <h3>Member Report</h3>");
        out.println("    <table>");
        out.println("      <tr>");
        out.println("        <th>Member ID</th>");
        out.println("        <th>Name</th>");
        out.println("        <th>Plan</th>");
        out.println("        <th>Trainer</th>");
        out.println("        <th>Payment</th>");
        out.println("        <th>Status</th>");
        out.println("      </tr>");

        try {
            Connection con = DBConnection.getConnection();

            // Fetch members with their latest payment status and assigned trainer
            String sql =
                "SELECT m.member_id, m.full_name, m.membership_plan, m.membership_status, " +
                "  IFNULL((SELECT tr.trainer_name FROM trainers tr WHERE tr.member_id = m.member_id LIMIT 1), '-') AS trainer_name, " +
                "  IFNULL((SELECT py.payment_status FROM payments py WHERE py.member_id = m.member_id ORDER BY py.payment_id DESC LIMIT 1), '-') AS payment_status " +
                "FROM members m " +
                "ORDER BY m.member_id";

            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                out.println("<tr>");
                out.println("  <td>" + rs.getInt("member_id") + "</td>");
                out.println("  <td>" + rs.getString("full_name") + "</td>");
                out.println("  <td>" + rs.getString("membership_plan") + "</td>");
                out.println("  <td>" + rs.getString("trainer_name") + "</td>");
                out.println("  <td>" + rs.getString("payment_status") + "</td>");
                out.println("  <td>" + rs.getString("membership_status") + "</td>");
                out.println("</tr>");
            }

            rs.close();
            ps.close();
            con.close();

        } catch (Exception e) {
            out.println("<tr><td colspan='6'>Unable to load report: " + e.getMessage() + "</td></tr>");
        }

        out.println("    </table>");
        out.println("    <div class='buttons'>");
        out.println("      <button onclick='window.print()'>Print Report</button>");
        out.println("      <button onclick=\"location.href='" + request.getContextPath() + "/dashboard.html'\">Back</button>");
        out.println("    </div>");
        out.println("  </div>");
        out.println("</body>");
        out.println("</html>");
    }
}
