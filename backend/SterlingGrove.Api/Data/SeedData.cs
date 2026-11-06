using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Controllers;
using SterlingGrove.Api.Models;

namespace SterlingGrove.Api.Data;

// Runs at startup: applies migrations, creates the Admin user, and fills empty tables
// with sample content so the site has something to show on first run.
public static class SeedData
{
    public static async Task InitialiseAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        await db.Database.MigrateAsync();
        await KeepDatabaseOpenAsync(db, scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>());
        await SeedAdminAsync(scope.ServiceProvider, config);

        if (await db.Faculties.AnyAsync())
            return;

        var faculties = new List<Faculty>
        {
            new() { Name = "Engineering & Technology", Icon = "gear", DeanName = "Prof. Amara Okonkwo-Reyes",
                Tagline = "Designing the systems the next century will run on.",
                Description = "From autonomous systems to sustainable infrastructure, our engineers learn in studios and labs built around real industry briefs." },
            new() { Name = "Natural & Computational Sciences", Icon = "atom", DeanName = "Prof. Lukas Venter",
                Tagline = "Curiosity, measured precisely.",
                Description = "Physics, chemistry, mathematics, data science and computing share one research precinct, so ideas move quickly between disciplines." },
            new() { Name = "Business & Leadership", Icon = "chart", DeanName = "Prof. Naledi Ferreira",
                Tagline = "Leadership that compounds.",
                Description = "Programmes in finance, strategy and entrepreneurship, taught by faculty who advise boards and found companies." },
            new() { Name = "Health Sciences", Icon = "pulse", DeanName = "Prof. Imran Castellanos",
                Tagline = "Evidence, empathy and excellence in care.",
                Description = "Clinical training in partner hospitals alongside research in public health, genomics and biomedical engineering." },
            new() { Name = "Law & Governance", Icon = "scales", DeanName = "Prof. Thandiwe Marchetti",
                Tagline = "Justice, argued well.",
                Description = "Moot courts, legal clinics and policy labs prepare graduates for practice, the bench and public service." },
            new() { Name = "Humanities & Creative Arts", Icon = "feather", DeanName = "Prof. Elena Mokoena-Hart",
                Tagline = "Ideas that shape how we live.",
                Description = "Languages, philosophy, history, design and performance, taught with the conviction that culture is a form of knowledge." },
        };
        foreach (var f in faculties) f.Slug = SlugHelper.Create(f.Name);
        db.Faculties.AddRange(faculties);
        await db.SaveChangesAsync();

        Faculty F(string icon) => faculties.First(f => f.Icon == icon);
        Programme P(string title, string code, ProgrammeLevel level, decimal years, Faculty faculty, string summary) =>
            new()
            {
                Title = title, Code = code, Level = level, DurationYears = years, FacultyId = faculty.Id, Summary = summary,
                AdmissionRequirements = level switch
                {
                    ProgrammeLevel.Undergraduate => "National Senior Certificate with admission to bachelor's studies; Mathematics 60%+ where applicable.",
                    ProgrammeLevel.Honours => "A relevant bachelor's degree with an average of 65% or higher.",
                    ProgrammeLevel.Masters => "A relevant honours degree (or equivalent) and a research proposal.",
                    ProgrammeLevel.Doctoral => "A relevant master's degree and an approved supervisor.",
                    _ => "Open admission. Some modules may require prior learning."
                }
            };

