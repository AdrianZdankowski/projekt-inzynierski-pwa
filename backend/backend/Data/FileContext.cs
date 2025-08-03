using Microsoft.EntityFrameworkCore;
using WebApplication1; // your F# namespace
using FileEntity = WebApplication1.File; // avoids System.IO.File clash

namespace backend.Contexts
{
    public class FileContext : DbContext
    {
        public FileContext(DbContextOptions<FileContext> options) : base(options) { }

        public DbSet<FileEntity> Files { get; set; }
    }
}