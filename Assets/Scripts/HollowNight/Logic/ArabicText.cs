using System;
using System.Collections.Generic;
using System.Text;

namespace HollowNight.Logic
{
    /// <summary>
    /// Arabic for UnityEngine.UI.Text, which draws characters one by one, left to right:
    /// letters are first given their joined shapes (Unicode presentation forms), then each
    /// wrapped line is put in visual order. Marks (shadda, tanween...) stay after their
    /// letter, brackets are mirrored, and runs of Latin letters and digits keep their order.
    /// Covers the letters of standard Arabic; anything else passes through unchanged.
    /// </summary>
    public static class ArabicText
    {
        // Letter -> first presentation form (isolated); dual-joining letters have four
        // consecutive forms (isolated, final, initial, medial), right-joining ones two.
        struct Forms
        {
            public char Isolated;
            public bool Dual;
            public Forms(int isolated, bool dual)
            {
                Isolated = (char)isolated;
                Dual = dual;
            }
        }

        static readonly Dictionary<char, Forms> forms = new Dictionary<char, Forms>
        {
            { '\u0622', new Forms(0xFE81, false) }, { '\u0623', new Forms(0xFE83, false) },
            { '\u0624', new Forms(0xFE85, false) }, { '\u0625', new Forms(0xFE87, false) },
            { '\u0626', new Forms(0xFE89, true) }, { '\u0627', new Forms(0xFE8D, false) },
            { '\u0628', new Forms(0xFE8F, true) }, { '\u0629', new Forms(0xFE93, false) },
            { '\u062A', new Forms(0xFE95, true) }, { '\u062B', new Forms(0xFE99, true) },
            { '\u062C', new Forms(0xFE9D, true) }, { '\u062D', new Forms(0xFEA1, true) },
            { '\u062E', new Forms(0xFEA5, true) }, { '\u062F', new Forms(0xFEA9, false) },
            { '\u0630', new Forms(0xFEAB, false) }, { '\u0631', new Forms(0xFEAD, false) },
            { '\u0632', new Forms(0xFEAF, false) }, { '\u0633', new Forms(0xFEB1, true) },
            { '\u0634', new Forms(0xFEB5, true) }, { '\u0635', new Forms(0xFEB9, true) },
            { '\u0636', new Forms(0xFEBD, true) }, { '\u0637', new Forms(0xFEC1, true) },
            { '\u0638', new Forms(0xFEC5, true) }, { '\u0639', new Forms(0xFEC9, true) },
            { '\u063A', new Forms(0xFECD, true) }, { '\u0641', new Forms(0xFED1, true) },
            { '\u0642', new Forms(0xFED5, true) }, { '\u0643', new Forms(0xFED9, true) },
            { '\u0644', new Forms(0xFEDD, true) }, { '\u0645', new Forms(0xFEE1, true) },
            { '\u0646', new Forms(0xFEE5, true) }, { '\u0647', new Forms(0xFEE9, true) },
            { '\u0648', new Forms(0xFEED, false) }, { '\u0649', new Forms(0xFEEF, false) },
            { '\u064A', new Forms(0xFEF1, true) },
        };

        const char Hamza = '\u0621';
        const char Lam = '\u0644';
        const char Tatweel = '\u0640';

        // Alef after lam -> isolated form of the lam-alef ligature (+1 for the final form).
        static readonly Dictionary<char, char> lamAlef = new Dictionary<char, char>
        {
            { '\u0622', '\uFEF5' }, { '\u0623', '\uFEF7' }, { '\u0625', '\uFEF9' }, { '\u0627', '\uFEFB' },
        };

        static readonly Dictionary<char, char> mirror = new Dictionary<char, char>
        {
            { '(', ')' }, { ')', '(' }, { '[', ']' }, { ']', '[' }, { '{', '}' }, { '}', '{' },
            { '<', '>' }, { '>', '<' }, { '\u00AB', '\u00BB' }, { '\u00BB', '\u00AB' },
        };

        static bool IsMark(char c)
        {
            return (c >= '\u064B' && c <= '\u065F') || c == '\u0670';
        }

        static bool JoinsForward(char c)
        {
            Forms f;
            return c == Tatweel || (forms.TryGetValue(c, out f) && f.Dual);
        }

