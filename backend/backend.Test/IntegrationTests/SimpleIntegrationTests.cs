using System.Text;
using System.Text.Json;
using backend.DTO;
using backend.DTO.File;
using backend.DTO.User;
using backend.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApplication1;

namespace backend.Test.IntegrationTests
{
    [TestFixture]
    public class SimpleIntegrationTests
    {
        private WebApplicationFactory<Program> factory;
        private HttpClient client;
        private AppDbContext dbContext;
        private IAuthService authService;
        private User testUser;
        private string testUserAccessToken;

        [OneTimeSetUp]
        public async Task OneTimeSetUp()
        {
            factory = new TestApiFactory();
            client = factory.CreateClient();

            var scope = factory.Services.CreateScope();
            dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

            dbContext.Database.EnsureCreated();
            await SeedTestDataAsync();
        }

        //clean db before each test
        [SetUp]
        public async Task ResetDatabase()
        {
            dbContext.FileAccesses.RemoveRange(dbContext.FileAccesses);
            dbContext.Files.RemoveRange(dbContext.Files);

            if (testUser != null)
            {
                var others = dbContext.Users.Where(u => u.id != testUser.id);
                dbContext.Users.RemoveRange(others);
            }

            await dbContext.SaveChangesAsync();
        }


        [OneTimeTearDown]
        public void OneTimeTearDown()
        {
            dbContext?.Dispose();
            client?.Dispose();
            factory?.Dispose();
        }

        private async Task SeedTestDataAsync()
        {
            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            var hashedPassword = passwordHasher.HashPassword(new User(), "TestPassword123!");

            testUser = new User
            {
                id = Guid.NewGuid(),
                username = "testuser",
                passwordHash = hashedPassword,
                email = "test@example.com",
                role = Role.User,
                refreshToken = null,
                refreshTokenExpiry = null
            };

            dbContext.Users.Add(testUser);
            await dbContext.SaveChangesAsync();

            var loginResult = await authService.LoginAsync(new UserDto
            {
                username = testUser.username,
                password = "TestPassword123!"
            });

            testUserAccessToken = loginResult.AccessToken;
        }

        private void SetAuthorizationHeader(string accessToken)
        {
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
        }

        private void ClearAuthorizationHeader()
        {
            client.DefaultRequestHeaders.Authorization = null;
        }

        [Test]
        public async Task Register_ValidUser_ReturnsOk()
        {
            var newUser = new UserDto
            {
                username = "newuser",
                password = "TestPass123!"
            };

            var json = JsonSerializer.Serialize(newUser);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("/api/auth/register", content);
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.OK));

