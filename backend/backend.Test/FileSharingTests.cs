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
using Moq;
using WebApplication1;

namespace backend.Test
{
    public class FileSharingTests : TestBase
    {
        private Mock<IFileUploadService> fileUploadServiceMock;
        private FileController fileController;
        private FileAccessValidator fileAccessValidator;

        [SetUp]
        public void FileSharingTestSetUp()
        {
            fileUploadServiceMock = new Mock<IFileUploadService>();
            fileAccessValidator = new FileAccessValidator(userContext, configuration);
            fileController = new FileController(azureBlobServiceMock.Object, fileUploadServiceMock.Object, fileContext,userContext, configuration, new FileConverter(configuration, azureBlobServiceMock.Object), fileAccessValidator);

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
        public void GetFile_OwnedFile_ReturnOk()
        {
            var result = fileController.GetFileWithLink(file.id).Result;
            var okResult = result as OkObjectResult;
            FileDownloadDto returnedFileDto = (FileDownloadDto)okResult.Value;
            Assert.That(returnedFileDto.FileName.Equals(file.FileName));
        }

        [Test]
        public async Task GetFile_SharedFile_ReturnOk()
        {
           //shareFile
           var newUser = new User
           {
               email = "testEmail",
               id = Guid.NewGuid(),
               username = "newUser",
               passwordHash = "hashedPassword",
               role = Role.User
           };
           userContext.Users.Add(newUser);
           userContext.SaveChanges();

           var shareResult = await fileController.ShareFile(new ShareFileDto { FileId = file.id, UserName = newUser.username });
           Assert.IsInstanceOf<OkResult>(shareResult);

           //change HttpContext to newUser
           var claims = new List<Claim>
           {
               new Claim(ClaimTypes.Name, newUser.username),
               new Claim(ClaimTypes.NameIdentifier, newUser.id.ToString()),
               new Claim(ClaimTypes.Role, newUser.role.ToStringValue()),
               new Claim("type", "access")
           };

           var identity = new ClaimsIdentity(claims, "jwt");
           var user = new ClaimsPrincipal(identity);

           fileController.ControllerContext.HttpContext = new DefaultHttpContext
           {
               User = user
           };
           var accesses = userContext.FileAccesses.ToList();
           var result = await fileController.GetFileWithLink(file.id);
           Assert.IsInstanceOf<OkObjectResult>(result);
        }
        
        [Test]
        public async Task GetFile_NoAccess_ReturnForbidden()
        {
            var result = await fileController.GetFileWithLink(accessDeniedFile.id);
            Assert.IsInstanceOf<ForbidResult>(result);
        }
    }
}
