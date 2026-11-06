using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Controllers;
using SterlingGrove.Api.Models;
using static SterlingGrove.Api.Tests.TestUniversity;

namespace SterlingGrove.Api.Tests;

public class ContactTests : IDisposable
{
    private readonly TestUniversity uni = new();
    private readonly ContactController controller;

    public ContactTests() => controller = new ContactController(uni.Db);

    public void Dispose() => uni.Dispose();

    private static ContactMessage Message(string name = "Thandi") =>
        new() { Name = name, Email = "thandi@example.com", Subject = "Admissions", Message = "Hello there" };

    [Fact]
    public async Task A_visitor_can_only_set_the_fields_on_the_form()
    {
        var sneaky = Message();
        sneaky.Id = 999;
        sneaky.IsRead = true;
        sneaky.CreatedAt = new DateTime(2000, 1, 1);

        await controller.Submit(sneaky);

        var saved = await uni.Db.ContactMessages.SingleAsync();
        Assert.NotEqual(999, saved.Id);
        Assert.False(saved.IsRead);
        Assert.True(saved.CreatedAt > DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task A_message_comes_back_from_the_database_marked_as_UTC()
    {
        await controller.Submit(Message());
        uni.Forget();

        var saved = await uni.Db.ContactMessages.SingleAsync();

        // Without this the JSON has no "Z" and browsers show the time hours out
        Assert.Equal(DateTimeKind.Utc, saved.CreatedAt.Kind);
    }

    [Fact]
    public async Task The_inbox_shows_unread_first_then_newest()
    {
        var now = DateTime.UtcNow;
        uni.Db.ContactMessages.AddRange(
            new ContactMessage { Name = "Read", Email = "a@example.com", Subject = "s", Message = "m", IsRead = true, CreatedAt = now },
            new ContactMessage { Name = "Old unread", Email = "a@example.com", Subject = "s", Message = "m", CreatedAt = now.AddDays(-2) },
            new ContactMessage { Name = "New unread", Email = "a@example.com", Subject = "s", Message = "m", CreatedAt = now.AddDays(-1) });
        await uni.Db.SaveChangesAsync();

        Assert.Equal(["New unread", "Old unread", "Read"], (await controller.Inbox()).Select(m => m.Name));
    }

    [Fact]
    public async Task A_message_can_be_marked_read_and_unread()
    {
        await controller.Submit(Message());
        var id = (await uni.Db.ContactMessages.SingleAsync()).Id;

        Assert.Equal(204, StatusOf(await controller.MarkRead(id)));
        uni.Forget();
        Assert.True((await uni.Db.ContactMessages.SingleAsync()).IsRead);

        Assert.Equal(204, StatusOf(await controller.MarkRead(id, false)));
        uni.Forget();
        Assert.False((await uni.Db.ContactMessages.SingleAsync()).IsRead);
    }

    [Fact]
    public async Task Marking_or_deleting_an_unknown_message_says_so()
    {
        Assert.Equal(404, StatusOf(await controller.MarkRead(123)));
        Assert.Equal(404, StatusOf(await controller.Delete(123)));
    }

    [Fact]
    public async Task A_message_can_be_deleted()
    {
        await controller.Submit(Message());
        var id = (await uni.Db.ContactMessages.SingleAsync()).Id;

        Assert.Equal(204, StatusOf(await controller.Delete(id)));
        Assert.Equal(0, await uni.Db.ContactMessages.CountAsync());
    }
}
