using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Controllers;
using SterlingGrove.Api.Models;
using static SterlingGrove.Api.Tests.TestUniversity;

namespace SterlingGrove.Api.Tests;

public class EventTests : IDisposable
{
    private readonly TestUniversity uni = new();
    private readonly EventsController controller;

    public EventTests() => controller = new EventsController(uni.Db);

    public void Dispose() => uni.Dispose();

    [Fact]
    public async Task Upcoming_is_soonest_first_and_leaves_out_finished_events()
    {
        await uni.AddEventAsync("Finished", -5, -3);
        await uni.AddEventAsync("Next week", 168);
        await uni.AddEventAsync("Tomorrow", 24);

        var upcoming = await controller.List(upcoming: true);

        Assert.Equal(["Tomorrow", "Next week"], upcoming.Select(e => e.Title));
    }

    [Fact]
    public async Task An_event_still_running_counts_as_upcoming()
    {
        await uni.AddEventAsync("Running now", -1, 2);

        Assert.Equal("Running now", (await controller.List(upcoming: true)).Single().Title);
    }

    [Fact]
    public async Task The_full_list_is_newest_first_and_take_limits_it()
    {
        await uni.AddEventAsync("Past", -48, -47);
        await uni.AddEventAsync("Future", 48);

        Assert.Equal(["Future", "Past"], (await controller.List()).Select(e => e.Title));
        Assert.Equal(["Future"], (await controller.List(take: 1)).Select(e => e.Title));
    }

    [Fact]
    public async Task An_event_cannot_end_before_it_starts()
    {
        var start = new DateTime(2027, 3, 1, 14, 0, 0);
        var bad = new CampusEvent { Title = "Backwards", StartsAt = start, EndsAt = start.AddHours(-1) };
        var existing = await uni.AddEventAsync("Existing", 24);

        Assert.Equal(400, StatusOf(await controller.Create(bad)));
        Assert.Equal(400, StatusOf(await controller.Update(existing.Id, bad)));
        Assert.Equal(1, await uni.Db.Events.CountAsync());
    }

    [Fact]
    public async Task An_end_time_is_optional()
    {
        var result = await controller.Create(new CampusEvent { Title = "Open ended", StartsAt = new DateTime(2027, 3, 1, 14, 0, 0) });

        Assert.Equal(201, StatusOf(result));
    }

    [Fact]
    public async Task Times_are_kept_exactly_as_typed()
    {
        var typed = new DateTime(2027, 3, 1, 14, 30, 0);

        await controller.Create(new CampusEvent { Title = "Lecture", StartsAt = typed });
        uni.Forget();

        Assert.Equal(typed, (await uni.Db.Events.SingleAsync()).StartsAt);
    }

    [Fact]
    public async Task Update_and_delete_report_unknown_events()
    {
        Assert.Equal(404, StatusOf(await controller.Update(123, new CampusEvent { Title = "Nope" })));
        Assert.Equal(404, StatusOf(await controller.Delete(123)));
    }
}
