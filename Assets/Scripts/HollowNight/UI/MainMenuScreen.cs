using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>Title screen.</summary>
    public class MainMenuScreen : MonoBehaviour
    {
        Image soundIcon;
        RectTransform confirm;

        void Start()
        {
            Sfx.StartMusic();
            Canvas canvas = UIKit.MakeCanvas("MenuCanvas", 10);
            Transform root = canvas.transform;

            UIKit.Backdrop("bg_graveyard", root);

            // Drifting clouds and a few bats give the title screen some life.
            for (int i = 0; i < 3; i++)
            {
                Image cloud = UIKit.Picture("cloud", root, UIKit.Top, new Vector2(-300f + i * 330f, -520f - i * 130f),
                    new Vector2(520f, 260f));
                cloud.color = new Color(1f, 1f, 1f, 0.16f);
                Drift drift = cloud.gameObject.AddComponent<Drift>();
                drift.speed = 18f + i * 9f;
                drift.range = 760f;
            }
            for (int i = 0; i < 2; i++)
            {
                Image bat = UIKit.Picture("bat_0", root, UIKit.Top, new Vector2(-350f + i * 600f, -760f - i * 90f),
                    new Vector2(170f, 110f));
                UIFrames frames = bat.gameObject.AddComponent<UIFrames>();
                frames.frames = new[] { Art.Get("bat_0"), Art.Get("bat_1") };
                Drift drift = bat.gameObject.AddComponent<Drift>();
                drift.speed = 70f + i * 40f;
                drift.range = 760f;
                drift.bob = 30f;
            }

            Text title = UIKit.Label("HOLLOW NIGHT", root, UIKit.Top, new Vector2(0f, -330f), new Vector2(1060f, 260f), 190,
                UIKit.Gold, true);
            title.horizontalOverflow = HorizontalWrapMode.Overflow;
            title.gameObject.AddComponent<Pulse>().amount = 0.02f;
            UIKit.Label("Izan and the Moon Lantern", root, UIKit.Top, new Vector2(0f, -490f), new Vector2(1000f, 90f), 58,
                UIKit.Cream);

            // Heroes standing on a platform.
            Image platform = UIKit.Picture("plat_grave", root, UIKit.Center, new Vector2(0f, -250f), new Vector2(900f, 110f), true);
            platform.rectTransform.SetAsLastSibling();
            string[] cast = { "hoot", "izan", "pip", "webster" };
            HeroType[] types = { HeroType.Hoot, HeroType.Izan, HeroType.Pip, HeroType.Webster };
            for (int i = 0; i < cast.Length; i++)
            {
                bool unlocked = Progress.HeroUnlocked(types[i]);
                Image hero = UIKit.Picture(cast[i] + (unlocked ? "_happy" : "_idle"), root, UIKit.Center,
                    new Vector2(-330f + i * 220f, -90f), new Vector2(230f, 230f));
                // Heroes that have not joined yet are shown as silhouettes.
                hero.color = unlocked ? Color.white : new Color(0.05f, 0.03f, 0.12f, 0.85f);
                Hopper hopper = hero.gameObject.AddComponent<Hopper>();
                hopper.delay = i * 0.35f;
                hopper.active = unlocked;
            }
            Image lantern = UIKit.Picture("lantern_dark", root, UIKit.Center, new Vector2(0f, 190f), new Vector2(150f, 200f));
            lantern.gameObject.AddComponent<Pulse>().amount = 0.03f;

            bool started = Progress.Seen("prologue");
            Button play = UIKit.TextButton("btn_green", started ? "CONTINUE" : "PLAY", root, UIKit.Bottom,
                new Vector2(0f, 560f), new Vector2(560f, 170f), Play, 80);
            play.gameObject.AddComponent<Pulse>().amount = 0.035f;

            UIKit.TextButton("btn_purple", "STORY", root, UIKit.Bottom, new Vector2(0f, 380f), new Vector2(440f, 130f),
                () => Flow.ShowStory("prologue", Flow.Menu), 54);

            Button sound = UIKit.IconButton(Progress.SoundOn ? "ico_sound_on" : "ico_sound_off", root, UIKit.BottomLeft,
                new Vector2(120f, 130f), 150f, ToggleSound);
            soundIcon = sound.GetComponent<Image>();

            UIKit.TextButton("btn_orange", "RESET", root, UIKit.BottomRight, new Vector2(-170f, 130f), new Vector2(260f, 100f),
                () => confirm.gameObject.SetActive(true), 40);

            Text stars = UIKit.Label(Progress.TotalStars + " / " + (Progress.LevelCount * 3), root, UIKit.Bottom,
                new Vector2(40f, 130f), new Vector2(300f, 90f), 54, UIKit.Gold);
            UIKit.Picture("star_full", stars.transform, UIKit.Center, new Vector2(-170f, 6f), new Vector2(90f, 90f));

            BuildConfirm(root);
        }

        void BuildConfirm(Transform root)
        {
            confirm = UIKit.Stretch("Confirm", root);
            UIKit.Fill(confirm, new Color(0f, 0f, 0f, 0.7f), true);
            Image panel = UIKit.Picture("panel", confirm, UIKit.Center, Vector2.zero, new Vector2(860f, 560f), true);
            UIKit.Label("Erase all progress?", panel.transform, UIKit.Center, new Vector2(0f, 120f), new Vector2(760f, 200f),
                64, UIKit.Cream);
            UIKit.TextButton("btn_orange", "ERASE", panel.transform, UIKit.Center, new Vector2(-190f, -120f),
                new Vector2(320f, 130f), () =>
                {
                    Progress.ResetAll();
                    Flow.Go(Flow.Menu);
                }, 50);
            UIKit.TextButton("btn_green", "KEEP", panel.transform, UIKit.Center, new Vector2(190f, -120f),
                new Vector2(320f, 130f), () => confirm.gameObject.SetActive(false), 50);
            confirm.gameObject.SetActive(false);
        }

        void Play()
        {
            if (!Progress.Seen("prologue")) Flow.ShowStory("prologue", Flow.Map);
            else Flow.Go(Flow.Map);
        }

        void ToggleSound()
        {
            Progress.SoundOn = !Progress.SoundOn;
            Sfx.ApplySettings();
            soundIcon.sprite = Art.Get(Progress.SoundOn ? "ico_sound_on" : "ico_sound_off");
        }

        void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                if (confirm != null && confirm.gameObject.activeSelf) confirm.gameObject.SetActive(false);
                else Application.Quit();
            }
        }
    }

    /// <summary>Moves a UI element sideways and wraps it around.</summary>
    public class Drift : MonoBehaviour
    {
        public float speed = 20f;
        public float range = 700f;
        public float bob;
        RectTransform rect;
        float baseY;

        void Start()
        {
            rect = (RectTransform)transform;
            baseY = rect.anchoredPosition.y;
        }

        void Update()
        {
            Vector2 p = rect.anchoredPosition;
            p.x += speed * Time.unscaledDeltaTime;
            if (p.x > range) p.x = -range;
            p.y = baseY + Mathf.Sin(Time.unscaledTime * 3f + baseY) * bob;
            rect.anchoredPosition = p;
        }
    }

    /// <summary>Sprite frame animation for UI images.</summary>
    public class UIFrames : MonoBehaviour
    {
        public Sprite[] frames;
        public float fps = 8f;
        Image image;

        void Start()
        {
            image = GetComponent<Image>();
        }

        void Update()
        {
            if (image == null || frames == null || frames.Length == 0) return;
            image.sprite = frames[(int)(Time.unscaledTime * fps) % frames.Length];
        }
    }

    /// <summary>Makes a UI element hop with squash and stretch.</summary>
    public class Hopper : MonoBehaviour
    {
        public float delay;
        public float height = 70f;
        public float period = 1.6f;
        public bool active = true;
        RectTransform rect;
        Vector2 origin;

        void Start()
        {
            rect = (RectTransform)transform;
            origin = rect.anchoredPosition;
        }

        void Update()
        {
            if (!active) return;
            float t = Mathf.Repeat(Time.unscaledTime - delay, period) / period;
            float air = Mathf.Clamp01(t / 0.6f);
            float y = t < 0.6f ? Mathf.Sin(air * Mathf.PI) * height : 0f;
            // Squash while on the ground, stretch in the air.
            float squash = t < 0.6f ? 1f + Mathf.Sin(air * Mathf.PI) * 0.08f : 1f - Mathf.Sin((t - 0.6f) / 0.4f * Mathf.PI) * 0.1f;
            rect.anchoredPosition = origin + Vector2.up * y;
            rect.localScale = new Vector3(2f - squash, squash, 1f);
        }
    }
}
