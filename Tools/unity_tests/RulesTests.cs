// Stars and door rules of the tales (SPEC.md §3).
using HollowNight.Logic;

public static class RulesTests
{
    [Test]
    static void EachBrokenHunterIsAStarUpToThree()
    {
        Check.Equal(0, Rules.Stars(new Breakable[0]), "none");
        Check.Equal(2, Rules.Stars(new[] { Breakable.Pot, Breakable.Pot }), "two pots");
        Check.Equal(3, Rules.Stars(new[] { Breakable.Pot, Breakable.Pot, Breakable.Pot, Breakable.Pot }), "capped");
    }

    [Test]
    static void ARollingJarCountsAsAHunter()
    {
        // Stage 2: the rolling jar, the sleeper and one pot make the three stars.
        Check.True(Rules.CountsAsStar(Breakable.RollingJar), "rolling jar");
        Check.Equal(3, Rules.Stars(new[] { Breakable.RollingJar, Breakable.Pot, Breakable.Pot }), "stage 2");
    }

    [Test]
    static void TheTrapJarNeverCounts()
    {
        Check.True(!Rules.CountsAsStar(Breakable.TrapJar), "trap jar");
        Check.Equal(0, Rules.Stars(new[] { Breakable.TrapJar, Breakable.TrapJar }), "broken twice");
        Check.Equal(2, Rules.Stars(new[] { Breakable.TrapJar, Breakable.Pot, Breakable.Pot }), "with pots");
    }

    [Test]
    static void AnAlwaysDoorIsOpenFromTheStart()
    {
        Check.True(Rules.DoorOpen(DoorMode.Always, 1), "Teryel free");
        Check.True(Rules.DoorOpen(DoorMode.Always, 0), "no Teryel");
    }

    [Test]
    static void ATrapDoorOpensOnceEveryTeryelIsTrapped()
    {
        Check.True(!Rules.DoorOpen(DoorMode.Trap, 1), "one free");
        Check.True(!Rules.DoorOpen(DoorMode.Trap, 2), "two free");
        Check.True(Rules.DoorOpen(DoorMode.Trap, 0), "all trapped");
    }
}
