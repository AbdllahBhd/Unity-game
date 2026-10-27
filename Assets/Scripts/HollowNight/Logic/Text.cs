using System.Collections.Generic;

namespace HollowNight.Logic
{
    /// <summary>The four languages of the tales. Order matches the language selector.</summary>
    public enum Lang { Tq, Fr, Ar, En }

    public sealed class TaleLine
    {
        /// <summary>jida, girl, boy, children, teryel, or "" for narration and interface text.</summary>
        public readonly string Who;
        /// <summary>telling, teasing, hushed, or "".</summary>
        public readonly string Mood;
        readonly string[] text;

        public TaleLine(string who, string mood, string tq, string fr, string ar, string en)
        {
            Who = who;
            Mood = mood;
            text = new[] { tq, fr, ar, en };
        }

        public string In(Lang lang)
        {
            return text[(int)lang];
        }
    }

    /// <summary>
    /// Every line of the tales and their interface in four languages. The data half of this
    /// class (TalesText.cs) is generated from Tools/design/yennayer-script.md by
    /// Tools/design/original/build-text.py.
    /// </summary>
    public static partial class TalesText
    {
        static readonly Dictionary<string, TaleLine> lines = new Dictionary<string, TaleLine>();

        static TalesText()
        {
            Fill();
        }

        static void Add(string id, string who, string mood, string en, string tq, string fr, string ar)
        {
            lines.Add(id, new TaleLine(who, mood, tq, fr, ar, en));
        }

        public static IEnumerable<string> Ids
        {
            get { return lines.Keys; }
        }

        public static bool Has(string id)
        {
            return lines.ContainsKey(id);
        }

        public static TaleLine Line(string id)
        {
            TaleLine line;
            if (!lines.TryGetValue(id, out line)) throw new KeyNotFoundException("No tale text with id '" + id + "'");
            return line;
        }

        public static string Get(string id, Lang lang)
        {
            return Line(id).In(lang);
        }

        /// <summary>Fills a placeholder such as {n}.</summary>
        public static string Format(string text, string name, string value)
        {
            return text.Replace("{" + name + "}", value);
        }
    }
}
