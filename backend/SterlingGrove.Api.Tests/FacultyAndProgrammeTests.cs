using System.Data.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Controllers;
using SterlingGrove.Api.Models;
using static SterlingGrove.Api.Tests.TestUniversity;

namespace SterlingGrove.Api.Tests;

public class FacultyAndProgrammeTests : IDisposable
{
    private readonly TestUniversity uni = new();
    private readonly FacultiesController faculties;
    private readonly ProgrammesController programmes;

    public FacultyAndProgrammeTests()
    {
        faculties = new FacultiesController(uni.Db);
        programmes = new ProgrammesController(uni.Db);
    }

    public void Dispose() => uni.Dispose();

    [Fact]
    public async Task A_faculty_with_programmes_cannot_be_deleted()
    {
        var faculty = await uni.AddFacultyAsync();
        await uni.AddProgrammeAsync(faculty);

        Assert.Equal(409, StatusOf(await faculties.Delete(faculty.Id)));
        Assert.Equal(1, await uni.Db.Faculties.CountAsync());
    }

    [Fact]
    public async Task An_empty_faculty_can_be_deleted()
    {
        var faculty = await uni.AddFacultyAsync();

        Assert.Equal(204, StatusOf(await faculties.Delete(faculty.Id)));
        Assert.Equal(0, await uni.Db.Faculties.CountAsync());
    }

    [Fact]
    public async Task The_database_itself_also_refuses_to_orphan_programmes()
    {
        var faculty = await uni.AddFacultyAsync();
        await uni.AddProgrammeAsync(faculty);

        await Assert.ThrowsAnyAsync<DbException>(() => uni.Db.Faculties.Where(f => f.Id == faculty.Id).ExecuteDeleteAsync());
    }

    [Fact]
    public async Task The_faculty_list_counts_each_faculties_programmes()
    {
        var law = await uni.AddFacultyAsync("Law");
        await uni.AddFacultyAsync("Arts");
        await uni.AddProgrammeAsync(law, code: "A");
        await uni.AddProgrammeAsync(law, code: "B");

        var list = await faculties.GetAll();

        Assert.Equal(["Arts", "Law"], list.Select(f => f.Name));
        Assert.Equal([0, 2], list.Select(f => f.ProgrammeCount));
    }

    [Fact]
    public async Task A_faculty_page_only_lists_its_own_programmes()
    {
        var law = await uni.AddFacultyAsync("Law");
        var arts = await uni.AddFacultyAsync("Arts");
        await uni.AddProgrammeAsync(law, "LLB", "A");
        await uni.AddProgrammeAsync(arts, "BA", "B");

        var detail = (await faculties.GetBySlug("law")).Value!;

        Assert.Equal("LLB", detail.Programmes.Single().Title);
        Assert.IsType<NotFoundResult>((await faculties.GetBySlug("nope")).Result);
    }

    [Fact]
    public async Task Faculty_slugs_are_generated_must_be_unique_and_cannot_be_empty()
    {
        Assert.Equal(201, StatusOf(await faculties.Create(new Faculty { Name = "Health & Care" })));
        Assert.Equal("health-care", (await uni.Db.Faculties.SingleAsync()).Slug);

        Assert.Equal(409, StatusOf(await faculties.Create(new Faculty { Name = "Health, Care" })));
        Assert.Equal(400, StatusOf(await faculties.Create(new Faculty { Name = "&&&" })));
        Assert.Equal(1, await uni.Db.Faculties.CountAsync());
    }

    [Fact]
    public async Task Renaming_a_faculty_can_keep_its_address()
    {
        var faculty = await uni.AddFacultyAsync("Law");

        var result = await faculties.Update(faculty.Id, new Faculty { Name = "School of Law", Slug = "law" });

        Assert.Equal(204, StatusOf(result));
        uni.Forget();
        var saved = await uni.Db.Faculties.SingleAsync();
        Assert.Equal(("School of Law", "law"), (saved.Name, saved.Slug));
    }

    [Fact]
    public async Task Programme_search_looks_at_title_code_and_summary_and_combines_filters()
    {
        var law = await uni.AddFacultyAsync("Law");
        var arts = await uni.AddFacultyAsync("Arts");
        await uni.AddProgrammeAsync(law, "Data Law", "LAW-1", ProgrammeLevel.Masters);
        await uni.AddProgrammeAsync(arts, "Design", "DATA-2", ProgrammeLevel.Undergraduate);
        await uni.AddProgrammeAsync(arts, "History", "ART-3", ProgrammeLevel.Masters, summary: "Reading old Data");
        await uni.AddProgrammeAsync(arts, "Music", "ART-4", ProgrammeLevel.Masters);

        Assert.Equal("Data Law", (await programmes.Search("Data Law", null, null)).Single().Title);
        Assert.Equal("Design", (await programmes.Search("DATA-2", null, null)).Single().Title);
        Assert.Equal("History", (await programmes.Search("old Data", null, null)).Single().Title);
        Assert.Equal(["History", "Music"], (await programmes.Search(null, ProgrammeLevel.Masters, arts.Id)).Select(p => p.Title));
        Assert.Equal("Music", (await programmes.Search("ART-4", ProgrammeLevel.Masters, arts.Id)).Single().Title);
        Assert.Empty(await programmes.Search("ART-4", ProgrammeLevel.Undergraduate, arts.Id));
    }

    [Fact]
    public async Task Programme_results_carry_the_faculty_they_link_to()
    {
        var law = await uni.AddFacultyAsync("Law");
        await uni.AddProgrammeAsync(law);

        var result = (await programmes.Search(null, null, null)).Single();

        Assert.Equal(("Law", "law"), (result.FacultyName, result.FacultySlug));
    }

    [Fact]
    public async Task A_programme_needs_a_real_faculty_and_a_unique_code()
    {
        var law = await uni.AddFacultyAsync();
        var existing = await uni.AddProgrammeAsync(law, code: "LAW-1");
        var other = await uni.AddProgrammeAsync(law, code: "LAW-2");

        Assert.Equal(400, StatusOf(await programmes.Create(new Programme { Title = "X", Code = "NEW", FacultyId = 999 })));
        Assert.Equal(409, StatusOf(await programmes.Create(new Programme { Title = "X", Code = "LAW-1", FacultyId = law.Id })));
        Assert.Equal(201, StatusOf(await programmes.Create(new Programme { Id = 777, Title = "X", Code = "NEW", FacultyId = law.Id })));

        Assert.Equal(400, StatusOf(await programmes.Update(existing.Id, new Programme { Title = "X", Code = "LAW-1", FacultyId = 999 })));
        Assert.Equal(409, StatusOf(await programmes.Update(existing.Id, new Programme { Title = "X", Code = "LAW-2", FacultyId = law.Id })));
        Assert.Equal(204, StatusOf(await programmes.Update(other.Id, new Programme { Title = "Keeps its code", Code = "LAW-2", FacultyId = law.Id })));
        Assert.Equal(404, StatusOf(await programmes.Update(999, new Programme { Title = "X", Code = "Z", FacultyId = law.Id })));
    }
}
