import java.sql.Connection;
import java.sql.PreparedStatement;

public class Attendance {

    public void markAttendance(int memberId, String date, String time, String status) {

        try {

            Connection con = DBConnection.getConnection();

            String sql = "insert into attendance(member_id, attendance_date, check_in_time, attendance_status) values(?,?,?,?)";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setInt(1, memberId);
            ps.setString(2, date);
            ps.setString(3, time);
            ps.setString(4, status);

            int rows = ps.executeUpdate();

            if(rows > 0){

                System.out.println("Attendance Added Successfully");

            }
            else{

                System.out.println("Failed");

            }

            con.close();

        }

        catch(Exception e){

            System.out.println(e);

        }

    }

    public static void main(String args[]){

        Attendance obj = new Attendance();

        obj.markAttendance(
                1,
                "2026-07-28",
                "07:30:00",
                "Present"
        );

    }

}