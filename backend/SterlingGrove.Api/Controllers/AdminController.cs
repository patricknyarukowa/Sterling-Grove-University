using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Data;

namespace SterlingGrove.Api.Controllers;

[ApiController]
[Route("api")]
public class AdminController(AppDbContext db) : ControllerBase
{
    // GET /api/auth/me — who is logged in? The Angular app calls this after login.
    [HttpGet("auth/me"), Authorize]
    public object Me() => new
    {
        email = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name,
        roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList()
    };

    // GET /api/admin/stats — counts for the admin dashboard cards
    [HttpGet("admin/stats"), Authorize(Roles = Roles.Admin)]
    public async Task<object> Stats() => new
    {
        faculties = await db.Faculties.CountAsync(),
        programmes = await db.Programmes.CountAsync(),
        news = await db.NewsArticles.CountAsync(),
        upcomingEvents = await db.Events.CountAsync(e => (e.EndsAt ?? e.StartsAt) >= DateTime.UtcNow),
        unreadMessages = await db.ContactMessages.CountAsync(m => !m.IsRead)
    };
}