        db.Programmes.AddRange(
            P("BEng Mechatronic Engineering", "ENG-MEC", ProgrammeLevel.Undergraduate, 4, F("gear"), "Mechanics, electronics and control combined to build intelligent machines."),
            P("BEng Civil & Sustainable Infrastructure", "ENG-CIV", ProgrammeLevel.Undergraduate, 4, F("gear"), "Design resilient cities, water systems and transport networks."),
            P("MEng Autonomous Systems", "ENG-AUT", ProgrammeLevel.Masters, 2, F("gear"), "Research-led study of robotics, perception and decision-making."),
            P("BSc Computer Science", "SCI-CS", ProgrammeLevel.Undergraduate, 3, F("atom"), "Algorithms, software engineering and systems, with an industry capstone."),
            P("BSc Data Science", "SCI-DS", ProgrammeLevel.Undergraduate, 3, F("atom"), "Statistics, machine learning and data engineering for real-world decisions."),
            P("BSc (Hons) Quantum Physics", "SCI-QP", ProgrammeLevel.Honours, 1, F("atom"), "Advanced quantum mechanics with time in the Sterling Quantum Lab."),
            P("PhD Computational Science", "SCI-PHD", ProgrammeLevel.Doctoral, 3, F("atom"), "Original research in simulation, AI or high-performance computing."),
            P("BCom Finance & Investment", "BUS-FIN", ProgrammeLevel.Undergraduate, 3, F("chart"), "Markets, valuation and portfolio management."),
            P("MBA Executive Leadership", "BUS-MBA", ProgrammeLevel.Masters, 2, F("chart"), "A modular MBA for working leaders, with an international residency."),
            P("Online Certificate in Digital Strategy", "BUS-ODS", ProgrammeLevel.Online, 0.5m, F("chart"), "A fully online, six-month certificate for managers leading digital change."),
            P("Bachelor of Medicine and Surgery", "HSC-MBB", ProgrammeLevel.Undergraduate, 6, F("pulse"), "Clinical medicine with early patient contact from second year."),
            P("BSc Biomedical Sciences", "HSC-BMS", ProgrammeLevel.Undergraduate, 3, F("pulse"), "Human biology, genetics and laboratory science."),
            P("Master of Public Health", "HSC-MPH", ProgrammeLevel.Masters, 1.5m, F("pulse"), "Epidemiology, health policy and global health systems."),
            P("Bachelor of Laws (LLB)", "LAW-LLB", ProgrammeLevel.Undergraduate, 4, F("scales"), "The professional law degree, with clinic and moot court practice."),
            P("LLM International Law & Technology", "LAW-ILT", ProgrammeLevel.Masters, 1, F("scales"), "Data protection, AI regulation and cross-border disputes."),
            P("Short Course: Governance for Boards", "LAW-SCG", ProgrammeLevel.ShortCourse, 0.5m, F("scales"), "An intensive course on fiduciary duty and ethical oversight."),
            P("BA Philosophy, Politics & Economics", "HUM-PPE", ProgrammeLevel.Undergraduate, 3, F("feather"), "Three disciplines, one question: how should we organise society?"),
            P("BA Design & Visual Culture", "HUM-DES", ProgrammeLevel.Undergraduate, 3, F("feather"), "Studio-based design with a grounding in theory and history."),
            P("Online Short Course: Creative Writing", "HUM-OCW", ProgrammeLevel.Online, 0.5m, F("feather"), "Workshop your fiction or non-fiction with published writers.")
        );

        var now = DateTime.UtcNow;
        db.NewsArticles.AddRange(
            News("Sterling Grove opens the Vanguard Quantum Lab", "Research", true, now.AddDays(-2),
                "A new facility gives students hands-on access to quantum hardware from their first research year."),
            News("Falcons take the inter-varsity robotics title", "Student Life", true, now.AddDays(-5),
                "A team of second-year engineers out-built 28 universities with an autonomous rescue drone."),
            News("New scholarship fund to support 500 first-generation students", "Announcements", true, now.AddDays(-9),
                "The Legacy Fund covers tuition, housing and mentorship for students who are first in their family to attend university."),
            News("Sterling Grove ranked among the top young universities", "Announcements", true, now.AddDays(-14),
                "The ranking recognises our research impact, teaching quality and international outlook."),
            News("Public health researchers map clean-water access in real time", "Research", false, now.AddDays(-18),
                "A sensor network built by students and faculty is helping municipalities respond faster to supply failures."),
            News("Law clinic marks a decade of free legal advice", "Community", false, now.AddDays(-23),
                "More than 12 000 community members have received support from student advisers supervised by practising attorneys."),
            News("Design students reimagine the campus library", "Student Life", false, now.AddDays(-30),
                "Proposals from the final-year studio will shape the library's next renovation."),
            News("MBA cohort completes international residency", "Teaching & Learning", false, now.AddDays(-37),
                "Executives spent two weeks working on live strategy briefs with partner companies abroad.")
        );

