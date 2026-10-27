// The lively pot's state step (SPEC.md §3, "Pots"), ported from the browser prototype.
using System;
using HollowNight.Logic;

public static class PotStepTests
{
    const float Dt = 0.02f;

    static Pot At(float x, float y, float range = 3f, float speed = 1f)
    {
        return new Pot(x, y, range, speed);
    }

    static void Run(Pot pot, float tx, float ty, float seconds, bool paused = false)
    {
        for (float t = 0f; t < seconds - 1e-4f; t += Dt) pot.Step(tx, ty, Dt, paused);
    }

    static float Dist(Pot pot, float x, float y)
    {
        return (float)Math.Sqrt((pot.X - x) * (pot.X - x) + (pot.Y - y) * (pot.Y - y));
    }

    [Test]
    static void FarFromTheHeroItStaysIdleAtHome()
    {
        Pot pot = At(0f, 5f);
        Run(pot, 0f, 0f, 2f);
        Check.Equal(PotState.Idle, pot.State, "state");
        Check.Equal(0f, pot.X, "x");
        Check.Equal(5f, pot.Y, "y");
    }

    [Test]
    static void InRangeItNoticesThenHoldsStillBeforeTheHunt()
    {
        Pot pot = At(0f, 0f);
        Check.True(pot.Step(2f, 0f, Dt, false), "the first step reports the notice");
        Check.Equal(PotState.Notice, pot.State, "state");
        Check.True(!pot.Step(2f, 0f, Dt, false), "a notice is reported once");
        Run(pot, 2f, 0f, Pot.NoticeTime - 2 * Dt - 0.01f);
        Check.Equal(PotState.Notice, pot.State, "still noticing");
        Check.Equal(0f, pot.X, "it does not move while noticing");
        Run(pot, 2f, 0f, 0.04f);
        Check.Equal(PotState.Hunt, pot.State, "hunting after the notice");
    }

    [Test]
    static void HuntingItAcceleratesTowardTheHero()
    {
        Pot pot = At(0f, 0f);
        Run(pot, 2.5f, 0f, Pot.NoticeTime + 0.02f);
        float before = Dist(pot, 2.5f, 0f);
        Run(pot, 2.5f, 0f, 0.3f);
        Check.True(Dist(pot, 2.5f, 0f) < before - 0.05f, "closer: " + Dist(pot, 2.5f, 0f));
        Check.True(pot.Vx > 0f, "moving toward the hero");
    }

    [Test]
    static void CloseToTheHeroItLunges()
    {
        Pot near = At(0f, 0f), far = At(0f, 0f);
        Run(near, 1.2f, 0f, Pot.NoticeTime + 0.02f);
        Run(far, 2.5f, 0f, Pot.NoticeTime + 0.02f);
        near.Vx = near.Vy = far.Vx = far.Vy = 0f;
        near.X = near.Y = far.X = far.Y = 0f;
        near.Step(1.2f, 0f, Dt, false);
        far.Step(2.5f, 0f, Dt, false);
        Check.True(Math.Abs(near.Vx / far.Vx - Pot.Lunge) < 1e-3f, "lunge ratio " + near.Vx / far.Vx);
    }

    [Test]
    static void ItGivesUpAndGoesHome()
    {
        Pot pot = At(0f, 0f);
        Run(pot, 2.5f, 0f, 1.5f);
        Run(pot, 20f, 0f, Dt);
        Check.Equal(PotState.Return, pot.State, "the hero got away");
        Run(pot, 20f, 0f, 6f);
        Check.Equal(PotState.Idle, pot.State, "home again");
        Check.Equal(0f, pot.X, "x");
        Check.Equal(0f, pot.Y, "y");
    }

    [Test]
    static void AfterADeathItIsSafeAndGoesHome()
    {
        Pot pot = At(0f, 0f);
        Run(pot, 2f, 0f, 1f);
        Check.Equal(PotState.Hunt, pot.State, "hunting");
        pot.Safe = true;
        Run(pot, 1f, 0f, Dt);
        Check.Equal(PotState.Return, pot.State, "safe sends it home");
        Run(pot, 1f, 0f, 6f);
        Check.Equal(PotState.Idle, pot.State, "home");
        Check.True(!pot.Step(0.5f, 0f, Dt, false), "a safe pot does not notice");
        Check.Equal(PotState.Idle, pot.State, "still idle");
    }

    [Test]
    static void ADeathSendsItHomeAtOnce()
    {
        // The prototype's die(): every pot is put back home, so none sits on the respawn spot.
        Pot pot = At(0f, 0f);
        Run(pot, 2f, 0f, 1f);
        Check.True(pot.X > 0.1f, "it moved toward the hero");
        pot.SendHome();
        Check.Equal(0f, pot.X, "x");
        Check.Equal(0f, pot.Y, "y");
        Check.Equal(0f, pot.Vx, "vx");
        Check.True(pot.Safe, "safe");
        Run(pot, 0.5f, 0f, 0.5f, true);
        Check.Equal(0f, pot.X, "it stays home while he aims");
    }

    [Test]
    static void WhileThePlayerAimsAHuntingPotIsFrozen()
    {
        Pot pot = At(0f, 0f);
        Run(pot, 2.5f, 0f, Pot.NoticeTime + 0.2f);
        float x = pot.X;
        Run(pot, 2.5f, 0f, 1f, true);
        Check.Equal(x, pot.X, "x while aiming");
        Check.Equal(PotState.Hunt, pot.State, "it resumes the hunt afterwards");
    }

    [Test]
    static void WhileThePlayerAimsTheNoticeTimerWaits()
    {
        Pot pot = At(0f, 0f);
        Check.True(pot.Step(2f, 0f, Dt, true), "it still notices");
        Run(pot, 2f, 0f, 1f, true);
        Check.Equal(PotState.Notice, pot.State, "the notice waits for the aim");
    }

    [Test]
    static void ASleeperNeverMoves()
    {
        Pot pot = At(1f, 1f, 0f, 0f);
        Check.True(!pot.Step(1.1f, 1f, Dt, false), "no notice");
        Run(pot, 1.1f, 1f, 3f);
        Check.Equal(PotState.Idle, pot.State, "state");
        Check.Equal(1f, pot.X, "x");
    }
}
