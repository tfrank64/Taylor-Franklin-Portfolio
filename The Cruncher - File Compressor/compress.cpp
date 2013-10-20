//Fraser Mince and Taylor Franklin
#ifdef _WIN64
    #include <direct.h>
#elif _WIN32
    #include <direct.h>
#endif
#include <iostream>
#include <map>
#include "FileStructure.h"
#include <sys/stat.h>
#include <sys/types.h>
#include <string>
//#include <cmath>
#include <vector>
using namespace std;


void compress(FileStructure& reader, string fullPath, string append, FileStructure& writer, map<vector<char>, unsigned int>& dictionary, unsigned int& count)
{
	string nameEnd = reader.getStringName(); bool first = true;// bool relativeFirst;
	vector<char> current;
	vector<char> temp;
	char next; 
	vector<char> extended;
	map<vector<char>, unsigned int>::iterator it;
	unsigned short* one = NULL; unsigned short* two = NULL;
	if (!reader.getIsDir()){
		reader.openRead(fullPath);
		append += "/" + nameEnd;
	}
	char* buffer;
	int buffBegin;
	if (!reader.getIsDir()){
		writer.write(append, reader.getLength());//writes metadata
		while(reader.isEnd() == false){ //loops through all the buffers
			buffBegin = reader.location();
			buffer = reader.read();
			for (int i = 0; i < reader.getRemain(); i++){//sets the max to the total number of real things in the buffer
				next = buffer[i];
				extended = current;
				extended.push_back(next);//creates a vector out of next
				it = dictionary.find(current);
				if (!(dictionary.count(extended)) && !first){//checks if current is not in the dictionary
					if(it == dictionary.end()){
						cout << "fail" << endl;
					}
					if(one == NULL){
						one = new unsigned short;
						*one = it->second;
					}
					else if (two == NULL){
						two = new unsigned short;
						*two = it->second;
					}
					if(one != NULL && two != NULL){//we read two numbers at a time
						writer.write (*one, *two);
						delete one;
						one = NULL;
						delete two;
						two = NULL;
					}
					if(++count < 4096){
						dictionary.insert(make_pair<vector<char>, unsigned int> (extended, count));
						extended.clear();
					}
					current.clear();
					current.push_back(next);
				}
				else{
					current = extended;
				}
				first = false;
			}
		}
		it = dictionary.find(extended);
		
		if(it == dictionary.end()){//sees if extended is in the dictionary and if not writes it's dictionary number to the file.
			temp.push_back(next);
			it = dictionary.find(temp);
			temp.clear();
		}


		if(one != NULL && two == NULL){//looks for left over things to add to the file
			two = new unsigned short;
			*two = it->second;
		}
		else if(one == NULL && two == NULL){
			one = new unsigned short;
			two = new unsigned short;
			*one = it->second;
			*two = 0;
		}
		writer.write(*one, *two);
		delete one;
		delete two;
	}
	if (reader.isOpen()){
		reader.close();
	}
}

void decompress(string path, string target, FileStructure& reader, int fileSize, map<unsigned int, vector<char> >& dictionary, unsigned int& mapSize){
   	int dataLength = 0;
    target += "/" + path;
    FileStructure writer(target);
    writer.openWrite();
    char writing[1000];
	vector<char> output;
	vector<char> full;
	vector<char> conjecture;
	bool first = true;
	int count = 0;
	unsigned short one; unsigned short two;
	map<unsigned int, vector<char> >::iterator it;
	while((writer.location()) < fileSize){//loops through the whole file
		if(++count % 2 == 1){//if odd reads from one
			reader.readData(one, two);
		}
		else{//reads from two
			one = two;
		}
		it = dictionary.find(int(one));
		
		if(it == dictionary.end()){//checks if one is not in the dictionary and then writes and adds it
			output = conjecture;
			if(!(conjecture.empty()))
				output.push_back(conjecture[0]);
		}
		else{
			output = it->second;
		}

		full = conjecture;
		full.push_back(output[0]);
		dataLength = output.size();
		for(int i = 0; i < dataLength; i++){
			writing[i] = output[i];
		}
		writer.write(writing, dataLength);//writes the data gotten from the map to the file
		conjecture = output;
		if(!first){
			if(++mapSize < 4096){
				dictionary.insert(make_pair<unsigned int, vector<char> > (mapSize, full));
			}
		}
		first = false;
	}
	writer.close();
}
