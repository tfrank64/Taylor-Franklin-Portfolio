
main.o: main.cpp
		g++ -Wall -c main.cpp
compress.o: compress.cpp
		g++ -Wall  -c compress.cpp
FileStructure.o: FileStructure.cpp
		g++ -Wall -c FileStructure.cpp
main: main.o compress.o FileStructure.o
		g++ -o main main.o compress.o FileStructure.o