using Microsoft.EntityFrameworkCore;
using WebApplication1;

namespace backend
{
    public class UserContext : DbContext
    {
        public UserContext(DbContextOptions<UserContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        //public DbSet<WebApplication1.File> Files { get; set; }
        //public DbSet<Folder> Folders { get; set; }
    }
}