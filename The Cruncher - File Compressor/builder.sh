#!/bin/bash
#sh build.sh to compile
say Preparing to crunch
g++ -Wall -Werror -Wextra main.cpp compress.cpp FileStructure.cpp -o cruncher