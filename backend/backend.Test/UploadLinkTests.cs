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
using PwaApp.Application.Interfaces;
using WebApplication1;

namespace backend.Test
{
    [TestFixture]
    public class UploadLinkTests : TestBase
    {
        private Mock<IFileUploadService> fileUploadServiceMock;
        private FileController fileController;
        private FileAccessValidator fileAccessValidator;

        [SetUp]
        public void UploadLinkTestSetUp()
        {
            fileUploadServiceMock = new Mock<IFileUploadService>();
            fileAccessValidator = new FileAccessValidator(appDbContext, configuration);
            fileController = new FileController(azureBlobServiceMock.Object, fileUploadServiceMock.Object, appDbContext, configuration, new FileConverter(new List<IFileConversionStrategy> { new Mp4HlsConversionStrategy(azureBlobServiceMock.Object) }), fileAccessValidator);

            //setup Azure blob service mock for upload link scenarios
            azureBlobServiceMock.Setup(s => s.BuildUserScopedBlobName(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<string>()))
                .Returns("test-user-id/test-file-id/test-file.txt");
            azureBlobServiceMock.Setup(s => s.GenerateUploadSasUri(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan>()))
                .Returns("https://test.blob.core.windows.net/test/upload-url");

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
        public async Task GenerateUploadLink_ValidRequest_ReturnsOkWithLink()
        {
            var request = new CreateUploadLinkRequest
            {
                FileName = "test-file.txt",
                MimeType = "text/plain",
                ExpectedSize = 1024
            };

            var result = await fileController.CreateUploadLink(request);
            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult.Value);

            azureBlobServiceMock.Verify(s => s.BuildUserScopedBlobName(testUser.id, It.IsAny<Guid>(), "test-file.txt"), Times.Once);
            azureBlobServiceMock.Verify(s => s.GenerateUploadSasUri(It.IsAny<string>(), "text/plain", It.IsAny<TimeSpan>()), Times.Once);
        }

        [Test]
        public async Task GenerateUploadLink_NullFileName_ReturnsBadRequest()
        {
            var request = new CreateUploadLinkRequest
            {
                FileName = null,
                MimeType = "text/plain",
                ExpectedSize = 1024
            };

            var result = await fileController.CreateUploadLink(request);
            Assert.IsInstanceOf<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.EqualTo("fileName and mimeType are required"));
        }

        [Test]
        public async Task GenerateUploadLink_EmptyFileName_ReturnsBadRequest()
        {
            var request = new CreateUploadLinkRequest
            {
                FileName = "",
                MimeType = "text/plain",
                ExpectedSize = 1024
            };

            var result = await fileController.CreateUploadLink(request);
            Assert.IsInstanceOf<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.EqualTo("fileName and mimeType are required"));
        }

        [Test]
        public async Task GenerateUploadLink_NullMimeType_ReturnsBadRequest()
        {
            var request = new CreateUploadLinkRequest
            {
                FileName = "test-file.txt",
                MimeType = null,
                ExpectedSize = 1024
            };

            var result = await fileController.CreateUploadLink(request);
            Assert.IsInstanceOf<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.EqualTo("fileName and mimeType are required"));
        }

        [Test]
        public async Task GenerateUploadLink_EmptyMimeType_ReturnsBadRequest()
        {
            var request = new CreateUploadLinkRequest
            {
                FileName = "test-file.txt",
                MimeType = "",
                ExpectedSize = 1024
            };

            var result = await fileController.CreateUploadLink(request);
            Assert.IsInstanceOf<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.EqualTo("fileName and mimeType are required"));
        }

        [Test]
        public async Task GenerateUploadLink_InvalidUserContext_ReturnsUnauthorized()
        {
            //create controller without user context
            var controllerWithoutUser = new FileController(
                azureBlobServiceMock.Object,
                fileUploadServiceMock.Object,
                appDbContext,
                configuration,
                new FileConverter(new List<IFileConversionStrategy> { new Mp4HlsConversionStrategy(azureBlobServiceMock.Object) }),
                fileAccessValidator);

            var request = new CreateUploadLinkRequest
            {
                FileName = "test-file.txt",
                MimeType = "text/plain",
                ExpectedSize = 1024
            };

            var result = await controllerWithoutUser.CreateUploadLink(request);
            Assert.IsInstanceOf<UnauthorizedObjectResult>(result);
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.Value, Is.EqualTo("Invalid or missing user ID"));
        }

        [Test]
        public async Task GenerateUploadLink_CreatesPendingFileRecord()
        {
            var request = new CreateUploadLinkRequest
            {
                FileName = "test-file.txt",
                MimeType = "text/plain",
                ExpectedSize = 1024
            };

            var initialFileCount = appDbContext.Files.Count();

            var result = await fileController.CreateUploadLink(request);
            Assert.IsInstanceOf<OkObjectResult>(result);
            
            var newFileCount = appDbContext.Files.Count();
            Assert.That(newFileCount, Is.EqualTo(initialFileCount + 1));

            var newFile = appDbContext.Files.OrderByDescending(f => f.UploadTimestamp).First();
            Assert.That(newFile.FileName, Is.EqualTo("test-file.txt"));
            Assert.That(newFile.MimeType, Is.EqualTo("text/plain"));
            Assert.That(newFile.Size, Is.EqualTo(1024));
            Assert.That(newFile.UserId, Is.EqualTo(testUser.id));
            Assert.That(newFile.Status, Is.EqualTo(FileStatus.Pending));
        }

        [Test]
        public async Task GenerateUploadLink_ReturnsCorrectResponseStructure()
        {
            var request = new CreateUploadLinkRequest
            {
                FileName = "test-file.txt",
                MimeType = "text/plain",
                ExpectedSize = 1024
            };

            var result = await fileController.CreateUploadLink(request);
            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var fileIdProperty = responseType.GetProperty("fileId");
            var uploadUrlProperty = responseType.GetProperty("uploadUrl");

            Assert.IsNotNull(fileIdProperty);
            Assert.IsNotNull(uploadUrlProperty);
            Assert.IsInstanceOf<Guid>(fileIdProperty.GetValue(response));
            Assert.That(uploadUrlProperty.GetValue(response), Is.EqualTo("https://test.blob.core.windows.net/test/upload-url"));
        }
    }
}
