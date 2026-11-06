using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SterlingGrove.Api.Models;

// Each class below becomes one table in SQL Server (EF Core "code first").
// [Required] / [MaxLength] drive both database column rules and API validation.

public class Faculty
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Name { get; set; } = "";

    // URL-friendly name, e.g. "engineering-technology" (generated from Name when blank)
    [MaxLength(120)]
    public string Slug { get; set; } = "";

    [MaxLength(200)]
    public string Tagline { get; set; } = "";

    [MaxLength(4000)]
    public string Description { get; set; } = "";

    [MaxLength(120)]
    public string DeanName { get; set; } = "";

    // Name of an icon the frontend knows how to draw (e.g. "atom", "scales")
    [MaxLength(40)]
    public string Icon { get; set; } = "star";

    // [JsonIgnore] stops a Faculty -> Programmes -> Faculty loop when serialising
    [JsonIgnore]
    public List<Programme> Programmes { get; set; } = [];
}

public enum ProgrammeLevel
{
    Undergraduate,
    Honours,
    Masters,
    Doctoral,
    Online,
    ShortCourse
}

public class Programme
{
    public int Id { get; set; }

    [Required, MaxLength(160)]
    public string Title { get; set; } = "";

    [Required, MaxLength(20)]
    public string Code { get; set; } = "";

    public ProgrammeLevel Level { get; set; }

    [Range(0.5, 8)]
    public decimal DurationYears { get; set; }

    [MaxLength(1000)]
    public string Summary { get; set; } = "";

    [MaxLength(2000)]
    public string AdmissionRequirements { get; set; } = "";

    // Foreign key: every programme belongs to one faculty
    public int FacultyId { get; set; }
    public Faculty? Faculty { get; set; }
}

public class NewsArticle
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = "";

    // Generated from Title when blank
    [MaxLength(200)]
    public string Slug { get; set; } = "";

    [MaxLength(500)]
    public string Summary { get; set; } = "";

    public string Body { get; set; } = "";

    [MaxLength(60)]
    public string Category { get; set; } = "General";

    [MaxLength(120)]
    public string Author { get; set; } = "";

    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;

    // Featured articles appear in the home page hero carousel
    public bool IsFeatured { get; set; }
}

public class CampusEvent
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = "";

    [MaxLength(2000)]
    public string Description { get; set; } = "";

    public DateTime StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }

    [MaxLength(160)]
    public string Location { get; set; } = "";

    [MaxLength(60)]
    public string Category { get; set; } = "General";
}

public class Testimonial
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string StudentName { get; set; } = "";

    [MaxLength(160)]
    public string Programme { get; set; } = "";

    [Required, MaxLength(600)]
    public string Quote { get; set; } = "";
}

public class ContactMessage
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Name { get; set; } = "";

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = "";

    [Required, MaxLength(200)]
    public string Subject { get; set; } = "";

    [Required, MaxLength(4000)]
    public string Message { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
}
