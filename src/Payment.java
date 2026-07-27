import java.sql.Connection;
import java.sql.PreparedStatement;

public class Payment {

    int memberId;
    double amount;
    String paymentDate;
    String paymentMethod;
    String paymentStatus;

    public Payment(int memberId, double amount,
                   String paymentDate,
                   String paymentMethod,
                   String paymentStatus) {

        this.memberId = memberId;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;

    }

    public void displayPayment() {

        System.out.println("------ Payment Details ------");

        System.out.println("Member ID      : " + memberId);
        System.out.println("Amount         : " + amount);
        System.out.println("Payment Date   : " + paymentDate);
        System.out.println("Payment Method : " + paymentMethod);
        System.out.println("Status         : " + paymentStatus);

    }

    public void savePayment() {
        try {
            Connection con = DBConnection.getConnection();
            String sql = "INSERT INTO payments(member_id, amount, payment_date, payment_method, payment_status) VALUES(?,?,?,?,?)";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, memberId);
            ps.setDouble(2, amount);
            ps.setString(3, paymentDate);
            ps.setString(4, paymentMethod);
            ps.setString(5, paymentStatus);
            ps.executeUpdate();
            con.close();
        }
        catch (Exception e) {
            System.out.println(e);
        }
    }

    public static void main(String args[]) {

        Payment p = new Payment(
                1,
                1500,
                "28-07-2026",
                "Cash",
                "Paid"
        );

        p.displayPayment();

    }

}