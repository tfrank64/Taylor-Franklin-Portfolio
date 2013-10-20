#include <iostream>
#include "FileStructure.h"
#include "crunch.h"
#include "dirent.h"
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#include <sys/param.h>
#include <string>
#include <cstring>
#include <fstream>
#include <map>
#include <sstream>
#include <cassert>
#include <direct.h>
#include <errno.h>
using namespace std;

//ToDO:  test on multiple files and folders, in copying
		//Merge test.cpp with main.cpp with command line arguments
		//implement compression!

//This funtion calls our FileStructure class and populates our multimap.
void populate(struct dirent* file, char* path, multimap<string, FileStructure> &m, bool isDir){
	FileStructure value(file, isDir);
	string mapPath = path;//add this to our class
	m.insert(std::make_pair<string,FileStructure> (mapPath, value));
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
				//cout << "finalPath: " << finalPath << endl;
				opener(finalPath, m);
			}
			else{
				populate(currentDirectory, path, m, false);//bug
			}
		}
		closedir(directory);
	}  
}

void create(string parent, multimap<string, FileStructure> &hierarchy){
	string directoryPath = "";
    string primaryTarget = "C:/Users/T-Frank/Documents/Programming/TestWrite"; //filename gets appended later
	char dirPath[500];
	string append;
	string target;
	for(multimap<string, FileStructure>::iterator it = hierarchy.begin(); it != hierarchy.end(); ++it){
		target = primaryTarget;	
		append = "";
		strcpy(dirPath,"");
		cout << "  [" << (*it).first << ", " << (*it).second << "]" << endl;

		FileStructure temp = (*it).second;
		string fullPath = (*it).first;
		
		append = fullPath.substr((int)parent.length());
		target += append;
		if (temp.getIsDir()){
			directoryPath = target;
			directoryPath += "/" + temp.getStringName();
			strcpy(dirPath, directoryPath.c_str());
			mkdir(dirPath);
			//cout << "Directory was created" << endl;
		}
		else{
			LZW(temp, fullPath, target);
		}
		//cout << "test" << endl;
	}
}



int main(){
	string parent = "C:/Users/T-Frank/Documents/Programming/TestRead";
	char letters[1000];
	strcpy(letters, parent.c_str());//copies const* into letters a regular char*
	multimap <string, FileStructure> hierarchy;
	opener(letters, hierarchy);

    cout << "mymultimap.size() is " << (int) hierarchy.size() << endl;
    #ifdef DEBUG
    	assert(hierarchy.size() > 0);
    #endif
    create(parent, hierarchy);	
}