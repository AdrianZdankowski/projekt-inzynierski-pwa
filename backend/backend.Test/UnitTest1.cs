using Azure.Core;
using backend.DTO.User;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;
using WebApplication1;

namespace backend.Test
{
    public class Tests
    {
        private AuthService authService;

        [SetUp]
        public void AuthTestSetUp()
        {
            //Create test user object
            var user = new User
            {
                email = "testEmail",
                id = new Guid(),
                username = "testUsername",
                passwordHash = "testPasswordHash"
            };

            //Mock db context
            var options = new DbContextOptionsBuilder<UserContext>()
            .UseInMemoryDatabase(databaseName: "AuthTestDb")
            .Options;
            var context = new UserContext(options);

            //Mock config with jwt settings
            var mockConfig = new Mock<IConfiguration>();
            mockConfig.Setup(c => c["AppSettings:JwtSecret"]).Returns("my-secret-key");
            mockConfig.Setup(c => c["AppSettings:JwtIssuer"]).Returns("PwaApp");
            mockConfig.Setup(c => c["AppSettings:JwtAudience"]).Returns("PwaAppUsers");

            authService = new AuthService(context, mockConfig.Object);
        }

        [Test]
        public void ReqisterUser_ValidCredentials_ReturnOk()
        {
            var testUser = new UserDto
            {
                username = "test",
                password = "test"
            };
            var response = authService.RegisterAsync(testUser);

            Assert.IsNotNull(response);
            Assert.That(response.Result.username, Is.EqualTo("test"));

            var passwordHasher = new PasswordHasher<User>();
            var hash = passwordHasher.HashPassword(new User(), testUser.password);
            var result = passwordHasher.VerifyHashedPassword(new User(), hash, testUser.password);
            Assert.That(result, Is.EqualTo(PasswordVerificationResult.Success));
        }

        [Test]
        public void ReqisterUser_UsernameExists_ReturnBadRequest()
        {
            //TODO: add test
            Assert.Pass();
        }

        [Test]
        public void ReqisterUser_InvalidCredentials_ReturnBadRequest()
        {
            //TODO: add test
            Assert.Pass();
        }

        [Test]
        public void LoginUser_CorrectCredentials_ReturnOk()
        {
            //TODO: add test
            Assert.Pass();
        }

        [Test]
        public void LoginUser_IncorrectPassword_ReturnBadRequest()
        {
            //TODO: add test
            Assert.Pass();
        }

        [Test]
        public void LoginUser_IncorrectUsername_ReturnBadRequest()
        {
            //TODO: add test
            Assert.Pass();
        }
    }
}