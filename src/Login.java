import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class Login {

    public boolean checkLogin(String username, String password) {

        try {

            Connection con = DBConnection.getConnection();

            String sql = "select * from admin where username=? and password=?";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setString(1, username);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                return true;

            }

        }

        catch (Exception e) {

            System.out.println(e);

        }

        return false;

    }

    public static void main(String args[]) {

        Login obj = new Login();

        boolean result = obj.checkLogin("admin", "Jai@2007");

        if (result) {

            System.out.println("Login Successful");

        }

        else {

            System.out.println("Invalid Username or Password");

        }

    }

}