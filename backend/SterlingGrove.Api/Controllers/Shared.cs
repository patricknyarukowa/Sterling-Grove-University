using System.Text.RegularExpressions;

namespace SterlingGrove.Api.Controllers;

// Role name used on every write endpoint: [Authorize(Roles = Roles.Admin)]
public static class Roles
{
    public const string Admin = "Admin";
}

// Rate limiting policy names: [EnableRateLimiting(Policies.Contact)]
public static class Policies
{
    public const string Contact = "contact";
}

// Returned by list endpoints that support paging
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public static partial class SlugHelper
{
    // "Falcons Win the Regional Cup!" -> "falcons-win-the-regional-cup"
    public static string Create(string text)
    {
        var slug = NonAlphanumeric().Replace(text.ToLowerInvariant(), "-").Trim('-');
        return slug.Length > 180 ? slug[..180].TrimEnd('-') : slug;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonAlphanumeric();
}
