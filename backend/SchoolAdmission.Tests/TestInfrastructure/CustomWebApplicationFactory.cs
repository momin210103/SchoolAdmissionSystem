
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SchoolAdmission.Infrastructure.Persistence;
using Npgsql;

namespace SchoolAdmission.Tests.TestInfrastructure;

public sealed class CustomWebApplicationFactory
    : WebApplicationFactory<Program>
{
    private readonly string _testConnectionString;

    public CustomWebApplicationFactory()
    {
        _testConnectionString =
            Environment.GetEnvironmentVariable(
                "TEST_DATABASE_CONNECTION")
            ?? throw new InvalidOperationException(
                "TEST_DATABASE_CONNECTION is missing.");

        var connection = new NpgsqlConnectionStringBuilder(
            _testConnectionString);

        if (!connection.Database.Equals(
                "school_admission_test",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Integration tests must use school_admission_test.");
        }
    }

    protected override void ConfigureWebHost(
        IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(_testConnectionString));
        });
    }

    public void EnsureDatabaseMigrated()
    {
        using var scope = Services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        var actualDatabase =
            dbContext.Database.GetDbConnection().Database;

        if (!actualDatabase.Equals(
                "school_admission_test",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"Unsafe database detected: {actualDatabase}");
        }

        dbContext.Database.Migrate();
    }
}
