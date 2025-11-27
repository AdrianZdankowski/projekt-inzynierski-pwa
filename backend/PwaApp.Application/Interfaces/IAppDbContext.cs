using Microsoft.EntityFrameworkCore;
using WebApplication1;

namespace backend.Data
{
    public interface IAppDbContext
    {
        DbSet<WebApplication1.User> Users { get; }
        DbSet<WebApplication1.FileAccess> FileAccesses { get; }
        DbSet<WebApplication1.File> Files { get; }
        DbSet<WebApplication1.Folder> Folders { get; }
        DbSet<WebApplication1.FolderAccess> FolderAccesses { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
