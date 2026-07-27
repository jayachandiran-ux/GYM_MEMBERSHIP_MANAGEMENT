import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/attendance")
public class AttendanceServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        // Read form fields — names match attendance.html exactly
        String memberIdStr  = request.getParameter("memberId");
        String date         = request.getParameter("date");
        String checkInTime  = request.getParameter("checkInTime");
        String status       = request.getParameter("status");

        try {
            int memberId = Integer.parseInt(memberIdStr);

            Attendance attendance = new Attendance();
            attendance.markAttendance(memberId, date, checkInTime, status);

            // Redirect to dashboard after success
            response.sendRedirect(request.getContextPath() + "/dashboard.html");

        } catch (Exception e) {
            // Redirect back with error flag
            response.sendRedirect(request.getContextPath() + "/attendance.html?error=1");
        }
    }
}
