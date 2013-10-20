//Taylor Franklin & Fraser Mince
//cpp file with function calls
#include <iostream>
#include "FileStructure.h"
#include "dirent.h"
#include <string>
#include <fstream>
#include <map>
#include <cassert>
#include <sys/stat.h>
#include <cstring>
#include <time.h>
#include <utime.h>

using namespace std;
//function for asserting whatever we need to test

FileStructure::FileStructure(struct dirent *input, bool direct){
	if (input != NULL){
		stringName = input->d_name;
		strcpy(charname, input->d_name);
		struct stat info; 
		stat(charname, &info);
		strcpy(modTime, ctime(&info.st_mtime));
		isDir = direct;
	}
	#ifdef DEBUG
		validate();
	#endif
}
//basically need to append input->d_name to target using a helper funciton, called from compress
FileStructure::FileStructure(string target){//add suffix parameter to add later
	isDir = false;
	stringName = target;
	strcpy(charname, stringName.c_str());
	isDir = false; //this should never be used if the class is initialized with this constructor.
	length = 0;
	remain = 0;
}

FileStructure FileStructure::operator= (const FileStructure& other){
	stringName = other.getStringName();
	strcpy(charname, stringName.c_str());
	isDir = other.getIsDir();
	length = other.getLength();
	remain = other.getRemain();
	strcpy(modTime, getTime());
	return *this;
}

FileStructure::FileStructure (const FileStructure& other){
	stringName = other.getStringName();
	strcpy(charname, stringName.c_str());
	isDir = other.getIsDir();
	length = other.getLength();
	remain = other.getRemain();
}


void FileStructure::openRead(string fullPath){
	string extension = "";
	for(int i = fullPath.length() - 4; i < (int)fullPath.length(); i++)
		extension += fullPath[i];
	if(extension != ".cru"){
		fullPath.append("/");
		fullPath.append(charname);//adds the actual file name to full file path
	}
	char temp[1000];
	strcpy(temp, fullPath.c_str());

	f.open (temp,  ios::in | ios::out | ios::binary);//opens exsisting file
	f.seekg(0,ios::end); //sets to end of data
	length = f.tellg(); //saves the length of all data from filepath
	f.seekg(0,ios::beg); //resets to beginning
	#ifdef DEBUG
		validate();
	#endif
}

void FileStructure::openWrite(){
	f.open(charname, ios::out);//creates new file, just ios out for creation
	f.close(); //closes so you can then perform a varity of operations
	f.open(charname,  ios::out | ios::in | ios::binary);
	#ifdef DEBUG
		validate();
	#endif
}

bool FileStructure::isOpen(){
	if(f.is_open())
		return true;
	return false;
}

bool FileStructure::isEnd()  { //tellg is current pointer, so if equal to length, you have reached the end
	if(f.tellg() == length || f.tellg() < 0){
		return true;
	}
	return false;
}



char* FileStructure::read(){
	if (f.is_open()){
	    f.read(buffer, 4096);
	    remain = f.gcount(); //will be 4096 or less depending on how close to the end
	    #ifdef DEBUG
			validate();
		#endif
	    return buffer;
	}
	return NULL;
}


void FileStructure::readData(unsigned short& one, unsigned short& two){
	unsigned int num = 0;
	one = 0;
	two = 0;
	f.read((char*)(&num), 3);
	one = num / 4096;
	two = num % 4096;
}

unsigned long long FileStructure::retrieveSize(){//returns filesize
	unsigned long long keep;
	f.read((char*)&keep, 8);
	return keep;
}

int FileStructure::retrieveNameLength(){//returns filename size
	int ret;
	f.read((char*)&ret, 4);
	return ret;
}

string FileStructure::retrievePath(int num){//returns filename
	char name [1000];
	f.read(name, num);
	string ret = string(name, name + num);
	return ret;
}

void FileStructure::write(char* buffer, int num){
	if (f.is_open()){
    	f.write(buffer, num);//writes only what you need to file
    }
}

void FileStructure::write(unsigned short one, unsigned short two){
	assert(one < 4096 && two < 4096);
	unsigned int w = ((unsigned int) one) * 4096 + two;
	f.write((char*)&w, 3);
}	

void FileStructure::write(string fileName, unsigned long long fileLength){
	char name[1000];
	strcpy(name, fileName.c_str());
	f.write((char*)&fileLength, 8);
	unsigned int temp = fileName.length();
	f.write((char*)&temp, 4);
	f.write(name, (int)fileName.length());
}

void FileStructure::write(string directory){
	f << directory << endl;
}

void FileStructure::close(){
	f.close();
}


#ifdef DEBUG
	void FileStructure::validate()
	{
		assert(stringName != "");
		assert(strlen(charname) != 0);
		assert(length >= 0);
		assert((int)strlen(buffer) >= 0);
		assert(f.tellg() >= - 2);//only acceptla negative value
		assert(strlen(charname) == (int)stringName.length());
	}
#endif
std::ostream& operator<<(std::ostream& os,const FileStructure& other)   {
	other.print(os); 
	return os;
}
