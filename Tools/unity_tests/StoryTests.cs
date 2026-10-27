// The order of the story screens (Tools/design/original/story.js and openStage/nextStage in
// app.js), and every text id the game's code uses existing in the four languages.
using System.Collections.Generic;
using System.Linq;
using HollowNight.Logic;

public static class StoryTests
{
    static readonly Lang[] Langs = { Lang.Tq, Lang.Fr, Lang.Ar, Lang.En };

    static string Chain(IEnumerable<string> ids)
    {
        return string.Join(" ", ids);
    }

    static System.Func<string, bool> Seen(params string[] ids)
    {
        return id => ids.Contains(id);
    }

    [Test]
    static void TheFirstStageOpensTheHearthNamesMqidecAndStartsNightOne()
    {
        Check.Equal("opening first_night night_1 stage_1", Chain(TalesStory.BeforeStage(1, Seen())), "first time");
    }

    [Test]
    static void TheNamingIsOnlyOnTheFirstNight()
    {
        // Night 1 replayed from a fresh night (its intro unseen) after the naming was seen.
        Check.Equal("opening night_1 stage_1", Chain(TalesStory.BeforeStage(1, Seen("first_night"))), "naming seen");
    }

    [Test]
    static void LaterStagesShowOnlyTheirOwnLinesOnce()
    {
        Check.Equal("stage_2", Chain(TalesStory.BeforeStage(2, Seen("first_night", "night_1"))), "stage 2");
        Check.Equal("", Chain(TalesStory.BeforeStage(2, Seen("first_night", "night_1", "stage_2"))), "seen");
    }

    [Test]
    static void TheLastStageOfANightEndsTheTaleThenClosesTheHearth()
    {
        Check.Equal("end_1 closing", Chain(TalesStory.AfterStage(4, Seen())), "after stage 4");
        Check.Equal("", Chain(TalesStory.AfterStage(3, Seen())), "after stage 3");
        Check.Equal("", Chain(TalesStory.AfterStage(4, Seen("end_1"))), "end seen");
    }

    [Test]
    static void TheTrapBeatLandsWithAThud()
    {
        // story.js: beat("kitchen-trap", [...], "thud"); the other beats have no effect.
        Beat[] end = TalesStory.Get("end_1");
        Check.Equal("thud", end[0].Fx, "the jar falls on Teryel");
        Check.Equal("", end[1].Fx, "back at the hearth");
        Check.Equal("", TalesStory.Get("stage_1")[0].Fx, "a stage's lines");
    }

    [Test]
    static void NightOneHasFourStages()
    {
        Check.Equal(4, TalesStory.Stages, "stages");
        for (int stage = 1; stage <= TalesStory.Stages; stage++)
            Check.Equal(1, TalesStory.NightOf(stage), "night of stage " + stage);
    }

    [Test]
    static void EveryStoryLineExistsInFourLanguagesWithAKnownSpeaker()
    {
        string[] speakers = { "", "jida", "girl", "boy", "children", "teryel" };
        int lines = 0;
        foreach (string id in TalesStory.Ids)
        {
            foreach (Beat beat in TalesStory.Get(id))
            {
                Check.True(beat.Scene.Length > 0, id + " has a beat without a scene");
                foreach (string line in beat.Lines)
                {
                    Check.True(TalesText.Has(line), id + ": no text " + line);
                    foreach (Lang lang in Langs) Check.True(TalesText.Get(line, lang).Length > 0, line + " in " + lang);
                    string who = TalesText.Line(line).Who;
                    Check.True(speakers.Contains(who), line + ": unknown speaker " + who);
                    if (who.Length > 0) Check.True(TalesText.Has("who." + who), "no name for " + who);
                    lines++;
                }
            }
        }
        Check.True(lines >= 29, "only " + lines + " story lines");
    }

    [Test]
    static void EveryStageAndNightHasAName()
    {
        for (int stage = 1; stage <= TalesStory.Stages; stage++)
            foreach (Lang lang in Langs) Check.True(TalesText.Get("stage." + stage, lang).Length > 0, "stage." + stage);
        foreach (Lang lang in Langs) Check.True(TalesText.Get("tale.1", lang).Length > 0, "tale.1");
    }

    [Test]
    static void EveryTextIdInTheGameCodeExistsInFourLanguages()
    {
        // UsedIds is written by Tools/unity_check.sh from the string literals in Assets/**/*.cs.
        Check.True(UsedIds.All.Length >= 20, "only " + UsedIds.All.Length + " ids found in the code");
        foreach (string id in UsedIds.All)
        {
            Check.True(TalesText.Has(id), "the code uses " + id + ", which is not in the text table");
            foreach (Lang lang in Langs) Check.True(TalesText.Get(id, lang).Length > 0, id + " has no " + lang + " text");
        }
    }
}
