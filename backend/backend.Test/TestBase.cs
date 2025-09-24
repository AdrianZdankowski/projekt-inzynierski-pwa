
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using WebApplication1;

namespace backend.Test
{
    public abstract class TestBase
    {
        protected StreamService streamService;
        protected AuthService authService;
        protected string accessToken;
        protected WebApplication1.File file;
        protected WebApplication1.File accessDeniedFile;
        protected Mock<IAzureBlobService> azureBlobServiceMock;
        protected AppDbContext appDbContext;
        protected IConfiguration configuration;
        protected User testUser;

        [SetUp]
        public void TestSetUp()
        {
            //Mock db context
            var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("test")
            .Options;
            appDbContext = new AppDbContext(options);

            //Mock config with jwt settings
            var inMemorySettings = new Dictionary<string, string> {
                {"AppSettings:JwtSecret", "TokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenToken"},
                {"AppSettings:JwtIssuer", "PwaApp"},
                {"AppSettings:JwtAudience", "PwaAppUsers"}
            };

            configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            //add user with file
            var passwordHasher = new PasswordHasher<User>();
            var hashedPassword = passwordHasher.HashPassword(new User(), "testPassword");
            testUser = new User
            {
                email = "testEmail",
                id = Guid.NewGuid(),
                username = "test",
                passwordHash = hashedPassword,
                role = Role.User
            };

            file = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = testUser.id,
                FileName = "test",
                BlobName = "test",
                Checksum = "test",
                Status = WebApplication1.FileStatus.Uploaded,
                MimeType = "test",
                Size = 1234,
                UploadTimestamp = DateTime.UtcNow
            };

            accessDeniedFile = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                FileName = "test",
                BlobName = "test",
                Checksum = "test",
                Status = WebApplication1.FileStatus.Uploaded,
                MimeType = "test",
                Size = 1234,
                UploadTimestamp = DateTime.UtcNow
            };

            appDbContext.Users.Add(testUser);
            appDbContext.SaveChanges();

            appDbContext.Files.Add(file);
            appDbContext.Files.Add(accessDeniedFile);
            appDbContext.SaveChanges();

            //userContext.Files.Add(file);
            //userContext.Files.Add(accessDeniedFile);
            //userContext.SaveChanges();

            //userContext.Attach(file);
            //userContext.Attach(accessDeniedFile);
            //userContext.SaveChanges();

            azureBlobServiceMock = new Mock<IAzureBlobService>();
            azureBlobServiceMock.Setup(s => s.BuildUserScopedBlobName(testUser.id, file.id, "test"))
               .Returns("test");
            azureBlobServiceMock.Setup(s => s.BuildUserScopedBlobName(testUser.id, file.id, "test"))
               .Returns("test2");
            azureBlobServiceMock.Setup(s => s.GetFile("test"))
                .ReturnsAsync(new MemoryStream(new byte[] { 1, 2, 3 }));
            azureBlobServiceMock.Setup(s => s.GetFile("test2"))
               .ReturnsAsync(new MemoryStream(new byte[] { 1, 2, 3 }));


            streamService = new StreamService(appDbContext, configuration, azureBlobServiceMock.Object, new FileAccessValidator(appDbContext, configuration));
            authService = new AuthService(appDbContext, configuration);

            var userDto = new DTO.User.UserDto
            {
                password = "testPassword",
                username = testUser.username
            };
            accessToken = authService.LoginAsync(userDto).Result.AccessToken;

        }
        [TearDown]
        public void TearDown()
        {
            appDbContext.Dispose();
        }
    }
}
