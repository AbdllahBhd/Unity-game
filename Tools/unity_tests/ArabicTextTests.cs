// Arabic for UnityEngine.UI.Text, which neither joins letters nor lays text right to left.
using System.Collections.Generic;
using System.Linq;
using HollowNight.Logic;

public static class ArabicTextTests
{
    static string Codes(string s)
    {
        return string.Join(" ", s.Select(c => ((int)c).ToString("X4")));
    }

    static void Shaped(string logical, string expectedCodes)
    {
        Check.Equal(expectedCodes, Codes(ArabicText.Shape(logical)), "shape of " + logical);
    }

    [Test]
    static void LoneLetterTakesItsIsolatedForm()
    {
        Shaped("ب", "FE8F");
    }

    [Test]
    static void DualJoiningLettersTakeInitialMedialFinalForms()
    {
        Shaped("بيت", "FE91 FEF4 FE96");
    }

    [Test]
    static void RightJoiningLettersBreakTheWord()
    {
        Shaped("دار", "FEA9 FE8D FEAD");
    }

    [Test]
    static void LamAlefBecomesOneLigature()
    {
        Shaped("لا", "FEFB");
        Shaped("سلام", "FEB3 FEFC FEE1");
        Shaped("لأ", "FEF7");
    }

    [Test]
    static void HamzaNeverJoins()
    {
        Shaped("ماء", "FEE3 FE8E FE80");
    }

    [Test]
    static void MarksAreSkippedWhenJoiningAndKeptAfterTheirLetter()
    {
        Shaped("تحطّمت", "FE97 FEA4 FEC4 0651 FEE4 FE96");
    }

    [Test]
    static void TaMarbutaAndAlefMaksuraTakeFinalForms()
    {
        Shaped("قصة", "FED7 FEBC FE94");
        Shaped("على", "FECB FEE0 FEF0");
    }

    [Test]
    static void NonArabicTextIsUnchangedByShaping()
    {
        Check.Equal("Mqidec 3!", ArabicText.Shape("Mqidec 3!"));
    }

    [Test]
    static void VisualOrderReversesLettersButKeepsMarksOnTheirLetter()
    {
        string shaped = ArabicText.Shape("تحطّ");
        Check.Equal("FEC2 0651 FEA4 FE97", Codes(ArabicText.Visual(shaped)));
    }

    [Test]
    static void VisualOrderMirrorsBracketsAndGuillemets()
    {
        Check.Equal("(" + "ﺏ" + ")", ArabicText.Visual("(" + "ﺏ" + ")"));
        Check.Equal("«" + "ﺏ" + "»", ArabicText.Visual("«" + "ﺏ" + "»"));
    }

    [Test]
    static void VisualOrderKeepsLatinAndDigitRunsReadable()
    {
        Check.Equal("ﺕ Mqidec 12 ﺏ", ArabicText.Visual("ﺏ Mqidec 12 ﺕ"));
        Check.Equal("!Mqidec ﺏ", ArabicText.Visual("ﺏ Mqidec!"));
        Check.Equal("ﺕ 3 ﺏ", ArabicText.Visual("ﺏ 3 ﺕ"));
    }

    [Test]
    static void EveryArabicLineOfTheTalesIsFullyShaped()
    {
        foreach (string id in TalesText.Ids)
        {
            string shaped = ArabicText.Shape(TalesText.Get(id, Lang.Ar));
            char raw = shaped.FirstOrDefault(c => c >= '\u0621' && c <= '\u064A');
            Check.True(raw == '\0', id + " keeps an unshaped letter U+" + ((int)raw).ToString("X4"));
        }
    }

    static float ByLength(string s)
    {
        return s.Length;
    }

    [Test]
    static void WrapBreaksAtSpacesWithinTheWidth()
    {
        List<string> lines = ArabicText.Wrap("ab cd ef", ByLength, 5);
        Check.Equal("ab cd|ef", string.Join("|", lines));
    }

    [Test]
    static void WrapKeepsExplicitBreaksAndPutsALongWordAlone()
    {
        List<string> lines = ArabicText.Wrap("ab\nlongword cd", ByLength, 5);
        Check.Equal("ab|longword|cd", string.Join("|", lines));
    }

    [Test]
    static void LayoutWrapsThenOrdersEachLineRightToLeft()
    {
        // Two two-letter words, one per line at width 3: each line is reversed on its own
        // (initial form first in reading order, so last on the line).
        string laid = ArabicText.Layout("بب تت", ByLength, 3);
        Check.Equal("FE90 FE91\n" + "FE96 FE97", string.Join("\n", laid.Split('\n').Select(Codes)));
    }

    [Test]
    static void LayoutRevealsTheTextFromTheRightOneLetterAtATime()
    {
        // The typewriter: the first shaped letter appears at the right end, with its
        // joined form already settled, and later lines stay empty.
        string laid = ArabicText.Layout("بب تت", ByLength, 3, 1);
        Check.Equal("FE91\n", string.Join("\n", laid.Split('\n').Select(Codes)));
        Check.Equal(5, ArabicText.Shape("بب تت").Length);
    }
}
