using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>
    /// Runs one stage: builds the level, reads the drag-to-launch input, tracks the score
    /// and shows the pause and result panels.
    /// </summary>
    public class StageController : MonoBehaviour
    {
        const float MaxDrag = 4f;
        const float MinDrag = 0.45f;

        public static StageController I { get; private set; }

        public Hero Hero { get; private set; }
        public LevelData Level { get; private set; }

        Camera cam;
        CameraRig rig;
        Trajectory trajectory;
        LevelBuilder builder;
        StageHud hud;

        int launches;
        int smashed;
        int huntersLeft;
        bool keyNeeded;
        bool keyFound;
        bool ended;
        bool paused;

        bool pressing;
        bool aiming;
        Vector2 pressScreen;
        Vector2 aimVelocity;
        GameObject finger;

        public int Launches { get { return launches; } }
        public int Smashed { get { return smashed; } }
        public bool Ended { get { return ended; } }

        void Awake()
        {
            I = this;
        }

        void OnDestroy()
        {
            if (I == this) I = null;
            Time.timeScale = 1f;
        }

        void Start()
        {
            Sfx.StartMusic();
            Level = LevelLibrary.Get(Flow.Level);
            cam = GameBoot.EnsureCamera();

            GameObject world = new GameObject("Level " + Level.id);
            builder = new LevelBuilder(Level, world.transform);
            builder.Build();
            huntersLeft = builder.Hunters;
            keyNeeded = Level.Count(Kind.Key) > 0;

            GameObject heroObject = new GameObject("Hero");
            Hero = heroObject.AddComponent<Hero>();
            Hero.Setup(Heroes.Get(Level.hero), Level.start + Vector2.up * 0.3f);

            GameObject dots = new GameObject("Trajectory");
            trajectory = dots.AddComponent<Trajectory>();
            trajectory.Setup();

            rig = cam.gameObject.GetComponent<CameraRig>();
            if (rig == null) rig = cam.gameObject.AddComponent<CameraRig>();
            rig.Setup(cam, Hero.transform, Level.height, Story.ChapterBackdrops[Mathf.Clamp(Level.chapter, 0, 2)]);

            hud = gameObject.AddComponent<StageHud>();
            hud.Build(this, builder.Hunters, builder.Boss != null);
            hud.SetHero(Hero.Def);
            Refresh();

            if (Level.showFinger) StartCoroutine(FingerTutorial());
        }

        // ------------------------------------------------------------------ input
        void Update()
        {
            if (ended) return;
            if (Input.GetKeyDown(KeyCode.Escape)) TogglePause();
            if (Input.GetKeyDown(KeyCode.R)) Restart();
            if (paused) return;

            if (Input.GetMouseButtonDown(0))
            {
                if (UIKit.PointerOverUI()) return;
                pressing = true;
                aiming = false;
                pressScreen = Input.mousePosition;
                if (!Hero.CanLaunch) Hero.AbilityPress();
            }

            if (!pressing) return;

            if (Input.GetMouseButton(0) && Hero.CanLaunch)
            {
                float unitsPerPixel = cam.orthographicSize * 2f / Mathf.Max(1, Screen.height);
                Vector2 drag = (pressScreen - (Vector2)Input.mousePosition) * unitsPerPixel;
                if (drag.magnitude >= MinDrag)
                {
                    aiming = true;
                    aimVelocity = Hero.LaunchVelocity(drag, MaxDrag);
                    float gravity = Mathf.Abs(Physics2D.gravity.y) * Hero.Body.gravityScale;
                    trajectory.Show(Hero.Position, aimVelocity, gravity, Hero.Def.color, Heroes.Radius);
                    Hero.SetAim(Mathf.Clamp01(drag.magnitude / MaxDrag));
                    rig.Focus(Mathf.Clamp(aimVelocity.y * 0.22f, -3f, 4f));
                }
                else
                {
                    CancelAim();
                }
            }

            if (Input.GetMouseButtonUp(0))
            {
                pressing = false;
                if (aiming && Hero.CanLaunch)
                {
                    Vector2 velocity = aimVelocity;
                    CancelAim();
                    launches++;
                    Hero.Launch(velocity);
                    hud.HideHint();
                    Refresh();
                }
                else
                {
                    CancelAim();
                    Hero.AbilityRelease();
                }
            }
        }

        void CancelAim()
        {
            aiming = false;
            trajectory.Hide();
            rig.Focus(0f);
            if (Hero != null) Hero.SetAim(0f);
        }

        IEnumerator FingerTutorial()
        {
            finger = new GameObject("FingerTutorial");
            SpriteRenderer hand = Art.Make("finger", finger.transform, Vector3.zero, 1.3f, Layer.Trajectory + 1, "Finger");
            while (launches == 0 && !ended)
            {
                hand.enabled = Hero.CanLaunch && !aiming && !paused;
                float t = Mathf.Repeat(Time.time, 1.8f) / 1.8f;
                Vector2 from = Hero.Position + new Vector2(0.4f, -1.2f);
                Vector2 to = from + new Vector2(-2.2f, -2.2f);
                hand.transform.position = Vector2.Lerp(from, to, Ease.InOut(Mathf.Clamp01(t * 1.4f)));
                Color c = Color.white;
                c.a = t > 0.8f ? 1f - (t - 0.8f) / 0.2f : 1f;
                hand.color = c;
                yield return null;
            }
            Destroy(finger);
        }

        // ------------------------------------------------------------------ events
        public void HeroDied()
        {
            // A fall costs one launch.
            launches++;
            pressing = false;
            CancelAim();
            Refresh();
        }

        public void KeyCollected()
        {
            keyFound = true;
            Sfx.Play(Sound.Key);
            CheckDoor();
        }

        public void HunterSmashed()
        {
            smashed++;
            huntersLeft = Mathf.Max(0, huntersLeft - 1);
            Refresh();
            CheckDoor();
        }

        void CheckDoor()
        {
            if (builder.Door == null) return;
            if (keyNeeded && !keyFound) return;
            if (huntersLeft > 0) return;
            builder.Door.Open();
        }

        public void BossHit(int health, int max)
        {
            hud.SetBoss(health, max);
        }

        public void BossDefeated(Vector2 position)
        {
            GameObject go = new GameObject("MoonLantern");
            go.transform.position = new Vector3(position.x, Mathf.Max(position.y, 3f), 0f);
            SpriteRenderer glow = Art.Make("glow", go.transform, Vector3.zero, 5f, Layer.Item - 1, "Glow");
            glow.color = new Color(1f, 0.9f, 0.5f, 0.6f);
            glow.gameObject.AddComponent<Pulse>().amount = 0.12f;
            Art.Make("lantern_lit", go.transform, Vector3.zero, 1.8f, Layer.Item, "Sprite");
            CircleCollider2D circle = go.AddComponent<CircleCollider2D>();
            circle.radius = 0.9f;
            circle.isTrigger = true;
            go.AddComponent<LanternGoal>().floorY = 1.2f;
            Sfx.Play(Sound.Unlock);
            hud.ShowHint("The Moon Lantern! Grab it!");
        }

        public void Shake(float amount, float duration)
        {
            if (rig != null) rig.Shake(amount, duration);
        }

        public void Win(Vector2 goal)
        {
            if (ended) return;
            ended = true;
            pressing = false;
            CancelAim();
            Hero.Win(goal);

            int stars = 1;
            if (smashed >= builder.Hunters) stars++;
            if (launches <= Level.par) stars++;
            Progress.Complete(Level.id, stars, launches);
            Sfx.Play(Sound.Win);
            Fx.Burst(goal, "spark", 18, new Color(1f, 0.9f, 0.5f), 7f, 0.9f, 0.45f, 3f);
            StartCoroutine(ShowResult(stars));
        }

        IEnumerator ShowResult(int stars)
        {
            yield return new WaitForSeconds(1f);
            hud.ShowResult(Level, stars, launches, smashed, builder.Hunters);
        }

        void Refresh()
        {
            if (hud == null) return;
            hud.SetScore(launches, Level.par, smashed, builder.Hunters);
            if (huntersLeft > 0) hud.SetGoal("Pumpkins left: " + huntersLeft);
            else if (keyNeeded && !keyFound) hud.SetGoal("Find the key!");
            else hud.SetGoal("");
        }

        // ------------------------------------------------------------------ buttons
        public void TogglePause()
        {
            if (ended) return;
            paused = !paused;
            Time.timeScale = paused ? 0f : 1f;
            pressing = false;
            CancelAim();
            hud.ShowPause(paused);
        }

        public void Restart()
        {
            Time.timeScale = 1f;
            Flow.Go(Flow.Stage);
        }

        public void ToMap()
        {
            Time.timeScale = 1f;
            if (ended) Flow.LeaveLevel(Level.id, false);
            else Flow.Go(Flow.Map);
        }

        public void NextLevel()
        {
            Time.timeScale = 1f;
            Flow.LeaveLevel(Level.id, true);
        }
    }
}
