#include <vector>
#include <string>
#include <boost/process.hpp>

using std::string;
using std::vector;

namespace bp = boost::process;

int main(int argc, char **argv) {
    bp::group process_group;

    // start classifier
    bp::child classifier("classifier", process_group);
    // start thumbnail
    bp::child thumbnail("ani-thumbnail", process_group);

    process_group.wait();

    return 0;
}