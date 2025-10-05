using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend.Controllers;
using backend.DTO.File;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;
using WebApplication1;

namespace backend.Test
{
    [TestFixture]
    public class DownloadTests : TestBase
    {
        private Mock<IFileUploadService> fileUploadServiceMock;
        private FileController fileController;
        private FileAccessValidator fileAccessValidator;

        [SetUp]
        public void DownloadTestSetUp()
        {
            fileUploadServiceMock = new Mock<IFileUploadService>();
            fileAccessValidator = new FileAccessValidator(appDbContext, configuration);
            fileController = new FileController(azureBlobServiceMock.Object, fileUploadServiceMock.Object, appDbContext, configuration, new FileConverter(configuration, azureBlobServiceMock.Object), fileAccessValidator);

            //Azure blob service mock for download scenarios
            azureBlobServiceMock.Setup(s => s.GenerateDownloadSasUri(It.IsAny<string>(), It.IsAny<TimeSpan>()))
                .Returns("https://test.blob.core.windows.net/test/download-url");

            //creating HttpContext for test user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, testUser.username),
                new Claim(ClaimTypes.NameIdentifier, testUser.id.ToString()),
                new Claim(ClaimTypes.Role, testUser.role.ToStringValue()),
                new Claim("type", "access")
            };

            var identity = new ClaimsIdentity(claims, "jwt");
            var user = new ClaimsPrincipal(identity);

            fileController.ControllerContext.HttpContext = new DefaultHttpContext
            {
                User = user
            };
        }

        [Test]
        public async Task GetFileWithLink_OwnedFile_ReturnsOkWithDownloadInfo()
        {
            var result = await fileController.GetFileWithLink(file.id);
            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var fileDto = okResult.Value as FileDownloadDto;

            Assert.IsNotNull(fileDto);
            Assert.That(fileDto.Id, Is.EqualTo(file.id));
            Assert.That(fileDto.FileName, Is.EqualTo(file.FileName));
            Assert.That(fileDto.MimeType, Is.EqualTo(file.MimeType));
            Assert.That(fileDto.Size, Is.EqualTo(file.Size));
            Assert.That(fileDto.DownloadUrl, Is.EqualTo("https://test.blob.core.windows.net/test/download-url"));
            Assert.That(fileDto.ExpiresInSeconds, Is.EqualTo(600)); 
            Assert.That(fileDto.UserId, Is.EqualTo(file.UserId));
            Assert.That(fileDto.OwnerName, Is.EqualTo(testUser.username));
        }

        [Test]
        public async Task GetFileWithLink_FileNotFound_ReturnsNotFound()
        {
            var nonExistentFileId = Guid.NewGuid();
            var result = await fileController.GetFileWithLink(nonExistentFileId);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
            var notFoundResult = result as NotFoundObjectResult;
            Assert.That(notFoundResult.Value, Is.EqualTo("File not found"));
        }

        [Test]
        public async Task GetFileWithLink_NoAccess_ReturnsForbid()
        {
            var result = await fileController.GetFileWithLink(accessDeniedFile.id);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task GetFileWithLink_FileNotUploaded_ReturnsConflict()
        {
            var pendingFile = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = testUser.id,
                FileName = "pending-file.txt",
                MimeType = "text/plain",
                Size = 1024,
                BlobName = "pending-blob-name",
                UploadTimestamp = DateTime.UtcNow,
                Status = FileStatus.Pending,
                Checksum = null
            };

            appDbContext.Files.Add(pendingFile);
            await appDbContext.SaveChangesAsync();

            var result = await fileController.GetFileWithLink(pendingFile.id);
            Assert.IsInstanceOf<ConflictObjectResult>(result);
            var conflictResult = result as ConflictObjectResult;
            Assert.That(conflictResult.Value, Is.EqualTo("File is not ready for download"));
        }

