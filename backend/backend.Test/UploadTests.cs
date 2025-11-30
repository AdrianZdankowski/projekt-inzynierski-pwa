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
    public class UploadTests : TestBase
    {
        private Mock<IFileUploadService> fileUploadServiceMock;
        private FileController fileController;
        private FileAccessValidator fileAccessValidator;
        private Mock<IFormFile> formFileMock;

        [SetUp]
        public void UploadTestSetUp()
        {
            fileUploadServiceMock = new Mock<IFileUploadService>();
            fileAccessValidator = new FileAccessValidator(appDbContext, configuration);
            fileController = new FileController(azureBlobServiceMock.Object, fileUploadServiceMock.Object, appDbContext, configuration, new FileConverter(new List<IFileConversionStrategy> { new Mp4HlsConversionStrategy(azureBlobServiceMock.Object) }), fileAccessValidator);

            formFileMock = new Mock<IFormFile>();
            formFileMock.Setup(f => f.FileName).Returns("test-file.txt");
            formFileMock.Setup(f => f.ContentType).Returns("text/plain");
            formFileMock.Setup(f => f.Length).Returns(1024);
            formFileMock.Setup(f => f.OpenReadStream()).Returns(new MemoryStream(Encoding.UTF8.GetBytes("test content")));

            //setup Azure blob service mock for upload scenarios
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
        public async Task UploadFile_ValidFile_ReturnsOkWithFileInfo()
        {
            var expectedFileId = Guid.NewGuid();

            appDbContext.Files.Add(new WebApplication1.File
            {
                id = expectedFileId,
                UserId = testUser.id,
                FileName = "hello.txt",
                MimeType = "text/plain",
                Size = 11,
                BlobName = "users/${user}/files/${id}/hello.txt",
                Status = WebApplication1.FileStatus.Uploaded,
                UploadTimestamp = DateTime.UtcNow
            });
            appDbContext.SaveChanges();

            fileUploadServiceMock
                .Setup(s => s.UploadSmallFileAsync(It.IsAny<IFormFile>(), testUser.id))
                .ReturnsAsync(expectedFileId);

            azureBlobServiceMock
                .Setup(b => b.GenerateDownloadSasUri(
                    It.IsAny<string>(), It.IsAny<TimeSpan>()))
                .Returns("https://example.test/download/sas");

            var uploadDto = new FileUploadDto { File = formFileMock.Object };

            var result = await fileController.UploadFile(uploadDto);

            var ok = result as OkObjectResult;
            Assert.IsNotNull(ok, "Expected OkObjectResult but got: " + result?.GetType().Name);
            Assert.IsNotNull(ok!.Value);

            fileUploadServiceMock.Verify(
                s => s.UploadSmallFileAsync(formFileMock.Object, testUser.id),
                Times.Once);
        }

        [Test]
        public async Task UploadFile_NullFile_ReturnsBadRequest()
        {
            var uploadDto = new FileUploadDto
            {
                File = null
            };

            var result = await fileController.UploadFile(uploadDto);
            Assert.IsInstanceOf<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.EqualTo("No file uploaded"));
        }

        [Test]
        public async Task UploadFile_EmptyFile_ReturnsBadRequest()
        {
            var emptyFileMock = new Mock<IFormFile>();
            emptyFileMock.Setup(f => f.Length).Returns(0);

            var uploadDto = new FileUploadDto
            {
                File = emptyFileMock.Object
            };

            var result = await fileController.UploadFile(uploadDto);
            Assert.IsInstanceOf<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.EqualTo("No file uploaded"));
        }

        [Test]
        public async Task UploadFile_ServiceThrowsException_ReturnsInternalServerError()
        {
            fileUploadServiceMock.Setup(s => s.UploadSmallFileAsync(It.IsAny<IFormFile>(), testUser.id))
                .ThrowsAsync(new Exception("Upload failed"));

            var uploadDto = new FileUploadDto
            {
                File = formFileMock.Object
            };

            var result = await fileController.UploadFile(uploadDto);
            Assert.IsInstanceOf<ObjectResult>(result);
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(500));
            Assert.That(objectResult.Value.ToString(), Does.Contain("Upload failed"));
        }

        [Test]
        public async Task UploadFile_InvalidUserContext_ReturnsUnauthorized()
        {
            //create controller without user context
            var controllerWithoutUser = new FileController(
                azureBlobServiceMock.Object, 
                fileUploadServiceMock.Object, 
                appDbContext, 
                configuration, 
                new FileConverter(new List<IFileConversionStrategy> { new Mp4HlsConversionStrategy(azureBlobServiceMock.Object) }), 
                fileAccessValidator);

            var uploadDto = new FileUploadDto
            {
                File = formFileMock.Object
            };
            controllerWithoutUser.ControllerContext.HttpContext = new DefaultHttpContext(); //empty user
            var result = await controllerWithoutUser.UploadFile(uploadDto);
            Assert.IsInstanceOf<UnauthorizedObjectResult>(result);
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.Value, Is.EqualTo("Invalid or missing user ID"));
        }
    }
}
