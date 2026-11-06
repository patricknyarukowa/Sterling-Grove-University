using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.RateLimiting;
using SterlingGrove.Api.Controllers;

namespace SterlingGrove.Api.Tests;

// Reads the attributes on every controller, so a new endpoint can't quietly be left open.
public class SecurityRulesTests
{
    private static readonly MethodInfo[] Actions = typeof(NewsController).Assembly.GetTypes()
        .Where(t => typeof(ControllerBase).IsAssignableFrom(t))
        .SelectMany(t => t.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly))
        .Where(m => m.GetCustomAttributes<HttpMethodAttribute>().Any())
        .ToArray();

    private static bool IsAdminOnly(MethodInfo action) =>
        action.GetCustomAttributes<AuthorizeAttribute>().Any(a => a.Roles == Roles.Admin);

    private static bool IsRead(MethodInfo action) =>
        action.GetCustomAttributes<HttpMethodAttribute>().All(a => a.HttpMethods.All(m => m == "GET"));

    private static string Name(MethodInfo action) => $"{action.DeclaringType!.Name}.{action.Name}";

    [Fact]
    public void The_controllers_were_found() => Assert.True(Actions.Length > 20);

    [Fact]
    public void Every_write_is_admin_only_except_the_contact_form()
    {
        var open = Actions.Where(a => !IsRead(a) && !IsAdminOnly(a)).Select(Name);

        Assert.Equal(["ContactController.Submit"], open);
    }

    [Fact]
    public void The_contact_form_is_rate_limited()
    {
        var submit = typeof(ContactController).GetMethod(nameof(ContactController.Submit))!;

        Assert.Equal(Policies.Contact, submit.GetCustomAttribute<EnableRateLimitingAttribute>()?.PolicyName);
    }

    [Theory]
    [InlineData(typeof(ContactController), nameof(ContactController.Inbox))]
    [InlineData(typeof(AdminController), nameof(AdminController.Stats))]
    public void Private_reads_are_admin_only(Type controller, string action) =>
        Assert.True(IsAdminOnly(controller.GetMethod(action)!));
}
