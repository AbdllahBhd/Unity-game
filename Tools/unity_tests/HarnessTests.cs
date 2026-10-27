// Proves the runner itself works: a passing check, and a failing one that is caught.
public static class HarnessTests
{
    [Test]
    static void FailedCheckIsReported()
    {
        try
        {
            Check.Equal(1, 2);
        }
        catch (AssertionFailed e)
        {
            Check.True(e.Message.Contains("expected <1> but got <2>"), "message: " + e.Message);
            return;
        }
        throw new AssertionFailed("a failed check did not throw");
    }
}
