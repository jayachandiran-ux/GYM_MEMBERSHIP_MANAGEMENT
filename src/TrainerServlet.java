import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/trainers")
public class TrainerServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        // Read form fields — names match trainer.html exactly
        String memberIdStr   = request.getParameter("memberId");
        String memberName    = request.getParameter("memberName");
        String trainerName   = request.getParameter("trainer");
        String specialization = request.getParameter("specialization");
        String assignedDate  = request.getParameter("assignedDate");

        try {
            int memberId = Integer.parseInt(memberIdStr);

            Trainer trainer = new Trainer(memberId, trainerName, specialization, "");
            trainer.assignTrainer(memberId, memberName, trainerName, specialization, assignedDate);

            // Redirect to dashboard after success
            response.sendRedirect(request.getContextPath() + "/dashboard.html");

        } catch (Exception e) {
            // Redirect back with error flag
            response.sendRedirect(request.getContextPath() + "/trainer.html?error=1");
        }
    }
}
