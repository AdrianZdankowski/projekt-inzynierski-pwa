using backend.Contexts;
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
        protected UserContext userContext;
        protected FileContext fileContext;
        protected IConfiguration configuration;
        protected User testUser;

        [SetUp]
        public void TestSetUp()
        {
            //Mock db context
            var options = new DbContextOptionsBuilder<UserContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
            userContext = new UserContext(options);

            var fileContextOptions = new DbContextOptionsBuilder<FileContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
            fileContext = new FileContext(fileContextOptions);

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

            userContext.Users.Add(testUser);
            userContext.SaveChanges();

            fileContext.Files.Add(file);
            fileContext.Files.Add(accessDeniedFile);
            fileContext.SaveChanges();

            azureBlobServiceMock = new Mock<IAzureBlobService>();
            azureBlobServiceMock.Setup(s => s.BuildUserScopedBlobName(testUser.id, file.id, "test"))
               .Returns("test");
            azureBlobServiceMock.Setup(s => s.BuildUserScopedBlobName(testUser.id, file.id, "test"))
               .Returns("test2");
            azureBlobServiceMock.Setup(s => s.GetFile("test"))
                .ReturnsAsync(new MemoryStream(new byte[] { 1, 2, 3 }));
            azureBlobServiceMock.Setup(s => s.GetFile("test2"))
               .ReturnsAsync(new MemoryStream(new byte[] { 1, 2, 3 }));


            streamService = new StreamService(userContext, fileContext, configuration, azureBlobServiceMock.Object, new FileAccessValidator(userContext, configuration));
            authService = new AuthService(userContext, configuration);

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
            userContext.Dispose();
            fileContext.Dispose();
        }
    }
}
