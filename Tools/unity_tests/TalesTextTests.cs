// The four-language text table generated from Tools/design/yennayer-script.md.
using System.Linq;
using HollowNight.Logic;

public static class TalesTextTests
{
    [Test]
    static void EveryLineExistsInAllFourLanguages()
    {
        Check.True(TalesText.Ids.Count() >= 255, "only " + TalesText.Ids.Count() + " ids");
        foreach (string id in TalesText.Ids)
            foreach (Lang lang in new[] { Lang.Tq, Lang.Fr, Lang.Ar, Lang.En })
                Check.True(TalesText.Get(id, lang).Length > 0, id + " has no " + lang + " text");
    }

    [Test]
    static void LinesKnowTheirSpeakerAndMood()
    {
        Check.Equal("jida", TalesText.Line("t1.intro.1").Who, "who");
        Check.Equal("Amacahu!", TalesText.Get("open.1", Lang.Tq), "opening");
        Check.Equal("", TalesText.Line("ui.play").Who, "narration has no speaker");
    }

    [Test]
    static void PlaceholdersAreFilledIn()
    {
        Check.Equal("2 broken", TalesText.Format("{n} broken", "n", "2"));
    }

    [Test]
    static void AMissingIdIsReportedNotSilentlyBlank()
    {
        Check.True(!TalesText.Has("no.such.id"), "Has");
        try
        {
            TalesText.Get("no.such.id", Lang.En);
        }
        catch (System.Collections.Generic.KeyNotFoundException e)
        {
            Check.True(e.Message.Contains("no.such.id"), e.Message);
            return;
        }
        throw new AssertionFailed("a missing id did not throw");
    }
}
