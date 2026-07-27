import java.util.Scanner;

public class Main {

    public static void main(String args[]) {

        Scanner sc = new Scanner(System.in);

        System.out.println("----------------------------------");
        System.out.println("GYM MEMBERSHIP MANAGEMENT SYSTEM");
        System.out.println("----------------------------------");
        System.out.println("1. Login");
        System.out.println("2. Add Member");
        System.out.println("3. Attendance");
        System.out.println("4. Payment");
        System.out.println("5. Trainer");
        System.out.println("6. Report");
        System.out.println("----------------------------------");

        System.out.print("Enter your choice : ");

        int choice = sc.nextInt();

        if(choice == 1){

            System.out.println("Login Module");

        }
        else if(choice == 2){

            System.out.println("Add Member Module");

        }
        else if(choice == 3){

            System.out.println("Attendance Module");

        }
        else if(choice == 4){

            System.out.println("Payment Module");

        }
        else if(choice == 5){

            System.out.println("Trainer Module");

        }
        else if(choice == 6){

            System.out.println("Report Module");

        }
        else{

            System.out.println("Invalid Choice");

        }

        sc.close();
    }
}