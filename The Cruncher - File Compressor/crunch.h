#include <map>
#include <vector>

void compress(FileStructure& reader, std::string fullPath, std::string append, FileStructure& writer, std::map<std::vector<char>, unsigned int>& dictionary, unsigned int& size);
void decompress(std::string path, std::string target, FileStructure& reader, int fileSize, std::map<unsigned int, std::vector<char> >& dictionary, unsigned int& mapSize);