using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Azure.Storage.Blobs.Models;
using backend.Controllers;
using backend.DTO.File;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;
using WebApplication1;
/*
 NOTE: CommitUpload directly constructs BlobContainerClient and calls Azure methods.
 It isn’t mockable here. "Happy path" will be covered by integration tests.
 */
namespace backend.Test
{
    [TestFixture]
    public class CommitUploadTests : TestBase
    {
        private Mock<IFileUploadService> fileUploadServiceMock;
        private FileController fileController;
        private FileAccessValidator fileAccessValidator;

        [SetUp]
        public void CommitUploadTestSetUp()
        {
            fileUploadServiceMock = new Mock<IFileUploadService>();
            fileAccessValidator = new FileAccessValidator(appDbContext, configuration);
            fileController = new FileController(azureBlobServiceMock.Object, fileUploadServiceMock.Object, appDbContext, configuration, new FileConverter(configuration, azureBlobServiceMock.Object), fileAccessValidator);


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
        public async Task CommitUpload_FileNotFound_ReturnsNotFound()
        {
            var commitDto = new FileMetadataDto
            {
                FileId = Guid.NewGuid(),
                Size = 1024,
                MimeType = "text/plain"
            };

            var result = await fileController.CommitUpload(commitDto);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);

            var notFoundResult = result as NotFoundObjectResult;
            Assert.That(notFoundResult.Value, Is.EqualTo("File not found."));
        }

        [Test]
        public async Task CommitUpload_NotOwner_ReturnsForbid()
        {
            var otherUserFile = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = Guid.NewGuid(), //different user
                FileName = "test-file.txt",
                MimeType = "text/plain",
                Size = 1024,
                BlobName = "test-blob-name",
                UploadTimestamp = DateTime.UtcNow,
                Status = FileStatus.Pending,
                Checksum = null
            };

            appDbContext.Files.Add(otherUserFile);
            await appDbContext.SaveChangesAsync();

            var commitDto = new FileMetadataDto
            {
                FileId = otherUserFile.id,
                Size = 1024,
                MimeType = "text/plain"
            };

            var result = await fileController.CommitUpload(commitDto);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task CommitUpload_FileNotPending_ReturnsConflict()
        {
            var uploadedFile = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = testUser.id,
                FileName = "test-file.txt",
                MimeType = "text/plain",
                Size = 1024,
                BlobName = "test-blob-name",
                UploadTimestamp = DateTime.UtcNow,
                Status = FileStatus.Uploaded, //already uploaded
                Checksum = null
            };

            appDbContext.Files.Add(uploadedFile);
            await appDbContext.SaveChangesAsync();

            var commitDto = new FileMetadataDto
            {
                FileId = uploadedFile.id,
                Size = 1024,
                MimeType = "text/plain"
            };

            var result = await fileController.CommitUpload(commitDto);
            Assert.IsInstanceOf<ConflictObjectResult>(result);

            var conflictResult = result as ConflictObjectResult;
            Assert.That(conflictResult.Value, Is.EqualTo("Upload not in pending state"));
        }

        [Test]
        public async Task CommitUpload_EmptyFileId_ReturnsBadRequest()
        {
            var commitDto = new FileMetadataDto
            {
                FileId = Guid.Empty,
                Size = 1024,
                MimeType = "text/plain"
            };

            var result = await fileController.CommitUpload(commitDto);
            Assert.IsInstanceOf<BadRequestObjectResult>(result);

            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.EqualTo("fileId is required"));
        }

        [Test]
        public async Task CommitUpload_NullRequest_ReturnsBadRequest()
        {
            var result = await fileController.CommitUpload(null);
            Assert.IsInstanceOf<BadRequestObjectResult>(result);

            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.EqualTo("fileId is required"));
        }

        [Test]
        public async Task CommitUpload_InvalidUserContext_ReturnsUnauthorized()
        {
            //create controller without user context
            var controllerWithoutUser = new FileController(
                azureBlobServiceMock.Object,
                fileUploadServiceMock.Object,
                appDbContext,
                configuration,
                new FileConverter(configuration, azureBlobServiceMock.Object),
                fileAccessValidator);

            var commitDto = new FileMetadataDto
            {
                FileId = file.id,
                Size = 1024,
                MimeType = "text/plain"
            };

            var result = await controllerWithoutUser.CommitUpload(commitDto);
            Assert.IsInstanceOf<UnauthorizedObjectResult>(result);

            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.Value, Is.EqualTo("Invalid or missing user ID"));
        }      
    }
}