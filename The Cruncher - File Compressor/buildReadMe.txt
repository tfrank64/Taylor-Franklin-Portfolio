Cross-Platform Build Documentation

Windows:
For the windows batch file, all you need to do is open it within the direcotry all the code
is located in and it will build your program making a cruncher.exe. For this particular batch file, I compile with
g++ and throw in some error checking with -Wall and -Wextra then the batch file gets the file names of the program
I am trying to build. The -o makes it able for me to enter command line arguments later and I put in the 
variable name cruncher, being that the name of our compressor/decompressor is The Cruncher. A pause commmand
is inserted at the end so the command prompt stays open as long as the user wants in order to see what actually
happened and for us to see errors during a testing and debugging process.

Mac:
For Mac, I won't go over all the same details with error checking and command line argument stuff. We use a shell script
to run the commands that build the file. It is very similar to the contents of the windows batch file, but it differs
a little in how you run it. You can run it from the terminal as long as you are in the same directory. For our script,
you should just type sh builder.sh and it will build your program.