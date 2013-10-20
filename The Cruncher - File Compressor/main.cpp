 //Taylor Franklin & Fraser Mince

#include <iostream>
#include <fstream>
#include "FileStructure.h"
#include "crunch.h"
#include <string>
#include <map>
#include <vector>
#include "dirent.h"
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#include <sys/param.h>
#include <cstring>
#include <sstream>
#include <cassert>
#ifdef _WIN64
    #include <direct.h>
#elif _WIN32
    #include <direct.h>
#endif
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
using namespace std;

string clean(string path){
    int size = path.length();
    for (int i = 0; i < size; i++){
        if (path[i] == '\\'){
            path[i] = '/';
        }
        if(path[size - 1] == '/')
            path.substr(size - 1);
    }
    return path;
}

void info(){
	cout << "Enter commands like so:\ncruncher (directory name) [compress]   -a <algorithm> -o {target}\n";
	cout << "cruncher (directory name) [decompress] -a <algorithm> -o {target}\n";
	cout << "cruncher (directory name) [view]\n";
}

void populate(struct dirent* file, char* path, multimap<string, FileStructure> &m, bool isDir){
    FileStructure value(file, isDir);
    string mapPath = path;//add this to our class
    m.insert(std::make_pair<string,FileStructure> (mapPath, value));//adds things to our map
}


//a recursive function that opens folders and passes everything to populate
void opener(char* path, multimap<string, FileStructure> &m)
{
    struct stat s;
    struct dirent *currentDirectory;
    DIR* directory;

    if((directory = opendir(path)) != NULL) //Returning NULL when it should not. Or is never looking at a directory in our example
    {
        while ((currentDirectory = readdir(directory)) != NULL){
            string dirname = currentDirectory->d_name;
            #ifdef DEBUG
                assert(dirname != "");
            #endif
            string filepath = path;
            if(dirname == "." || dirname == ".." || dirname == ".DS_Store"){//bypasses the . and .. convention of filesystems
                continue;
            } 
            

            stringstream newpath;
            newpath << path << "/" << dirname;
            char finalPath[9001]; 
            strcpy(finalPath, newpath.str().c_str());//all this just appends to our current path manually
            stat(finalPath, &s);
            if(S_ISDIR(s.st_mode)){
                populate(currentDirectory, path, m, true);
                opener(finalPath, m);
            }
            else{
                populate(currentDirectory, path, m, false);
            }
        }
        closedir(directory);
    }  
}

void compressPrep(string parent, multimap<string, FileStructure> &hierarchy, string alg, string primaryTarget){
    string parentName;
    for (int i = parent.length(); i >= 0; i--){
        if (parent[i] == '/' && i != int(parent.length() - 1)){
            parentName = parent.substr(i + 1);
            break;
        }
    }
    string directoryPath = "";
    char dirPath[500];
    string append;
    string target;
    target = primaryTarget;
    target += "/" + parentName + ".cru";//creates the full target
    FileStructure writer(target);
    writer.openWrite();
    map<vector<char>, unsigned int> dictionary;
    unsigned int size = 255;
    char temp;
    char in;
    vector<char> insert;
    for(unsigned int i = 0; i < 256; i++){//populates our dictionary
        temp = i;
        in = temp;
        insert.push_back(in);
        dictionary.insert(std::make_pair<vector<char>, unsigned int> (insert, i));
        insert.clear();
    }

    /*for(multimap<string, FileStructure>::iterator it1 = hierarchy.begin(); it1 != hierarchy.end(); ++it1){
        cout << "  [" << (*it1).first << ", " << (*it1).second << "]" << endl;
    }*/

    for(multimap<string, FileStructure>::iterator it = hierarchy.begin(); it != hierarchy.end(); ++it){
        append = parentName;
        strcpy(dirPath,"");

        FileStructure temp = (*it).second;
        string fullPath = (*it).first;
        append += fullPath.substr((int)parent.length());

        if(alg == "LZMA")
            cout << "You caled LZMA!" << endl;//LZMA(temp, fullPath, target);
        else
            compress(temp, fullPath, append, writer, dictionary, size);
    }
    if (writer.isOpen()){
        writer.close();
    }
}

void decompressPrep(string archived, string target){
    FileStructure reader(archived);
    reader.openRead(archived);
    int nameLength;
    string path;

    map<unsigned int, vector<char> > dictionary;
    unsigned int mapSize = 255;
    char temp;
    vector<char> in;
    for(unsigned int i = 0; i < 256; i++){//populates our dictionary with the ASCII table
        temp = i;
        in.push_back(temp);
        dictionary.insert(std::make_pair<unsigned int, vector<char> > (i, in));
        in.clear();
    }
    unsigned long long fileSize;
    while(!reader.isEnd()){
        fileSize = reader.retrieveSize();
        nameLength = reader.retrieveNameLength();
        path = reader.retrievePath(nameLength);
        string append = "";
        string input = "";
        char directory [10000];
        for (int i = 0; i < (int) path.length(); i++){//creates directories
            if (path[i] == '/'){
                input = target + "/" + append;
                strcpy(directory, input.c_str());
                #ifdef __APPLE__
                    mkdir(directory, S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH); //add the system if statement to mkdirs for mac and possibly linux
                #else
                    mkdir(directory); //add the system elif statement for windows
                #endif
                append += "/";
                
            }
            else
                append += path[i];
        }
        
        decompress(path, target, reader, fileSize, dictionary, mapSize); //runs decompression
        }
        if(reader.isOpen()){
            reader.close();
        }
}


int main(int argc, char* argv[])
{
    string alg;
    string target;
	string action = argv[2];//basic command
    string parentdir = argv[1];//parent directory
    parentdir = clean(parentdir);
    char letters[1000];//copy parendir into a char*
    strcpy(letters, parentdir.c_str());//copies const* into letters a regular char*


    if(action == "view" && argc == 3)
        cout << "show view of all files in directory";
	else if(argc != 7)
        info();//prints error and further instructions
    else {
        string a = argv[3];//algorithm indicator
		string o = argv[5];//target indicator
        if(a == "-a")   //assigns what kind of algorithm it is
            alg = argv[4]; //LZW or LZMA
        else
            alg = "LZW";//default compression
        if(o == "-o")   //assigns where to write compressed files
            target = argv[6];
        else
            target = "..";//copies to one directory up
            
    	target = clean(target);
        if(action == "compress")
        {
            multimap <string, FileStructure> hierarchy;
            opener(letters,hierarchy); //populates the map with the directory you want to read from

            #ifdef DEBUG
                assert(hierarchy.size() > 0);
            #endif
            compressPrep(parentdir, hierarchy, alg, target);

        }
        else if(action == "decompress"){
             decompressPrep(parentdir, target);
        }
    }        
}
