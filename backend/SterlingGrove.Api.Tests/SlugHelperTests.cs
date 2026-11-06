using SterlingGrove.Api.Controllers;

namespace SterlingGrove.Api.Tests;

public class SlugHelperTests
{
    [Theory]
    [InlineData("Falcons Win the Regional Cup!", "falcons-win-the-regional-cup")]
    [InlineData("Engineering & Technology", "engineering-technology")]
    [InlineData("  spaces   everywhere  ", "spaces-everywhere")]
    [InlineData("!!!", "")]
    public void Makes_url_friendly_names(string text, string expected) =>
        Assert.Equal(expected, SlugHelper.Create(text));

    [Fact]
    public void Long_titles_are_cut_without_leaving_a_trailing_dash()
    {
        var slug = SlugHelper.Create(new string('a', 179) + " " + new string('b', 50));

        Assert.Equal(new string('a', 179), slug);
    }
}
