using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Data;
using SterlingGrove.Api.Models;

namespace SterlingGrove.Api.Tests;

// A throwaway university on an in-memory SQLite database. It's a real relational database, so unique
// indexes and foreign keys are enforced, and it needs no SQL Server to be installed.
public sealed class TestUniversity : IDisposable
{
    private readonly SqliteConnection connection = new("DataSource=:memory:");

    public AppDbContext Db { get; }

    public TestUniversity()
    {
        connection.Open();
        Db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);
        Db.Database.EnsureCreated();
    }

    public async Task<Faculty> AddFacultyAsync(string name = "Law")
    {
        var faculty = new Faculty { Name = name, Slug = name.ToLowerInvariant() };
        Db.Faculties.Add(faculty);
        await Db.SaveChangesAsync();
        return faculty;
    }

    public async Task<Programme> AddProgrammeAsync(Faculty faculty, string title = "Bachelor of Laws", string code = "LAW-1",
        ProgrammeLevel level = ProgrammeLevel.Undergraduate, string summary = "")
    {
        var programme = new Programme { Title = title, Code = code, Level = level, DurationYears = 3, FacultyId = faculty.Id, Summary = summary };
        Db.Programmes.Add(programme);
        await Db.SaveChangesAsync();
        return programme;
    }

    public async Task<NewsArticle> AddArticleAsync(string title, string category = "General", bool featured = false, int daysAgo = 0, string summary = "")
    {
        var article = new NewsArticle
        {
            Title = title, Slug = title.ToLowerInvariant().Replace(' ', '-'), Category = category, IsFeatured = featured,
            PublishedAt = DateTime.UtcNow.AddDays(-daysAgo), Summary = summary
        };
        Db.NewsArticles.Add(article);
        await Db.SaveChangesAsync();
        return article;
    }

    public async Task<CampusEvent> AddEventAsync(string title, int startsInHours, int? endsInHours = null)
    {
        var item = new CampusEvent
        {
            Title = title, StartsAt = DateTime.UtcNow.AddHours(startsInHours),
            EndsAt = endsInHours is null ? null : DateTime.UtcNow.AddHours(endsInHours.Value)
        };
        Db.Events.Add(item);
        await Db.SaveChangesAsync();
        return item;
    }

    // Forgets what's already loaded, so the next read really comes from the database
    public void Forget() => Db.ChangeTracker.Clear();

    public static int StatusOf(IActionResult result) => ((IStatusCodeActionResult)result).StatusCode!.Value;
    public static int StatusOf<T>(ActionResult<T> result) => StatusOf(result.Result!);

    public void Dispose()
    {
        Db.Dispose();
        connection.Dispose();
    }
}
