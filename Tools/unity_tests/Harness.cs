// A minimal test runner for plain C# tests of the Logic assembly (no NUnit outside
// Unity). Every static method marked [Test] runs; the exit code is the failure count.
using System;
using System.Linq;
using System.Reflection;

[AttributeUsage(AttributeTargets.Method)]
public sealed class TestAttribute : Attribute { }

public sealed class AssertionFailed : Exception
{
    public AssertionFailed(string message) : base(message) { }
}

public static class Check
{
    public static void True(bool condition, string message)
    {
        if (!condition) throw new AssertionFailed(message);
    }

    public static void Equal<T>(T expected, T actual, string what = "")
    {
        if (!Equals(expected, actual))
            throw new AssertionFailed((what.Length > 0 ? what + ": " : "") + "expected <" + expected + "> but got <" + actual + ">");
    }
}

public static class TestRunner
{
    public static int Main()
    {
        var tests = typeof(TestRunner).Assembly.GetTypes()
            .SelectMany(t => t.GetMethods(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic))
            .Where(m => m.GetCustomAttribute<TestAttribute>() != null)
            .OrderBy(m => m.DeclaringType.Name).ThenBy(m => m.Name)
            .ToList();
        int failed = 0;
        foreach (var m in tests)
        {
            try
            {
                m.Invoke(null, null);
                Console.WriteLine("ok   " + m.DeclaringType.Name + "." + m.Name);
            }
            catch (TargetInvocationException e)
            {
                failed++;
                Console.WriteLine("FAIL " + m.DeclaringType.Name + "." + m.Name + ": " + e.InnerException.Message);
            }
        }
        Console.WriteLine(tests.Count - failed + "/" + tests.Count + " tests passed");
        return failed;
    }
}
