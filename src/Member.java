import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.Scanner;

public class Member {

    public void addMember(String name, int age, String gender,
                          String phone, String email,
                          String address, String plan,
                          String joinDate, String expiryDate) {

        try {

            Connection con = DBConnection.getConnection();

            String sql = "INSERT INTO members(full_name, age, gender, phone_number, email, address, membership_plan, join_date, expiry_date, membership_status) VALUES(?,?,?,?,?,?,?,?,?,?)";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setString(1, name);
            ps.setInt(2, age);
            ps.setString(3, gender);
            ps.setString(4, phone);
            ps.setString(5, email);
            ps.setString(6, address);
            ps.setString(7, plan);
            ps.setString(8, joinDate);
            ps.setString(9, expiryDate);
            ps.setString(10, "Active");

            int result = ps.executeUpdate();

            if(result > 0){

                System.out.println();
                System.out.println("====================================");
                System.out.println("Member Added Successfully");
                System.out.println("====================================");

            }
            else{

                System.out.println("Failed to Add Member");

            }

            con.close();

        }

        catch(Exception e){

            if(e.getMessage().contains("phone_number")){

                System.out.println("Phone Number Already Exists");

            }
            else if(e.getMessage().contains("email")){

                System.out.println("Email Already Exists");

            }
            else{

                System.out.println(e);

            }

        }

    }

    public static void main(String args[]) {

        Scanner sc = new Scanner(System.in);

        Member obj = new Member();

        System.out.println("========== ADD MEMBER ==========");

        System.out.print("Enter Full Name : ");
        String name = sc.nextLine();

        System.out.print("Enter Age : ");
        int age = sc.nextInt();
        sc.nextLine();

        System.out.print("Enter Gender : ");
        String gender = sc.nextLine();

        System.out.print("Enter Phone Number : ");
        String phone = sc.nextLine();

        System.out.print("Enter Email : ");
        String email = sc.nextLine();

        System.out.print("Enter Address : ");
        String address = sc.nextLine();

        System.out.print("Enter Membership Plan (Basic/Standard/Premium) : ");
        String plan = sc.nextLine();

        System.out.print("Enter Join Date (YYYY-MM-DD) : ");
        String joinDate = sc.nextLine();

        System.out.print("Enter Expiry Date (YYYY-MM-DD) : ");
        String expiryDate = sc.nextLine();

        obj.addMember(
                name,
                age,
                gender,
                phone,
                email,
                address,
                plan,
                joinDate,
                expiryDate
        );

        sc.close();

    }

}