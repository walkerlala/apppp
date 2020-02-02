### How to build
> See ./ani-album-client/README.md for how to build the album client

1. Prepare third party libs
```
$ cd /some/path
$ git clone https://github.com/vincentdchan/ani-third-party.git
$ cd ani-third-party
```
See README inside for how to build and install. Assume that you install most libs to `/path/to/installdir` and boost to `/path/to/boostinstalldir`.

2. Build this project by cmake
```
$ mkdir build & cd build
$ cmake -DANI_THIRDPARTY_INSTALL_DIR=/path/to/installdir -DANI_BOOST_INSTALL_DIR=/path/to/boostinstalldir ..
$ cmake --build . --config Release
(Linux/Mac users can run `make -j` to enable parallel build)
```