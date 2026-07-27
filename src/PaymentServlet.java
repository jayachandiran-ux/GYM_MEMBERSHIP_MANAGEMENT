import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/payments")
public class PaymentServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        // Read form fields — names match payment.html exactly
        String memberIdStr    = request.getParameter("memberId");
        String amountStr      = request.getParameter("amount");
        String paymentDate    = request.getParameter("paymentDate");
        String paymentMethod  = request.getParameter("paymentMethod");

        try {
            int memberId    = Integer.parseInt(memberIdStr);
            double amount   = Double.parseDouble(amountStr);
            String status   = "Paid";

            Payment payment = new Payment(memberId, amount, paymentDate, paymentMethod, status);
            payment.savePayment();

            // Redirect to dashboard after success
            response.sendRedirect(request.getContextPath() + "/dashboard.html");

        } catch (Exception e) {
            // Redirect back with error flag
            response.sendRedirect(request.getContextPath() + "/payment.html?error=1");
        }
    }
}
