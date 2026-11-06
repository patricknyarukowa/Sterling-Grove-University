using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Models;

namespace SterlingGrove.Api.Data;

// IdentityDbContext adds the AspNetUsers / AspNetRoles tables used for admin login.
public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<Faculty> Faculties => Set<Faculty>();
    public DbSet<Programme> Programmes => Set<Programme>();
    public DbSet<NewsArticle> NewsArticles => Set<NewsArticle>();
    public DbSet<CampusEvent> Events => Set<CampusEvent>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Faculty>().HasIndex(f => f.Slug).IsUnique();
        builder.Entity<NewsArticle>().HasIndex(n => n.Slug).IsUnique();
        builder.Entity<Programme>().HasIndex(p => p.Code).IsUnique();

        // A message's time is stored in UTC. SQL Server forgets that on the way back, so mark it again,
        // or browsers read it as local time. Event and publishing times are campus clock times, so they stay as typed.
        builder.Entity<ContactMessage>().Property(m => m.CreatedAt)
            .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<Programme>().Property(p => p.DurationYears).HasPrecision(3, 1);
        // Store the enum as readable text ("Undergraduate") instead of a number
        builder.Entity<Programme>().Property(p => p.Level).HasConversion<string>().HasMaxLength(20);

        // Deleting a faculty that still has programmes is blocked rather than cascading
        builder.Entity<Programme>()
            .HasOne(p => p.Faculty)
            .WithMany(f => f.Programmes)
            .HasForeignKey(p => p.FacultyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
