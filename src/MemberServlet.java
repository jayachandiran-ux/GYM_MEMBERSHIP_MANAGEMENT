import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/members")
public class MemberServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        // Read form fields — names match add-member.html exactly
        String name      = request.getParameter("name");
        String ageStr    = request.getParameter("age");
        String gender    = request.getParameter("gender");
        String phone     = request.getParameter("phone");
        String email     = request.getParameter("email");
        String address   = request.getParameter("address");
        String plan      = request.getParameter("plan");
        String joinDate  = request.getParameter("joinDate");
        String expiryDate = request.getParameter("expiryDate");

        try {
            int age = Integer.parseInt(ageStr);

            Member member = new Member();
            member.addMember(name, age, gender, phone, email, address, plan, joinDate, expiryDate);

            // Redirect to dashboard after success
            response.sendRedirect(request.getContextPath() + "/dashboard.html");

        } catch (Exception e) {
            // Redirect back with error flag
            response.sendRedirect(request.getContextPath() + "/add-member.html?error=1");
        }
    }
}