            var createdUser = await dbContext.Users.FirstOrDefaultAsync(u => u.username == "newuser");
            Assert.IsNotNull(createdUser);
            Assert.That(createdUser.username, Is.EqualTo("newuser"));
            Assert.That(createdUser.role, Is.EqualTo(Role.User));
        }

        [Test]
        public async Task Login_ValidCredentials_ReturnsAccessToken()
        {
            var loginRequest = new UserDto
            {
                username = testUser.username,
                password = "TestPassword123!"
            };

            var json = JsonSerializer.Serialize(loginRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("/api/auth/login", content);
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.OK));

            var responseContent = await response.Content.ReadAsStringAsync();
            var accessTokenDto = JsonSerializer.Deserialize<AccessTokenDto>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.IsNotNull(accessTokenDto);
            Assert.IsNotNull(accessTokenDto.AccessToken);
            Assert.That(accessTokenDto.AccessToken.Length, Is.GreaterThan(0));

            var cookies = response.Headers.GetValues("Set-Cookie");
            Assert.That(cookies, Is.Not.Empty);
            Assert.That(cookies.Any(c => c.Contains("refreshToken")), Is.True);
        }

        [Test]
        public async Task Login_InvalidCredentials_ReturnsBadRequest()
        {
            var invalidLoginRequest = new UserDto
            {
                username = testUser.username,
                password = "WrongPassword"
            };

            var json = JsonSerializer.Serialize(invalidLoginRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("/api/auth/login", content);
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.BadRequest));
        }

        [Test]
        public async Task GetUserFiles_WithAuthorization_ReturnsOk()
        {
            SetAuthorizationHeader(testUserAccessToken);
            var response = await client.GetAsync("/api/file");
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.OK));

            var responseContent = await response.Content.ReadAsStringAsync();
            var filesResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);

            Assert.That(filesResponse.TryGetProperty("items", out var itemsElement), Is.True);
            Assert.That(filesResponse.TryGetProperty("totalItems", out var totalItemsElement), Is.True);
            Assert.That(filesResponse.TryGetProperty("page", out var pageElement), Is.True);
            Assert.That(filesResponse.TryGetProperty("pageSize", out var pageSizeElement), Is.True);

            var items = itemsElement.EnumerateArray().ToList();
            Assert.That(totalItemsElement.GetInt32(), Is.EqualTo(0)); // No files initially
            Assert.That(pageElement.GetInt32(), Is.EqualTo(1));
            Assert.That(pageSizeElement.GetInt32(), Is.EqualTo(20));
        }

        [Test]
        public async Task GetUserFiles_NoAuthorization_ReturnsUnauthorized()
        {
            ClearAuthorizationHeader();

            var response = await client.GetAsync("/api/file");
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.Unauthorized));
        }

        [Test]
        public async Task GenerateUploadLink_ValidRequest_ReturnsOkWithLink()
        {
            SetAuthorizationHeader(testUserAccessToken);

            var request = new CreateUploadLinkRequest
            {
                FileName = "large-file.zip",
                MimeType = "application/zip",
                ExpectedSize = 1048576 //1MB
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("/api/file/generate-upload-link", content);
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.OK));

            var responseContent = await response.Content.ReadAsStringAsync();
            var linkResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);

            Assert.That(linkResponse.TryGetProperty("fileId", out var fileIdElement), Is.True);
            Assert.That(linkResponse.TryGetProperty("uploadUrl", out var uploadUrlElement), Is.True);

            var fileId = Guid.Parse(fileIdElement.GetString());
            Assert.That(uploadUrlElement.GetString(), Is.Not.Empty);

            var pendingFile = await dbContext.Files.FindAsync(fileId);
            Assert.IsNotNull(pendingFile);
            Assert.That(pendingFile.FileName, Is.EqualTo("large-file.zip"));
            Assert.That(pendingFile.MimeType, Is.EqualTo("application/zip"));
            Assert.That(pendingFile.Size, Is.EqualTo(1048576));
            Assert.That(pendingFile.UserId, Is.EqualTo(testUser.id));
            Assert.That(pendingFile.Status, Is.EqualTo(FileStatus.Pending));
        }

        [Test]
        public async Task GenerateUploadLink_NoAuthorization_ReturnsUnauthorized()
        {
            ClearAuthorizationHeader();

            var request = new CreateUploadLinkRequest
            {
                FileName = "large-file.zip",
                MimeType = "application/zip",
                ExpectedSize = 1048576
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("/api/file/generate-upload-link", content);
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.Unauthorized));
        }

        [Test]
        public async Task GenerateUploadLink_MissingFileName_ReturnsBadRequest()
        {
            SetAuthorizationHeader(testUserAccessToken);

            var request = new CreateUploadLinkRequest
            {
                FileName = null,
                MimeType = "application/zip",
                ExpectedSize = 1048576
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("/api/file/generate-upload-link", content);
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.BadRequest));
        }

        [Test]
        public async Task CompleteWorkflow_RegisterLoginAndAccessProtectedResource()
        {
            //register a new user
            var newUser = new UserDto
            {
                username = "workflowuser",
                password = "TestPass123!"
            };

            var registerJson = JsonSerializer.Serialize(newUser);
            var registerContent = new StringContent(registerJson, Encoding.UTF8, "application/json");
            var registerResponse = await client.PostAsync("/api/auth/register", registerContent);
            Assert.That(registerResponse.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.OK));

            //login to get access token
            var loginJson = JsonSerializer.Serialize(newUser);
            var loginContent = new StringContent(loginJson, Encoding.UTF8, "application/json");
            var loginResponse = await client.PostAsync("/api/auth/login", loginContent);
            Assert.That(loginResponse.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.OK));

            var loginResponseContent = await loginResponse.Content.ReadAsStringAsync();
            var accessTokenDto = JsonSerializer.Deserialize<AccessTokenDto>(loginResponseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            //use access token to access protected resource
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessTokenDto.AccessToken);
            var protectedResponse = await client.GetAsync("/api/file");
            Assert.That(protectedResponse.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.OK));

            //verify response structure
            var protectedResponseContent = await protectedResponse.Content.ReadAsStringAsync();
            var filesResponse = JsonSerializer.Deserialize<JsonElement>(protectedResponseContent);

            Assert.That(filesResponse.TryGetProperty("items", out var itemsElement), Is.True);
            Assert.That(filesResponse.TryGetProperty("totalItems", out var totalItemsElement), Is.True);
            Assert.That(totalItemsElement.GetInt32(), Is.EqualTo(0)); //no files for new user
        }        
    }
}
