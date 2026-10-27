using HollowNight.Logic;
using UnityEngine;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>Title screen: the tales' title, Play, the tales (map), the language and the sound.</summary>
    public class MainMenuScreen : MonoBehaviour
    {
        // Each language is named in itself, so these are not translated.
        static readonly string[] LanguageNames = { "Taqbaylit", "Français", "العربية", "English" };

        Image soundIcon;

        void Start()
        {
            Sfx.StartMusic();
            Canvas canvas = UIKit.MakeCanvas("MenuCanvas", 10);
            Transform root = canvas.transform;

            UIKit.Backdrop("bg_hearth", root);
            UIKit.Fill(root, new Color(0.03f, 0.01f, 0.08f, 0.3f), false);

            Text title = UIKit.Label("", root, UIKit.Top, new Vector2(0f, -330f), new Vector2(1000f, 300f), 130,
                UIKit.Gold, true);
            UIKit.Say(title, UIKit.T("ui.title"), true);
            title.gameObject.AddComponent<Pulse>().amount = 0.02f;
            Text tagline = UIKit.Label("", root, UIKit.Top, new Vector2(0f, -560f), new Vector2(940f, 140f), 50, UIKit.Cream);
            UIKit.Say(tagline, UIKit.T("ui.tagline"));

            // Mqidec on the hearth's edge, with two of Teryel's pots.
            Image ledge = UIKit.Picture("plat_wood", root, UIKit.Center, new Vector2(0f, -250f), new Vector2(900f, 110f), true);
            ledge.rectTransform.SetAsLastSibling();
            Image hero = UIKit.Picture("izan_idle", root, UIKit.Center, new Vector2(0f, -90f), new Vector2(260f, 260f));
            hero.gameObject.AddComponent<Hopper>().delay = 0.2f;
            for (int i = 0; i < 2; i++)
            {
                float side = i == 0 ? -1f : 1f;
                Image pot = UIKit.Picture("pot_0", root, UIKit.Center, new Vector2(side * 330f, -60f + i * 70f),
                    new Vector2(190f, 190f));
                UIFrames frames = pot.gameObject.AddComponent<UIFrames>();
                frames.frames = new[] { Art.Get("pot_0"), Art.Get("pot_1") };
                frames.fps = 4f;
                pot.gameObject.AddComponent<Pulse>().amount = 0.06f;
            }

            Button play = UIKit.TextButton("btn_green", UIKit.T("ui.play"), root, UIKit.Bottom, new Vector2(0f, 760f),
                new Vector2(560f, 170f), Play, 80);
            play.gameObject.AddComponent<Pulse>().amount = 0.035f;
            UIKit.TextButton("btn_purple", UIKit.T("ui.tales"), root, UIKit.Bottom, new Vector2(0f, 590f),
                new Vector2(440f, 130f), () => Flow.Go(Flow.Map), 54);

            BuildLanguages(root);

            Button sound = UIKit.IconButton(Progress.SoundOn ? "ico_sound_on" : "ico_sound_off", root, UIKit.BottomLeft,
                new Vector2(120f, 130f), 150f, ToggleSound);
            soundIcon = sound.GetComponent<Image>();

            Text stars = UIKit.Label(Progress.TotalStars + " / " + (Progress.LevelCount * Rules.MaxStars), root,
                UIKit.BottomRight, new Vector2(-170f, 130f), new Vector2(300f, 90f), 54, UIKit.Gold);
            UIKit.Picture("star_full", stars.transform, UIKit.Center, new Vector2(-170f, 6f), new Vector2(90f, 90f));
        }

        void BuildLanguages(Transform root)
        {
            Text label = UIKit.Label("", root, UIKit.Bottom, new Vector2(0f, 450f), new Vector2(800f, 70f), 40, UIKit.Cream);
            UIKit.Say(label, UIKit.T("ui.language"));
            Lang current = Progress.Language;
            for (int i = 0; i < LanguageNames.Length; i++)
            {
                Lang lang = (Lang)i;
                float x = -375f + i * 250f;
                Button button = UIKit.TextButton(lang == current ? "btn_green" : "btn_purple", "", root, UIKit.Bottom,
                    new Vector2(x, 350f), new Vector2(240f, 100f), () =>
                    {
                        Progress.Language = lang;
                        Flow.Go(Flow.Menu);
                    }, 36);
                UIKit.Say(button.GetComponentInChildren<Text>(), LanguageNames[i], lang);
            }
        }

        /// <summary>The first stage not cleared; once every stage is, the night starts again (as the prototype).</summary>
        static void Play()
        {
            Flow.PlayLevel(Progress.IsDone(Progress.LevelCount) ? 1 : Progress.CurrentLevel);
        }

        void ToggleSound()
        {
            Progress.SoundOn = !Progress.SoundOn;
            Sfx.ApplySettings();
            soundIcon.sprite = Art.Get(Progress.SoundOn ? "ico_sound_on" : "ico_sound_off");
        }

        void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape)) Application.Quit();
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
