using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Contexts;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using WebApplication1;

namespace backend.Test
{
    [TestFixture]
    public class VideoStreamingTests
    {
        private StreamService streamService;
        private AuthService authService;
        private string accessToken;
        private WebApplication1.File file;
        private WebApplication1.File accessDeniedFile;

        [SetUp]
        public void StreamingTestsSetUp()
        {
            //Mock db context
            var options = new DbContextOptionsBuilder<UserContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
            var context = new UserContext(options);

            var fileContextOptions = new DbContextOptionsBuilder<FileContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
            var fileContext = new FileContext(fileContextOptions);

            //Mock config with jwt settings
            var inMemorySettings = new Dictionary<string, string> {
                {"AppSettings:JwtSecret", "TokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenToken"},
                {"AppSettings:JwtIssuer", "PwaApp"},
                {"AppSettings:JwtAudience", "PwaAppUsers"}
            };

            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            //add user with file
            var passwordHasher = new PasswordHasher<User>();
            var hashedPassword = passwordHasher.HashPassword(new User(), "testPassword");
            var user = new User
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
                UserId = user.id,
                FileName = "test",
                MimeType = "test",
                Size = 1234,
                UploadTimestamp = DateTime.UtcNow
            };

            accessDeniedFile = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                FileName = "test",
                MimeType = "test",
                Size = 1234,
                UploadTimestamp = DateTime.UtcNow
            };

            context.Users.Add(user);
            context.SaveChanges();

            fileContext.Files.Add(file);
            fileContext.Files.Add(accessDeniedFile);
            fileContext.SaveChanges();

            var azureBlobServiceMock = new Mock<IAzureBlobService>();
            azureBlobServiceMock.Setup(s => s.GetFile(string.Concat(user.id,"/",file.FileName, "/test")))
                .ReturnsAsync(new MemoryStream(new byte[] { 1, 2, 3 }));
            azureBlobServiceMock.Setup(s => s.GetFile(string.Concat(user.id, "/", accessDeniedFile.FileName, "/test")))
               .ReturnsAsync(new MemoryStream(new byte[] { 1, 2, 3 }));

            streamService = new StreamService(context, fileContext,configuration, azureBlobServiceMock.Object);
            authService = new AuthService(context, configuration);

            var userDto = new DTO.User.UserDto
            {
                password = "testPassword",
                username = user.username
            };
            accessToken = authService.LoginAsync(userDto).Result.AccessToken;

        }

        [Test]
        public void ValidateUserAccess_AccessGranted_ReturnFile()
        {
            var video = streamService.GetVideo(accessToken, file.id, "test");
            Assert.NotNull(video.Result);
        }

        [Test]
        public void ValidateUserAccess_AccessDenied_ThrowException()
        {
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => streamService.GetVideo(accessToken, accessDeniedFile.id, "test"));
        }
    }
}
