
#ifdef __unix__
#include <sys/mman.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>

#define faiss_mmap mmap
#define faiss_munmap munmap

#elif defined(_WIN32) || defined(WIN32)
#include <windows.h>
#include <sys/stat.h>
#include <stdint.h>
#include <stdio.h>
#include <io.h>

/* macro definitions extracted from git/git-compat-util.h */
#define PROT_READ  1
#define PROT_WRITE 2
#define MAP_FAILED ((void*)-1)

/* macro definitions extracted from /usr/include/bits/mman.h */
#define MAP_SHARED	0x01		/* Share changes.  */
#define MAP_PRIVATE	0x02		/* Changes are private.  */

void *faiss_mmap(void *start, size_t length, int prot, int flags, int fd, off_t offset);
int faiss_munmap(void *start, size_t length);

#else
#error "Unsupported platform"

#endif