        db.Events.AddRange(
            Event($"Open Day {now.Year}", "Tour the campus, meet lecturers and attend sample lectures.", now.AddDays(6).Date.AddHours(8), 8, "Main Campus, Falcon Square", "Admissions"),
            Event("Vanguard Lecture: The Ethics of Machine Judgement", "A public lecture followed by a panel discussion.", now.AddDays(11).Date.AddHours(17), 2, "Sterling Auditorium", "Lectures"),
            Event("Startup Pitch Night", "Student founders pitch to a panel of investors.", now.AddDays(17).Date.AddHours(18), 3, "Innovation Hub", "Entrepreneurship"),
            Event("Postgraduate Research Symposium", "Masters and doctoral candidates present their work.", now.AddDays(24).Date.AddHours(9), 7, "Research Commons", "Research"),
            Event("Falcons vs. Northbridge: Varsity Cup", "Cheer on the Falcons at home.", now.AddDays(31).Date.AddHours(19), 2, "Legacy Stadium", "Sport"),
            Event("Winter Graduation Ceremony", $"Celebrating the class of {now.Year}.", now.AddDays(-20).Date.AddHours(10), 4, "Sterling Auditorium", "Ceremonies")
        );

        db.Testimonials.AddRange(
            new Testimonial { StudentName = "Zanele M.", Programme = "BSc Data Science", Quote = "The lecturers treat you like a colleague. By third year I was publishing with my supervisor." },
            new Testimonial { StudentName = "Daniel K.", Programme = "BEng Mechatronic Engineering", Quote = "The labs are open late and someone is always building something. It's the best place to learn by doing." },
            new Testimonial { StudentName = "Aisha R.", Programme = "LLB", Quote = "Working in the law clinic showed me why the law matters to real people, not just in textbooks." }
        );

        await db.SaveChangesAsync();
    }

    // SQL Server Express creates databases with AUTO_CLOSE on: the database shuts down whenever the
    // last connection closes and can take 10+ seconds to reopen, long enough for requests to time out.
    private static async Task KeepDatabaseOpenAsync(AppDbContext db, ILogger log)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "IF DATABASEPROPERTYEX(DB_NAME(), 'IsAutoClose') = 1 EXEC('ALTER DATABASE CURRENT SET AUTO_CLOSE OFF')");
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Could not switch off AUTO_CLOSE; the first request after a quiet spell may be slow");
        }
    }

    private static NewsArticle News(string title, string category, bool featured, DateTime published, string summary) => new()
    {
        Title = title,
        Slug = SlugHelper.Create(title),
        Category = category,
        IsFeatured = featured,
        PublishedAt = published,
        Author = "Sterling Grove Communications",
        Summary = summary,
        Body = summary + "\n\nThis is sample content created for the Sterling Grove University demo site. " +
               "Log in to the admin area to edit this article or write your own."
    };

    private static CampusEvent Event(string title, string description, DateTime start, int hours, string location, string category) => new()
    {
        Title = title, Description = description, StartsAt = start, EndsAt = start.AddHours(hours), Location = location, Category = category
    };

    private static async Task SeedAdminAsync(IServiceProvider services, IConfiguration config)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<IdentityUser>>();

        if (!await roleManager.RoleExistsAsync(Roles.Admin))
            await roleManager.CreateAsync(new IdentityRole(Roles.Admin));

        var email = config["Seed:AdminEmail"];
        var password = config["Seed:AdminPassword"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return;

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                throw new InvalidOperationException("Could not create admin user: " +
                    string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        if (!await userManager.IsInRoleAsync(user, Roles.Admin))
            await userManager.AddToRoleAsync(user, Roles.Admin);
    }
}