        [Test]
        public async Task GetFileWithLink_SharedFile_ReturnsOk()
        {
            //create another user and share file with him
            var otherUser = new User
            {
                id = Guid.NewGuid(),
                username = "otherUser",
                passwordHash = "hashedPassword",
                email = "other@test.com",
                role = Role.User
            };

            appDbContext.Users.Add(otherUser);
            await appDbContext.SaveChangesAsync();

            var fileAccess = new WebApplication1.FileAccess
            {
                id = Guid.NewGuid(),
                file = file,
                user = otherUser
            };

            appDbContext.FileAccesses.Add(fileAccess);
            await appDbContext.SaveChangesAsync();

            var otherUserClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, otherUser.username),
                new Claim(ClaimTypes.NameIdentifier, otherUser.id.ToString()),
                new Claim(ClaimTypes.Role, otherUser.role.ToStringValue()),
                new Claim("type", "access")
            };

            var otherUserIdentity = new ClaimsIdentity(otherUserClaims, "jwt");
            var otherUserPrincipal = new ClaimsPrincipal(otherUserIdentity);

            fileController.ControllerContext.HttpContext = new DefaultHttpContext
            {
                User = otherUserPrincipal
            };

            var result = await fileController.GetFileWithLink(file.id);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var fileDto = okResult.Value as FileDownloadDto;

            Assert.IsNotNull(fileDto);
            Assert.That(fileDto.Id, Is.EqualTo(file.id));
            Assert.That(fileDto.OwnerName, Is.EqualTo(testUser.username));
        }

        [Test]
        public async Task GetFileWithLink_InvalidUserContext_ReturnsUnauthorized()
        {
            //create controller without user context
            var controllerWithoutUser = new FileController(
                azureBlobServiceMock.Object,
                fileUploadServiceMock.Object,
                appDbContext,
                configuration,
                new FileConverter(configuration, azureBlobServiceMock.Object),
                fileAccessValidator);

            var result = await controllerWithoutUser.GetFileWithLink(file.id);
            Assert.IsInstanceOf<UnauthorizedObjectResult>(result);
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.Value, Is.EqualTo("Invalid or missing user ID"));
        }

        [Test]
        public async Task GetFileWithLink_GeneratesCorrectDownloadUrl()
        {
            var result = await fileController.GetFileWithLink(file.id);
            Assert.IsInstanceOf<OkObjectResult>(result);         
            azureBlobServiceMock.Verify(s => s.GenerateDownloadSasUri(file.BlobName, It.IsAny<TimeSpan>()), Times.Once);
        }

        [Test]
        public async Task GetFileWithLink_ReturnsCorrectExpirationTime()
        {
            var result = await fileController.GetFileWithLink(file.id);
            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var fileDto = okResult.Value as FileDownloadDto;
            Assert.That(fileDto.ExpiresInSeconds, Is.EqualTo(600));
        }

        [Test]
        public async Task GetFileWithLink_ReturnsCorrectOwnerName()
        {
            var result = await fileController.GetFileWithLink(file.id);
            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var fileDto = okResult.Value as FileDownloadDto;
            Assert.That(fileDto.OwnerName, Is.EqualTo(testUser.username));
        }

        [Test]
        public async Task GetFileWithLink_FileWithFailedStatus_ReturnsConflict()
        {
            var failedFile = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = testUser.id,
                FileName = "failed-file.txt",
                MimeType = "text/plain",
                Size = 1024,
                BlobName = "failed-blob-name",
                UploadTimestamp = DateTime.UtcNow,
                Status = FileStatus.Failed,
                Checksum = null
            };

            appDbContext.Files.Add(failedFile);
            await appDbContext.SaveChangesAsync();

            var result = await fileController.GetFileWithLink(failedFile.id);
            Assert.IsInstanceOf<ConflictObjectResult>(result);
            var conflictResult = result as ConflictObjectResult;
            Assert.That(conflictResult.Value, Is.EqualTo("File is not ready for download"));
        }

        [Test]
        public async Task GetFileWithLink_FileWithExpiredStatus_ReturnsConflict()
        {
            var expiredFile = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = testUser.id,
                FileName = "expired-file.txt",
                MimeType = "text/plain",
                Size = 1024,
                BlobName = "expired-blob-name",
                UploadTimestamp = DateTime.UtcNow,
                Status = FileStatus.Expired,
                Checksum = null
            };

            appDbContext.Files.Add(expiredFile);
            await appDbContext.SaveChangesAsync();

            var result = await fileController.GetFileWithLink(expiredFile.id);
            Assert.IsInstanceOf<ConflictObjectResult>(result);
            var conflictResult = result as ConflictObjectResult;
            Assert.That(conflictResult.Value, Is.EqualTo("File is not ready for download"));
        }
    }
}