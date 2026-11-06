using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Controllers;
using SterlingGrove.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---------------------------------------------------------------

// SQL Server via EF Core. The connection string lives in appsettings.json.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// ASP.NET Core Identity with token login (POST /api/auth/login returns a bearer token)
builder.Services.AddAuthorization();
builder.Services
    .AddIdentityApiEndpoints<IdentityUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

// Send enums as text ("Masters") instead of numbers
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// The contact form is the one thing anyone can write to, so limit it per IP address
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.OnRejected = (context, ct) => new ValueTask(context.HttpContext.Response.WriteAsJsonAsync(
        new { message = "That's a lot of messages in a short time. Please wait a minute and try again." }, ct));
    o.AddPolicy(Policies.Contact, context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(1) }));
});

builder.Services.AddOpenApi();

var app = builder.Build();

// --- HTTP pipeline ----------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // the API description at /openapi/v1.json
}

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();

// Built-in Identity endpoints: /api/auth/login, /api/auth/refresh, ...
// Public sign-up is switched off: only the seeded admin (or users an admin creates) can log in.
app.MapGroup("/api/auth")
    .MapIdentityApi<IdentityUser>()
    .AddEndpointFilter(async (context, next) =>
        context.HttpContext.Request.Path.Value!.EndsWith("/register", StringComparison.OrdinalIgnoreCase)
            ? Results.NotFound()
            : await next(context));

await SeedData.InitialiseAsync(app.Services);

app.Run();
