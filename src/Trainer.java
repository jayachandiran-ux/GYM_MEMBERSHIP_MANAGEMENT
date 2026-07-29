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

    public void assignTrainer(int memberId, int trainerId, String assignedDate) {
        try {
            Connection con = DBConnection.getConnection();
            // Insert into trainer_assignments using correct schema
            String sql = "INSERT INTO trainer_assignments(member_id, trainer_id, assigned_date) VALUES(?,?,?)";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, memberId);
            ps.setInt(2, trainerId);
            ps.setString(3, assignedDate);
            ps.executeUpdate();
            ps.close();
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