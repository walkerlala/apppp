#include <faiss/utils/crossplatform.h>

// windows mmap() copied from
// https://courses.washington.edu/hypertxt/cwb/cl/windows-mmap.c
#if defined(_WIN32) || defined(WIN32)
/**
 * Substitute POSIX mmap() for use in Windows.
 *
 * It wraps the Windows API functions CreateFileMapping() and
 * MapViewOfFileEx().
 *
 * The arguments, return, etc. are the same as POSIX mmap(), which is
 * documented much more thoroughly than we could hope to do here.
 */
void *
faiss_mmap(void *start, size_t length, int prot, int flags, int fd, off_t offset)
{
  HANDLE hmap;
  void *temp;
  size_t len;
  struct stat st;
  uint64_t o = offset;
  uint32_t l = o & 0xFFFFFFFF;
  uint32_t h = (o >> 32) & 0xFFFFFFFF;

  if (!fstat(fd, &st))
    len = (size_t) st.st_size;
  else {
    fprintf(stderr,"mmap: could not determine filesize");
    exit(1);
  }

  if ((length + offset) > len)
    length = len - offset;

  if (!(flags & MAP_PRIVATE)) {
    fprintf(stderr,"Invalid usage of mmap when built with USE_WIN32_MMAP");
    exit(1);
  }

  hmap = CreateFileMapping((HANDLE)_get_osfhandle(fd), 0, PAGE_WRITECOPY, 0, 0, 0);

  if (!hmap)
    return MAP_FAILED;

  temp = MapViewOfFileEx(hmap, FILE_MAP_COPY, h, l, length, start);

  if (!CloseHandle(hmap))
    fprintf(stderr,"unable to close file mapping handle\n");
  return temp ? temp : MAP_FAILED;
}

/**
 * Substitute POSIX munmap() for environments that lack it.
 *
 * It wraps the Windows API function UnmapViewOfFile().
 *
 * @see mmap
 */
int
faiss_munmap(void *start, size_t length)
{
  return !UnmapViewOfFile(start);
}

#endif //WIN32