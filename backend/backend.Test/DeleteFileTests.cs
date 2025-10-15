using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Controllers;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using WebApplication1;

namespace backend.Test
{
    [TestFixture]
    public class DeleteFileTests : TestBase
    {
        private Mock<IFileUploadService> fileUploadServiceMock;
        private FileController fileController;
        private FileAccessValidator fileAccessValidator;

        [SetUp]
        public void DeleteTestSetUp()
        {
            fileUploadServiceMock = new Mock<IFileUploadService>();
            fileAccessValidator = new FileAccessValidator(appDbContext, configuration);
            fileController = new FileController(
                azureBlobServiceMock.Object, 
                fileUploadServiceMock.Object, 
                appDbContext, 
                configuration, 
                new FileConverter(configuration, azureBlobServiceMock.Object), 
                fileAccessValidator);

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
        public async Task DeleteFile_OwnedFile_ReturnsOk()
        {
            fileUploadServiceMock.Setup(s => s.DeleteFile(file.id))
                .ReturnsAsync(true);

            var result = await fileController.DeleteFile(file.id);

            Assert.IsInstanceOf<OkResult>(result);
            fileUploadServiceMock.Verify(s => s.DeleteFile(file.id), Times.Once);
        }

        [Test]
        public async Task DeleteFile_NotOwnedFile_ReturnsUnauthorized()
        {
            var result = await fileController.DeleteFile(accessDeniedFile.id);

            Assert.IsInstanceOf<UnauthorizedObjectResult>(result);
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.Value, Is.EqualTo("User does not have permission to delete this file"));
            
            fileUploadServiceMock.Verify(s => s.DeleteFile(It.IsAny<Guid>()), Times.Never);
        }

        [Test]
        public void DeleteFile_NonExistentFile_ThrowsNullReferenceException()
        {
            var nonExistentFileId = Guid.NewGuid();

            Assert.ThrowsAsync<NullReferenceException>(async () => 
                await fileController.DeleteFile(nonExistentFileId));
            
            fileUploadServiceMock.Verify(s => s.DeleteFile(It.IsAny<Guid>()), Times.Never);
        }

        [Test]
        public async Task DeleteFile_ServiceReturnsFalse_ThrowsException()
        {
            fileUploadServiceMock.Setup(s => s.DeleteFile(file.id))
                .ReturnsAsync(false);

            Assert.ThrowsAsync<Exception>(async () => await fileController.DeleteFile(file.id));
        }

        [Test]
        public async Task DeleteFile_InvalidUserContext_ReturnsUnauthorized()
        {
            var controllerWithoutUser = new FileController(
                azureBlobServiceMock.Object,
                fileUploadServiceMock.Object,
                appDbContext,
                configuration,
                new FileConverter(configuration, azureBlobServiceMock.Object),
                fileAccessValidator);

            var result = await controllerWithoutUser.DeleteFile(file.id);

            Assert.IsInstanceOf<UnauthorizedObjectResult>(result);
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.Value, Is.EqualTo("Invalid or missing user ID"));
            
            fileUploadServiceMock.Verify(s => s.DeleteFile(It.IsAny<Guid>()), Times.Never);
        }

        [Test]
        public async Task DeleteFile_VerifyServiceCalled_OnSuccessfulDeletion()
        {
            fileUploadServiceMock.Setup(s => s.DeleteFile(file.id))
                .ReturnsAsync(true);

            await fileController.DeleteFile(file.id);

            fileUploadServiceMock.Verify(s => s.DeleteFile(file.id), Times.Once);
        }

        [Test]
        public async Task DeleteFile_SharedFile_CannotBeDeletedByNonOwner()
        {
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

            var result = await fileController.DeleteFile(file.id);

            Assert.IsInstanceOf<UnauthorizedObjectResult>(result);
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.Value, Is.EqualTo("User does not have permission to delete this file"));
            
            fileUploadServiceMock.Verify(s => s.DeleteFile(It.IsAny<Guid>()), Times.Never);
        }

        [Test]
        public async Task DeleteFile_MultipleFiles_OnlyOwnerCanDelete()
        {
            var anotherFile = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = testUser.id,
                FileName = "another-test.txt",
                BlobName = "another-test",
                Checksum = "checksum",
                Status = FileStatus.Uploaded,
                MimeType = "text/plain",
                Size = 2048,
                UploadTimestamp = DateTime.UtcNow
            };

            appDbContext.Files.Add(anotherFile);
            await appDbContext.SaveChangesAsync();

            fileUploadServiceMock.Setup(s => s.DeleteFile(anotherFile.id))
                .ReturnsAsync(true);

            var result = await fileController.DeleteFile(anotherFile.id);

            Assert.IsInstanceOf<OkResult>(result);
            fileUploadServiceMock.Verify(s => s.DeleteFile(anotherFile.id), Times.Once);
        }
    }
}

