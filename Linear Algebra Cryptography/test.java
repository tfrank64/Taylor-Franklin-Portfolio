/* import the Java Open Maple classes */
import com.maplesoft.openmaple.*;
/* import the MapleException class */
import com.maplesoft.externalcall.MapleException;
class test
{
    /* declare the main function */
    public static void main( String args[] )
    {
        String a[];
        Engine t;
        int i;
        /* build the command line arguments for Maple */
        a = new String[1];
        a[0] = "java";
        int n = 2;
        int m = 3;
        try
        {
            /* start the Maple session.  Use the Default EngineCallBacks. 
             * the text Output will be directed to System.out */
            t = new Engine( a, new EngineCallBacksDefault(), null, null );
            /* evaluate a simple expression */
            //t.evaluate( "int( x,x );" );
            t.evaluate( "with(LinearAlgebra): A:=<<2,4,8>|<8,2,4>|<4,8,2>>; ReducedRowEchelonForm(A);" );

            t.stop();
        }
        catch ( MapleException e )
        {
            /* if an error occurs, exit */
            System.out.println( "An exception occured\n" );
            return;
        }
        /* on success print a message */
        System.out.println( "Done\n" );
    }
}
