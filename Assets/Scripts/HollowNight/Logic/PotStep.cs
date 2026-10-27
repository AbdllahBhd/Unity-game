using System;

namespace HollowNight.Logic
{
    public enum PotState { Idle, Notice, Hunt, Return }

    /// <summary>
    /// A lively hunter (Teryel's pot): it sleeps at home, notices the hero inside its range,
    /// hunts with growing speed and a lunge when close, and floats home when the hero gets
    /// away or after a death. Ported from livelyPumpkin in Tools/design/prototype/game.js;
    /// the Hunter MonoBehaviour applies X and Y with MovePosition.
    /// </summary>
    public sealed class Pot
    {
        public const float NoticeTime = 0.35f;
        public const float HuntFactor = 1.6f;
        public const float LungeDistance = 1.6f;
        public const float Lunge = 1.8f;
        public const float GiveUpFactor = 1.4f;
        const float Steering = 3f;

        public readonly float HomeX, HomeY;
        /// <summary>0 makes a sleeper: it never notices anyone.</summary>
        public readonly float Range;
        public readonly float Speed;

        public float X, Y, Vx, Vy;
        public PotState State;
        /// <summary>True from a death until the next launch: the pot goes home and ignores the hero.</summary>
        public bool Safe;
        float noticeLeft;

        public Pot(float x, float y, float range, float speed)
        {
            HomeX = X = x;
            HomeY = Y = y;
            Range = range;
            Speed = speed;
        }

        /// <summary>After a death: back home at once, safe until the next launch.</summary>
        public void SendHome()
        {
            X = HomeX;
            Y = HomeY;
            Vx = Vy = 0f;
            Safe = true;
            State = PotState.Return;
        }

        /// <summary>
        /// Advances by dt toward or away from the target (the hero). While paused (the player
        /// is aiming) it can still notice, but nothing moves and no timer runs.
        /// Returns true on the step it notices the hero.
        /// </summary>
        public bool Step(float targetX, float targetY, float dt, bool paused)
        {
            float d = Distance(X, Y, targetX, targetY);
            bool noticed = false;
            if (Safe && State != PotState.Return && State != PotState.Idle) State = PotState.Return;
            if (State == PotState.Idle && !Safe && d < Range)
            {
                State = PotState.Notice;
                noticeLeft = NoticeTime;
                noticed = true;
            }
            if (paused) return noticed;
            if (State == PotState.Notice)
            {
                noticeLeft -= dt;
                if (noticeLeft <= 0f) State = PotState.Hunt;
                return noticed;
            }

            float wantX = 0f, wantY = 0f;
            if (State == PotState.Hunt)
            {
                if (d > Range * GiveUpFactor) State = PotState.Return;
                else if (d > 0.001f)
                {
                    float top = Speed * HuntFactor * (d < LungeDistance ? Lunge : 1f);
                    wantX = (targetX - X) / d * top;
                    wantY = (targetY - Y) / d * top;
                }
            }
            if (State == PotState.Return)
            {
                float dh = Distance(X, Y, HomeX, HomeY);
                if (dh < 0.08f)
                {
                    X = HomeX;
                    Y = HomeY;
                    Vx = Vy = 0f;
                    State = PotState.Idle;
                    return noticed;
                }
                float top = Math.Min(Speed * 0.9f + 0.3f, dh * 2f);
                wantX = (HomeX - X) / dh * top;
                wantY = (HomeY - Y) / dh * top;
            }
            if (State == PotState.Idle) return noticed;

            float k = Math.Min(1f, Steering * dt);
            Vx += (wantX - Vx) * k;
            Vy += (wantY - Vy) * k;
            X += Vx * dt;
            Y += Vy * dt;
            return noticed;
        }

        static float Distance(float ax, float ay, float bx, float by)
        {
            float dx = bx - ax, dy = by - ay;
            return (float)Math.Sqrt(dx * dx + dy * dy);
        }
    }
}
