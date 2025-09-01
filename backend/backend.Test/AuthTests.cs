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
    [TestFixture]
    public class AuthTests
    {
        private AuthService authService;

        [SetUp]
        public void AuthTestSetUp()
        {
            //Create test user objects
            var passwordHasher = new PasswordHasher<User>();
            var hashedPassword = passwordHasher.HashPassword(new User(), "testPassword");

            var user = new User
            {
                email = "testEmail",
                id = new Guid(),
                username = "testUsername",
                passwordHash = hashedPassword,
                role = Role.User
            };


            //Mock db context
            var options = new DbContextOptionsBuilder<UserContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
            var context = new UserContext(options);

            //add test user
            context.Users.Add(user);
            context.SaveChanges();

            //Mock config with jwt settings
            var inMemorySettings = new Dictionary<string, string> {
                {"AppSettings:JwtSecret", "TokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenToken"},
                {"AppSettings:JwtIssuer", "PwaApp"},
                {"AppSettings:JwtAudience", "PwaAppUsers"}
            };

            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            authService = new AuthService(context, configuration);
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

            Assert.IsNotNull(response.Result);
            Assert.That(response.Result.username, Is.EqualTo("test"));

            var passwordHasher = new PasswordHasher<User>();
            var result = passwordHasher.VerifyHashedPassword(response.Result, response.Result.passwordHash, testUser.password);
            Assert.That(result, Is.EqualTo(PasswordVerificationResult.Success));
        }

        [Test]
        public void ReqisterUser_UsernameExists_ReturnBadRequest()
        {
            var testUser = new UserDto
            {
                username = "testUsername",
                password = "test"
            };
            var response = authService.RegisterAsync(testUser);

            Assert.IsNull(response.Result);
        }

        [Test]
        public void ReqisterUser_InvalidCredentials_ReturnBadRequest()
        {
            //TODO: add test after input validation is done
            Assert.Pass();
        }

        [Test]
        public void LoginUser_CorrectCredentials_ReturnOk()
        {
            //create dto with same credentials as one in setup
            var testUser = new UserDto
            {
                username = "testUsername",
                password = "testPassword"
            };
            var response = authService.LoginAsync(testUser);
            Assert.IsNotNull(response.Result);
        }

        [Test]
        public void LoginUser_IncorrectPassword_ReturnBadRequest()
        {
            //create dto with incorrect password
            var testUser = new UserDto
            {
                username = "testUsername",
                password = "incorrect"
            };
            var response = authService.LoginAsync(testUser);
            Assert.IsNull(response.Result);
        }

        [Test]
        public void LoginUser_IncorrectUsername_ReturnBadRequest()
        {
            //create dto with incorrect username
            var testUser = new UserDto
            {
                username = "incorrect",
                password = "testPassword"
            };
            var response = authService.LoginAsync(testUser);
            Assert.IsNull(response.Result);
        }
    }
}