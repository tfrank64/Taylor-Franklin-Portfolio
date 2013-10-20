//Taylor Franklin & Fraser Mince
#include <iostream>
#include "dirent.h"
#include <fstream>
#include <map>
#include <fstream>
#include <string>
#include <cstring>


class FileStructure{
public:
    FileStructure(struct dirent* input, bool direct);
    FileStructure(std::string target);
    FileStructure (const FileStructure& other);
    char* read(); //reads bits of file and sends to compressor
    void readData(unsigned short& one, unsigned short& two);
    unsigned long long retrieveSize();
    int retrieveNameLength();
    std::string retrievePath(int num);
    void write(char* data, int num); //writes data into a new file
    void write(std::string fileName, unsigned long long fileLength);
    void write(unsigned short one, unsigned short two);
    void write(std::string path);
    void openRead(std::string fullPath);
    void openWrite();
    void close();
    bool isEnd();
    bool operator< (const FileStructure& other) const  {return getStringName() < other.getStringName();}
    std::string getStringName() const                  {return stringName;}
    void print(std::ostream& os)  const                {os << stringName;}
    FileStructure operator= (const FileStructure& other);
    bool isOpen();
    bool getIsDir() const                              {return isDir;}
    int  getLength() const                             {return length;}
    int getRemain() const                              {return remain;}
    int location()                                     {return f.tellg();}
    char* getTime()                                    {return modTime;}
private:
    char modTime [40];
    bool isDir;
    char charname[1000]; //size of 1000 because filepaths could potentially be pretty long
    std::string stringName;
    int length; //length of data in file
    int remain; //will be 16 or something less than, the remainder
    std::fstream f;
    char buffer[4096]; //could increase to 4096, the block size
    #ifdef DEBUG
      void validate();
    #endif
};

std::ostream& operator<<(std::ostream& os,const FileStructure& other);   //{other.print(os); return os;}
