import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        Login login = new Login();
        boolean isValid = login.checkLogin(username, password);

        if (isValid) {
            // Create session on successful login
            HttpSession session = request.getSession();
            session.setAttribute("admin", username);
            response.sendRedirect(request.getContextPath() + "/dashboard.html");
        } else {
            // Redirect back to login with error flag
            response.sendRedirect(request.getContextPath() + "/login.html?error=1");
        }
    }
}
