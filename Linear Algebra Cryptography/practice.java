import java.util.*;
import java.io.*;


class practice {

    public static void main(String[] args) {
        String arr = "1 -2";
		String[] items = arr.split(" ");

		int[] results = new int[items.length];

		for (int i = 0; i < items.length; i++) {
		    try {
		        results[i] = Integer.parseInt(items[i]);
		        System.out.println(results[i]);
		    } catch (NumberFormatException nfe) {};
		}
    }
}