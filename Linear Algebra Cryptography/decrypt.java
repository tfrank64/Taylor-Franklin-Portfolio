/**
 * Linear Algebra Project, Hill Cipher, including:
 * Matriix multiplication
 *matrix multiplier inpired by: http://blog.ryanrampersad.com/2010/01/matrix-multiplication-in-java/
 */
/* import the Java Open Maple classes */
import com.maplesoft.openmaple.*;
/* import the MapleException class */
import com.maplesoft.externalcall.MapleException;

import java.util.*;
import java.io.*;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

class decrypt {

	public static int[] explode(String phrase) {
		//basically does an explode on the user inputted string
	    char[] phraseChar = phrase.toCharArray();
	    int intArray[] = new int[phraseChar.length];
	    for (int count = 0; count < phraseChar.length; ++count) {
   			intArray[count] = phrase.charAt(count);
	    }
	    return intArray;
	}

	public static String noSpace(String fin) {
		char[] phraseChar = fin.toCharArray();
		String newString = "";
		for(int i = 0; i < phraseChar.length; i++) {
			if(phraseChar[i] == '@')
				phraseChar[i] = ' ';
			newString += phraseChar[i];
		}
		return newString;
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
		      			//System.out.println("spot: " + row + " " + in + " ~ " + in + " " + col);
		      			//System.out.println("val: " + cipher[row][in] + " " + prep[in][col]);
		      		}
		      }
		}
	 	return encrypted;
	}

	public static int[][] modMatrix(int[][] large) {
		for (int row = 0; row < large.length; row++) {

		      for (int col = 0; col < large[ row ].length; col++) {
			  large[row][col] = large[row][col] % 27;
		      }
		}
		return large;
	}

	public static char[][] numToLetter(int[][] val) {
		char[][] letters = new char[val.length][val[0].length];
		for (int row = 0; row < val.length; row++) {

		      for (int col = 0; col < val[ row ].length; col++) {
		      		int a = val[row][col] + 64;
		      		//char b = a;
		   			letters[row][col] = (char)a;
		      }
		}
		return letters;
	}

    public static int[][] getCipher(String[] args) {
	int[][] cipher = null;
	if (args.length < 1) {
	    cipher = { //generic cipher key, will make randomly generated invertible matrix later
        		{1,0,1},
        		{4,4,3},
        		{-4,-3,-3}
	              };
	}
	else {
	    try {
		BufferedReader br = new BufferedReader(new FileReader(args[0]));
		String line;
		int counter = 0;
		cipher = new int[3][3];
		while ((line = br.readLine()) != null) {
		    // process the line.
		    String[] strArr = line.split(",");
		    
		    int cell1 = Integer.parseInt(strArr[0]);
		    int cell2 = Integer.parseInt(strArr[1]);
		    int cell3 = Integer.parseInt(strArr[2]);
		    cipher[counter++] = cell1;
		    cipher[counter++] = cell2;
		    cipher[counter++] = cell3;
		}
		br.close();
	    } catch (FileNotFoundException ex) {
		Logger.getLogger(CSVParser.class.getName()).log(Level.SEVERE, null, ex);
	    } catch (Exception e) {
		System.err.println("An error ocurred while processing the CSV file!");
	    }
	}
	return cipher;
    } 

    public static int[][] invertMatrix(int[][] matrix) {
	int[][] inverse = new int[3][3];

	String mapleStmt = "LinearAlgebra:-MatrixInverse(Matrix(3,3,["+matrix[0][0]+","+matrix[0][1]+","+matrix[0][2]+","+matrix[1][0]+","++matrix[1][1]+","+matrix[1][2]+","+matrix[2][0]+","+matrix[2][1]+","+matrix[2][2]+"]));";
	
	String a[];
        Engine t;
	AlgebraicRTable a1;
        /* build the command line arguments for Maple */
        a = new String[1];
        a[0] = "java";
        try
        {
            /* start the Maple session.  Use the Default EngineCallBacks. 
             * the text Output will be directed to System.out */
            t = new Engine( a, new EngineCallBacksDefault(), null, null );
            /* evaluate a simple expression */
            //t.evaluate( "int( x,x );" );
            a1 = (AlgebraicRTable)t.evaluate( mapleStmt );
	    for (int i = 0; i < 3; i++) {
		for (int j = 0; j < 3; j++){
		    int[] index = new int[2];
		    index[0] = i;
		    index[1] = j;
		    Algebraic a = a1.select(index);
		    Double d = a.evalhf();
		    inverse[i][j] = d.intValue();
		}
	    }
            t.stop();
        }
        catch ( MapleException e )
        {
            /* if an error occurs, exit */
            System.out.println( "An exception occured\n" );
            return;
        }

	return inverse;
    } 

    public static void main(String[] args) {

    	int[][] cipher = getCipger(args);

        //must enter numbers now, not text!
        System.out.println("Enter Encrypted numbers: "); // Display the string.
        String encoded;
        Scanner get = new Scanner(System.in);

        //The following code turns userinputted numbers and makes and int array
        encoded = get.nextLine();
		String[] items = encoded.split(" ");

		int[] results = new int[items.length];

		for (int i = 0; i < items.length; i++) {
		    try {
		        results[i] = Integer.parseInt(items[i]);
		    } catch (NumberFormatException nfe) {};
		}

      	int[] usrInput = results;
       	int tmp = usrInput.length%3;
       	if(tmp != 0)//if 1 then 2 extra spaces, if 2 then 1 extra space
       		tmp = usrInput.length/3 + 1;
       	else
       		tmp = usrInput.length/3;
      	System.out.println("tmp: " + tmp);
	int[][] prep = new int[3][tmp];

      	prep = toTwoD(prep,usrInput, tmp);
      	System.out.println("\nprep matrix: ");
      	print(prep);
      	System.out.println("\ncipher matrix: ");
      	print(cipher);
      	
      	int[][] large = mult(cipher, prep);
      	int[][] small = modMatrix(large);

      	System.out.println("\nDecypted Matrix: ");
      	print(large);

      	char[][] complete = numToLetter(small);
      	String theEnd = "";
      	System.out.println("\nDecoded Phrase: ");
      	for (int col = 0; col < complete[0].length; col++)
	{
       	      for (int row = 0; row < complete.length; row++)
       	      {
       			theEnd += complete[ row ] [ col ] + " ";
       	      }
       	}
       	theEnd = noSpace(theEnd);
       	System.out.println(theEnd);
    }
}
