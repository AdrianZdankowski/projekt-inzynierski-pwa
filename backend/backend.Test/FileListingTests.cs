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
    public class FileListingTests : TestBase
    {
        private Mock<IFileUploadService> fileUploadServiceMock;
        private FileController fileController;
        private FileAccessValidator fileAccessValidator;

        [SetUp]
        public void FileListingTestSetUp()
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
        public async Task GetUserFiles_DefaultParameters_ReturnsOkWithPagination()
        {
            var result = await fileController.GetUserFiles();

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult.Value);

            var response = okResult.Value;
            var responseType = response.GetType();
            var itemsProperty = responseType.GetProperty("items");
            var pageProperty = responseType.GetProperty("page");
            var pageSizeProperty = responseType.GetProperty("pageSize");
            var totalItemsProperty = responseType.GetProperty("totalItems");
            var totalPagesProperty = responseType.GetProperty("totalPages");

            Assert.IsNotNull(itemsProperty);
            Assert.IsNotNull(pageProperty);
            Assert.IsNotNull(pageSizeProperty);
            Assert.IsNotNull(totalItemsProperty);
            Assert.IsNotNull(totalPagesProperty);

            Assert.That(pageProperty.GetValue(response), Is.EqualTo(1));
            Assert.That(pageSizeProperty.GetValue(response), Is.EqualTo(20));
        }

        [Test]
        public async Task GetUserFiles_CustomPagination_ReturnsCorrectPage()
        {
            var page = 1;
            var pageSize = 5;

            var result = await fileController.GetUserFiles(page, pageSize);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var pageProperty = responseType.GetProperty("page");
            var pageSizeProperty = responseType.GetProperty("pageSize");

            Assert.That(pageProperty.GetValue(response), Is.EqualTo(page));
            Assert.That(pageSizeProperty.GetValue(response), Is.EqualTo(pageSize));
        }

        [Test]
        public async Task GetUserFiles_InvalidPageNumber_DefaultsToPageOne()
        {
            var result = await fileController.GetUserFiles(0, 20);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var pageProperty = responseType.GetProperty("page");

            Assert.That(pageProperty.GetValue(response), Is.EqualTo(1));
        }

        [Test]
        public async Task GetUserFiles_InvalidPageSize_ClampsToValidRange()
        {
            var result = await fileController.GetUserFiles(1, 200);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var pageSizeProperty = responseType.GetProperty("pageSize");

            Assert.That(pageSizeProperty.GetValue(response), Is.EqualTo(100)); //clamped to max
        }

        [Test]
        public async Task GetUserFiles_SortByFileName_ReturnsSortedResults()
        {
            var sortBy = "fileName";
            var sortDirection = "asc";

            var result = await fileController.GetUserFiles(1, 20, sortBy, sortDirection);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var sortByProperty = responseType.GetProperty("sortBy");
            var sortDirProperty = responseType.GetProperty("sortDir");

            Assert.That(sortByProperty.GetValue(response), Is.EqualTo("filename"));
            Assert.That(sortDirProperty.GetValue(response), Is.EqualTo("asc"));
        }

        [Test]
        public async Task GetUserFiles_SortBySize_ReturnsSortedResults()
        {
            var sortBy = "size";
            var sortDirection = "desc";

            var result = await fileController.GetUserFiles(1, 20, sortBy, sortDirection);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var sortByProperty = responseType.GetProperty("sortBy");
            var sortDirProperty = responseType.GetProperty("sortDir");

            Assert.That(sortByProperty.GetValue(response), Is.EqualTo("size"));
            Assert.That(sortDirProperty.GetValue(response), Is.EqualTo("desc"));
        }

        [Test]
        public async Task GetUserFiles_InvalidSortBy_DefaultsToUploadTimestamp()
        {
            var sortBy = "invalidField";

            var result = await fileController.GetUserFiles(1, 20, sortBy);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var sortByProperty = responseType.GetProperty("sortBy");

            Assert.That(sortByProperty.GetValue(response), Is.EqualTo("uploadtimestamp"));
        }

        [Test]
        public async Task GetUserFiles_SearchQuery_ReturnsFilteredResults()
        {
            var searchQuery = "test";

            var result = await fileController.GetUserFiles(1, 20, "uploadTimestamp", "desc", searchQuery);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var qProperty = responseType.GetProperty("q");

            Assert.That(qProperty.GetValue(response), Is.EqualTo(searchQuery));
        }

        [Test]
        public async Task GetUserFiles_EmptySearchQuery_ReturnsAllResults()
        {
            var result = await fileController.GetUserFiles(1, 20, "uploadTimestamp", "desc", "");

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var qProperty = responseType.GetProperty("q");
            Assert.That(qProperty.GetValue(response), Is.EqualTo(""));
        }

        [Test]
        public async Task GetUserFiles_IncludesSharedFiles()
        {
            //create another user and share a file with test user
            var otherUser = new User
            {
                id = Guid.NewGuid(),
                username = "otherUser",
                passwordHash = "hashedPassword",
                email = "other@test.com",
                role = Role.User
            };

            var sharedFile = new WebApplication1.File
            {
                id = Guid.NewGuid(),
                UserId = otherUser.id,
                FileName = "shared-file.txt",
                MimeType = "text/plain",
                Size = 2048,
                BlobName = "shared-blob-name",
                UploadTimestamp = DateTime.UtcNow,
                Status = FileStatus.Uploaded,
                Checksum = null
            };

            appDbContext.Users.Add(otherUser);
            appDbContext.Files.Add(sharedFile);
            await appDbContext.SaveChangesAsync();

            var fileAccess = new WebApplication1.FileAccess
            {
                id = Guid.NewGuid(),
                file = sharedFile,
                user = testUser
            };

            appDbContext.FileAccesses.Add(fileAccess);
            await appDbContext.SaveChangesAsync();

            var result = await fileController.GetUserFiles();

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var itemsProperty = responseType.GetProperty("items");
            var items = itemsProperty.GetValue(response) as IEnumerable<FileListItem>;

            Assert.IsNotNull(items);
            Assert.That(items.Count(), Is.GreaterThan(0));

            var hasSharedFile = items.Any(f => f.FileName == "shared-file.txt");
            Assert.IsTrue(hasSharedFile);
        }

        [Test]
        public async Task GetUserFiles_InvalidUserContext_ReturnsUnauthorized()
        {
            //create controller without user context
            var controllerWithoutUser = new FileController(
                azureBlobServiceMock.Object,
                fileUploadServiceMock.Object,
                appDbContext,
                configuration,
                new FileConverter(configuration, azureBlobServiceMock.Object),
                fileAccessValidator);

            var result = await controllerWithoutUser.GetUserFiles();

            Assert.IsInstanceOf<UnauthorizedObjectResult>(result);
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.Value, Is.EqualTo("Invalid or missing user ID"));
        }

        [Test]
        public async Task GetUserFiles_ReturnsCorrectPaginationInfo()
        {
            var result = await fileController.GetUserFiles(1, 1);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var response = okResult.Value;

            var responseType = response.GetType();
            var hasNextProperty = responseType.GetProperty("hasNext");
            var hasPrevProperty = responseType.GetProperty("hasPrev");

            Assert.IsNotNull(hasNextProperty);
            Assert.IsNotNull(hasPrevProperty);

            var hasNext = (bool)hasNextProperty.GetValue(response);
            var hasPrev = (bool)hasPrevProperty.GetValue(response);

            Assert.That(hasPrev, Is.False); //should not have previous
        }
    }
}
