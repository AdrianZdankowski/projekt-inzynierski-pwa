using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WebApplication1;

namespace backend
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //converting user roles between fs discriminated union and string
            var roleConverter = new ValueConverter<Role, string>(
                v => v.ToStringValue(),
                v => Role.FromString(v)
                );

            modelBuilder.Entity<User>()
                .Property(u => u.role)
                .HasConversion(roleConverter);
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<WebApplication1.FileAccess> FileAccesses { get; set; }
        public DbSet<WebApplication1.File> Files { get; set; }
        //public DbSet<WebApplication1.File> Files { get; set; }
        public DbSet<WebApplication1.Folder> Folders { get; set; }
    }
}