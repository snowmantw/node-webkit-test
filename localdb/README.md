node-webkit-sqlite3-windows-demo
========

A sample app for [node-webkit](https://github.com/rogerwang/node-webkit) and [node-sqlite3](https://github.com/developmentseed/node-sqlite3) for windows.

Notes: because sqlite3 is a native module, need to install nw-gyp before build it.
And you need to build it manually:

    sudo npm -g install nw-gyp
    npm install sqlite3
    rm -rf node_modules/sqlite3/build/Release/
    cd ./node_modules/sqlite3/
    nw-gyp configure --target=0.5.1  # node-webkit version is necessary
    nw-gyp build

Lazy way:

    sudo npm -g install nw-gyp && npm install sqlite3 && rm -rf node_modules/sqlite3/build/Release/ && cd ./node_modules/sqlite3/ && nw-gyp configure --target=0.5.1 && nw-gyp build && cd ../../ 

After it done, go to this directory then 
    
    nw ./

to run the application.

For demonstrate create DB, this demo use in memory database.
If you want to test database in a file, change the path to the `db` file in this directory,
but you will encounter error because the database had been created in the file. 

--------
1: Ipsum 0
2: Ipsum 1
3: Ipsum 2
4: Ipsum 3
5: Ipsum 4
6: Ipsum 5
7: Ipsum 6
8: Ipsum 7
9: Ipsum 8
10: Ipsum 9
