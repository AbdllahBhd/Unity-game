using System.Collections.Generic;

namespace HollowNight.Logic
{
    /// <summary>What was broken in a stage. A sleeper is a <see cref="Pot"/> that never moves.</summary>
    public enum Breakable { Pot, RollingJar, TrapJar }

    /// <summary>
    /// When the exit opens: <see cref="Always"/> from the start (stages 1-3), <see cref="Trap"/>
    /// once every Teryel in the stage is trapped (stage 4).
    /// </summary>
    public enum DoorMode { Always, Trap }

    /// <summary>The scoring and door rules of the tales (SPEC.md §3). There is no par.</summary>
    public static class Rules
    {
        public const int MaxStars = 3;

        /// <summary>The trap jar is a tool, not a hunter; everything else broken is a star.</summary>
        public static bool CountsAsStar(Breakable broken)
        {
            return broken != Breakable.TrapJar;
        }

        public static int Stars(IEnumerable<Breakable> broken)
        {
            int stars = 0;
            foreach (Breakable b in broken)
            {
                if (CountsAsStar(b)) stars++;
            }
            return stars < MaxStars ? stars : MaxStars;
        }

        public static bool DoorOpen(DoorMode mode, int teryelsFree)
        {
            return mode == DoorMode.Always || teryelsFree == 0;
        }
    }
}
