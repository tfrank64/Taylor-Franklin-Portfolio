/**
 * Linear Algebra Project, Hill Cipher, Encryption File.
 *
 *matrix multiplier inpired by: http://blog.ryanrampersad.com/2010/01/matrix-multiplication-in-java/
 */
import java.util.*;
import java.io.*;

class encrypt {

	public static char[] explode(String phrase) {
		//basically does an explode on the user inputted string
	    char[] phraseChar = phrase.toCharArray();
	    for(int i = 0; i < phrase.length(); i++)
	    {
	    	//System.out.println(phraseChar[i]);
	    }
	    return phraseChar;
	}

	//prints mainly for testing now
	public static void print(int[][] look) {
		for (int row = 0; row < look.length; row++)
		{
		      for (int col = 0; col < look[ row ].length; col++)
		      {
		   			System.out.print(look[ row ] [ col ] + " ");
		      }
		      System.out.println( );
		}
	}
	public static void printArray(int[] look) {
			System.out.println("size: " + look.length);
	      for (int col = 0; col < look.length; col++)
	      {
	   			System.out.println("~ " +look[col] + "  ");
	      }
	}

	public static int[][] toTwoD(int[][] prep, int[] hold, int col) {
		int count = 0;
		for(int i = 0; i < col; i++)
		   for(int j = 0; j < 3; j++) {
		   		if(count == hold.length) {
		   			prep[j][i] = 27; //for hold not divisble by 3, add blanks
		   		}
		   		else {
		   			prep[j][i] = hold[count]; 
		       		count++;
		   		}
		       //System.out.println("prep: " + prep[j][i]);
		    }
		return prep;
	}

	/*--------Matrix Multipler---------------*/  
	public static int[][] mult(int[][] cipher, int[][] prep) {
   
	  int cipherRows = cipher.length, cipherCol = cipher[0].length, prepRows = prep.length, prepCols = prep[0].length;
        int[][] encrypted = new int[cipherRows][prepCols];

        if(cipherCol != prepRows) { //will probably never hit this
	    	throw new IllegalArgumentException("Cipher Row Length: " + cipherCol + " did not match Prep Column Length " + prepRows + ".");
	  	}

		for (int row = 0; row < cipherRows; row++)
		{
		      for (int col = 0; col < prepCols; col++)
		      {
		      		for(int in = 0; in < cipherCol; in++)//in is number of values to add together for each value in result
		      		{
		      			encrypted[row][col] += cipher[row][in]*prep[in][col];
		      		}
		      }
		}
	 	return encrypted;
	}

	public static int[][] modMatrix(int[][] large) {
		for (int row = 0; row < large.length; row++) {

		      for (int col = 0; col < large[ row ].length; col++) {
		   			large[row][col] = large[row][col] % 26;
		      }
		}
		return large;
	}

	public static char[][] numToLetter(int[][] val) {
		char[][] letters = new char[val.length][val[0].length];
		for (int row = 0; row < val.length; row++) {

		      for (int col = 0; col < val[ row ].length; col++) {
		      		int a = val[row][col] + 65;
		   			letters[row][col] = (char)a;
		      }
		}
		return letters;
	}

    public static void main(String[] args) {

    	int[][] cipher = { //generic cipher key, will make randomly generated invertible matrix later
        		{-3,-3,-4},
        		{0,1,1},
        		{4,3,4}
        };


        System.out.println("Enter a phrase without special characters to be encrypted: "); // Display the string.
        String phrase;
        Scanner get = new Scanner(System.in);
     	phrase = get.nextLine();

      	phrase = phrase.toUpperCase();
      	char[] usrInput = explode(phrase);
		
		int tmp = usrInput.length%3;
		if(tmp != 0)//if 1 then 2 extra spaces, if 2 then 1 extra space
			tmp = usrInput.length/3 + 1;
		else
			tmp = usrInput.length/3;
		//System.out.println("tmp: " + tmp);
		int[][] prep = new int[3][tmp];
		int[] hold = new int[usrInput.length];
      	for(int conv = 0; conv < usrInput.length; conv++) {
      		int a = usrInput[conv];
      		char b = usrInput[conv];
      		if(a == 32) //accounts for space
      			hold[conv] = 27;
      		else
      			hold[conv] = a - 64; //using ascii code to assign letters from 0-26, 26 being space

      	}

      	prep = toTwoD(prep,hold, tmp);
      	System.out.println("\nPrep matrix: ");
      	print(prep);
      	System.out.println("\nCipher matrix: ");
      	print(cipher);
      	
      	int[][] large = mult(cipher, prep);
      	System.out.println("\nEncrypted matrix: ");
		print(large);

      	String theEnd = "";
      	System.out.println("\nEncoded Matrix: ");
      	for (int col = 0; col < large[0].length; col++)
		{
		      for (int row = 0; row < large.length; row++)
		      {
		   			theEnd += large[ row ] [ col ] + " ";
		      }
		}
		System.out.println(theEnd); 

    }
}