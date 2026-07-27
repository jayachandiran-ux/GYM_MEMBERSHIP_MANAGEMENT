import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class ReportService {

    public static String renderRows() {
        StringBuilder html = new StringBuilder();
        try {
            Connection con = DBConnection.getConnection();
            String sql = "SELECT member_id, full_name, membership_plan, membership_status FROM members ORDER BY member_id";
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                html.append("<tr>")
                        .append("<td>").append(rs.getInt("member_id")).append("</td>")
                        .append("<td>").append(rs.getString("full_name")).append("</td>")
                        .append("<td>").append(rs.getString("membership_plan")).append("</td>")
                        .append("<td>-</td>")
                        .append("<td>").append(rs.getString("membership_status")).append("</td>")
                        .append("<td>").append(rs.getString("membership_status")).append("</td>")
                        .append("</tr>");
            }

            con.close();
        }
        catch (Exception e) {
            html.append("<tr><td colspan='6'>Unable to load report</td></tr>");
        }
        return html.toString();
    }
}
