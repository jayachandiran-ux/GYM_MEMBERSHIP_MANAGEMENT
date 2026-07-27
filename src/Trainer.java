import java.sql.Connection;
import java.sql.PreparedStatement;

public class Trainer {

    int trainerId;
    String trainerName;
    String specialization;
    String phoneNumber;

    public Trainer(int trainerId,
                   String trainerName,
                   String specialization,
                   String phoneNumber) {

        this.trainerId = trainerId;
        this.trainerName = trainerName;
        this.specialization = specialization;
        this.phoneNumber = phoneNumber;

    }

    public void displayTrainer() {

        System.out.println("------ Trainer Details ------");

        System.out.println("Trainer ID      : " + trainerId);
        System.out.println("Trainer Name    : " + trainerName);
        System.out.println("Specialization  : " + specialization);
        System.out.println("Phone Number    : " + phoneNumber);

    }

    public void assignTrainer(int memberId, String memberName, String trainerName, String specialization, String assignedDate) {
        try {
            Connection con = DBConnection.getConnection();
            String sql = "INSERT INTO trainers(member_id, member_name, trainer_name, specialization, assigned_date) VALUES(?,?,?,?,?)";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, memberId);
            ps.setString(2, memberName);
            ps.setString(3, trainerName);
            ps.setString(4, specialization);
            ps.setString(5, assignedDate);
            ps.executeUpdate();
            con.close();
        }
        catch (Exception e) {
            System.out.println(e);
        }
    }

    public static void main(String args[]) {

        Trainer t = new Trainer(
                1,
                "Arun",
                "Body Building",
                "9876543210"
        );

        t.displayTrainer();

    }

}