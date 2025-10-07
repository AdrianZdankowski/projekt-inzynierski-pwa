using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Test.IntegrationTests
{
    public class TestApiFactory : WebApplicationFactory<Program>
    {
        //unique DB for each test run
        private static readonly string DbName = $"IntegrationTestsDb_{System.Guid.NewGuid():N}";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureAppConfiguration((context, config) =>
            {            
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["AppSettings:JwtIssuer"] = "TestIssuer",
                    ["AppSettings:JwtAudience"] = "TestAudience",
                    ["AppSettings:JwtSecret"] = "TokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenTokenToken",
                    ["AzureStorage:ConnectionString"] = "UseDevelopmentStorage=true",
                    ["AzureStorage:ContainerName"] = "test-container",
                    ["ConnectionStrings:DefaultConnection"] = "InMemoryDb"
                });
            });

            builder.ConfigureServices(services =>
            {
                var dbDesc = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (dbDesc != null) services.Remove(dbDesc);

                services.AddDbContext<AppDbContext>(o =>
                    o.UseInMemoryDatabase(DbName));

                var blobDesc = services.SingleOrDefault(d => d.ServiceType == typeof(IAzureBlobService));
                if (blobDesc != null) services.Remove(blobDesc);

                services.AddSingleton<IAzureBlobService, StubAzureBlobService>();

                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.EnsureCreated();
            });
        }
    }
}