        static bool JoinsBackward(char c)
        {
            return c == Tatweel || forms.ContainsKey(c);
        }

        static char Neighbour(string s, int from, int step)
        {
            for (int i = from; i >= 0 && i < s.Length; i += step)
                if (!IsMark(s[i])) return s[i];
            return '\0';
        }

        /// <summary>Joined letter shapes, still in logical (reading) order.</summary>
        public static string Shape(string text)
        {
            var sb = new StringBuilder(text.Length);
            for (int i = 0; i < text.Length; i++)
            {
                char c = text[i];
                Forms f;
                if (!forms.TryGetValue(c, out f))
                {
                    // The lone hamza never joins; it only has an isolated form.
                    sb.Append(c == Hamza ? '\uFE80' : c);
                    continue;
                }
                bool joinPrev = JoinsForward(Neighbour(text, i - 1, -1));
                char ligature;
                if (c == Lam && i + 1 < text.Length && lamAlef.TryGetValue(text[i + 1], out ligature))
                {
                    sb.Append((char)(ligature + (joinPrev ? 1 : 0)));
                    i++;
                    continue;
                }
                bool joinNext = f.Dual && JoinsBackward(Neighbour(text, i + 1, 1));
                int form = joinPrev && joinNext ? 3 : joinNext ? 2 : joinPrev ? 1 : 0;
                sb.Append((char)(f.Isolated + form));
            }
            return sb.ToString();
        }

        static bool IsLeftToRight(char c)
        {
            return c < 0x0590 && char.IsLetterOrDigit(c);
        }

        static bool IsRightToLeft(char c)
        {
            return (c >= '\u0590' && c <= '\u08FF') || (c >= '\uFB50' && c <= '\uFDFF') || (c >= '\uFE70' && c <= '\uFEFF');
        }

        /// <summary>One line (already shaped) in the order UI Text draws it, left to right.</summary>
        public static string Visual(string line)
        {
            // Units in logical order: a run of Latin letters and digits (with the neutral
            // characters between them), or one character with the marks that follow it.
            var units = new List<string>();
            int i = 0;
            while (i < line.Length)
            {
                if (IsLeftToRight(line[i]))
                {
                    int end = i, j = i + 1;
                    while (j < line.Length && !IsRightToLeft(line[j]))
                    {
                        if (IsLeftToRight(line[j])) end = j;
                        j++;
                    }
                    units.Add(line.Substring(i, end - i + 1));
                    i = end + 1;
                    continue;
                }
                int k = i + 1;
                while (k < line.Length && IsMark(line[k])) k++;
                char m;
                string unit = line.Substring(i, k - i);
                units.Add(k == i + 1 && mirror.TryGetValue(line[i], out m) ? m.ToString() : unit);
                i = k;
            }
            units.Reverse();
            return string.Concat(units);
        }

        /// <summary>Breaks text into lines no wider than maxWidth, at spaces and explicit breaks.</summary>
        public static List<string> Wrap(string text, Func<string, float> measure, float maxWidth)
        {
            var lines = new List<string>();
            foreach (string paragraph in text.Split('\n'))
            {
                string line = "";
                foreach (string word in paragraph.Split(' '))
                {
                    string candidate = line.Length == 0 ? word : line + " " + word;
                    if (line.Length > 0 && measure(candidate) > maxWidth)
                    {
                        lines.Add(line);
                        line = word;
                    }
                    else line = candidate;
                }
                lines.Add(line);
            }
            return lines;
        }

        /// <summary>
        /// Arabic ready for UI Text: shaped, wrapped to maxWidth and put in visual order line
        /// by line. `reveal` shows only the first that many shaped characters (the
        /// typewriter), so the text grows from the right without lines jumping.
        /// </summary>
        public static string Layout(string text, Func<string, float> measure, float maxWidth, int reveal = int.MaxValue)
        {
            List<string> lines = Wrap(Shape(text), measure, maxWidth);
            var visual = new List<string>(lines.Count);
            int left = reveal;
            foreach (string line in lines)
            {
                int shown = Math.Max(0, Math.Min(line.Length, left));
                visual.Add(Visual(line.Substring(0, shown)));
                left -= line.Length + 1;
            }
            return string.Join("\n", visual.ToArray());
        }
    }
}
