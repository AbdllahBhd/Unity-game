using UnityEngine;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>Level select: a winding path of ten stages across three chapters.</summary>
    public class WorldMapScreen : MonoBehaviour
    {
        const float Step = 300f;
        const float BottomPadding = 320f;
        const float TopPadding = 520f;

        void Start()
        {
            Sfx.StartMusic();
            Canvas canvas = UIKit.MakeCanvas("MapCanvas", 10);
            Transform root = canvas.transform;

            int current = CurrentLevel();
            UIKit.Backdrop(Story.ChapterBackdrops[Story.ChapterOf(current)], root);
            UIKit.Fill(root, new Color(0.03f, 0.01f, 0.08f, 0.35f), false);

            BuildPath(root, current);
            BuildHeader(root);
        }

        static int CurrentLevel()
        {
            for (int i = 1; i <= Progress.LevelCount; i++)
            {
                if (!Progress.IsDone(i)) return i;
            }
            return Progress.LevelCount;
        }

        void BuildHeader(Transform root)
        {
            Image bar = UIKit.Picture("panel_dark", root, UIKit.Top, new Vector2(0f, -150f), new Vector2(1100f, 340f), true);
            Text title = UIKit.Label("THE ROAD TO THE TOWER", bar.transform, UIKit.Center, new Vector2(0f, 60f),
                new Vector2(900f, 120f), 84, UIKit.Gold, true);
            title.horizontalOverflow = HorizontalWrapMode.Overflow;

            Text stars = UIKit.Label(Progress.TotalStars + " / " + (Progress.LevelCount * 3), bar.transform, UIKit.Center,
                new Vector2(330f, -60f), new Vector2(300f, 80f), 50, UIKit.Cream);
            UIKit.Picture("star_full", stars.transform, UIKit.Center, new Vector2(-160f, 6f), new Vector2(80f, 80f));

            UIKit.Picture("izan_idle", bar.transform, UIKit.Center, new Vector2(-300f, -60f), new Vector2(110f, 110f));

            UIKit.IconButton("ico_home", root, UIKit.TopLeft, new Vector2(100f, -110f), 130f, () => Flow.Go(Flow.Menu));
        }

        void BuildPath(Transform root, int current)
        {
            RectTransform view = UIKit.Stretch("Scroll", root);
            Image catcher = view.gameObject.AddComponent<Image>();
            catcher.color = new Color(0f, 0f, 0f, 0f);
            view.gameObject.AddComponent<RectMask2D>();
            ScrollRect scroll = view.gameObject.AddComponent<ScrollRect>();
            scroll.horizontal = false;
            scroll.vertical = true;
            scroll.movementType = ScrollRect.MovementType.Elastic;
            scroll.scrollSensitivity = 40f;

            float height = BottomPadding + TopPadding + Step * (Progress.LevelCount - 1);
            GameObject contentObject = new GameObject("Content", typeof(RectTransform));
            RectTransform content = (RectTransform)contentObject.transform;
            content.SetParent(view, false);
            content.anchorMin = new Vector2(0f, 0f);
            content.anchorMax = new Vector2(1f, 0f);
            content.pivot = new Vector2(0.5f, 0f);
            content.sizeDelta = new Vector2(0f, height);
            content.anchoredPosition = Vector2.zero;
            scroll.content = content;
            scroll.viewport = view;

            Vector2[] points = new Vector2[Progress.LevelCount];
            for (int i = 0; i < points.Length; i++)
            {
                float x = Mathf.Sin(i * 1.15f) * 300f;
                points[i] = new Vector2(x, BottomPadding + i * Step);
            }

            // Dotted trail between stages.
            for (int i = 0; i < points.Length - 1; i++)
            {
                bool open = Progress.IsDone(i + 1);
                for (int k = 1; k < 6; k++)
                {
                    Vector2 p = Vector2.Lerp(points[i], points[i + 1], k / 6f);
                    Image dot = UIKit.Picture("dot", content, UIKit.Bottom, p, new Vector2(46f, 46f));
                    dot.color = open ? UIKit.Gold : new Color(1f, 1f, 1f, 0.25f);
                }
            }

            // Chapter banners.
            int[] chapterStarts = { 1, 5, 8 };
            for (int c = 0; c < chapterStarts.Length; c++)
            {
                int level = chapterStarts[c];
                Vector2 p = new Vector2(0f, points[level - 1].y - 165f);
                Image banner = UIKit.Picture("btn_purple", content, UIKit.Bottom, p, new Vector2(940f, 100f), true);
                banner.color = new Color(1f, 1f, 1f, 0.92f);
                Text label = UIKit.Label(Story.ChapterNames[c], banner.transform, UIKit.Center, new Vector2(0f, 6f),
                    new Vector2(920f, 90f), 40, Color.white);
                label.horizontalOverflow = HorizontalWrapMode.Overflow;
            }

            for (int i = 0; i < points.Length; i++) BuildNode(content, points[i], i + 1, current);

            // Morgra waits at the end of the road.
            Image witch = UIKit.Picture("morgra_idle", content, UIKit.Bottom,
                points[points.Length - 1] + new Vector2(-40f, 330f), new Vector2(330f, 330f));
            Hopper hover = witch.gameObject.AddComponent<Hopper>();
            hover.height = 30f;
            hover.period = 2.4f;

            // Start with the current stage in view.
            float viewHeight = 1920f;
            float target = Mathf.Clamp(points[current - 1].y - viewHeight * 0.45f, 0f, Mathf.Max(0f, height - viewHeight));
            content.anchoredPosition = new Vector2(0f, -target);
        }

        void BuildNode(Transform content, Vector2 position, int level, int current)
        {
            bool unlocked = Progress.IsUnlocked(level);
            bool done = Progress.IsDone(level);
            LevelData data = LevelLibrary.Get(level);

            string sprite = !unlocked ? "node_locked" : (done ? "node_done" : "node");
            int captured = level;
            Button button = UIKit.IconButton(sprite, content, UIKit.Bottom, position, 190f, () =>
            {
                if (Progress.IsUnlocked(captured)) Flow.PlayLevel(captured);
            });
            button.interactable = unlocked;

            if (unlocked)
            {
                Text number = UIKit.Label(level.ToString(), button.transform, UIKit.Center, new Vector2(0f, 12f),
                    new Vector2(180f, 120f), 86, Color.white);
                number.horizontalOverflow = HorizontalWrapMode.Overflow;
            }

            bool labelRight = position.x < 0f;
            Text name = UIKit.Label(data.name, content, UIKit.Bottom,
                position + new Vector2(labelRight ? 330f : -330f, 20f), new Vector2(420f, 80f), 44,
                unlocked ? UIKit.Cream : new Color(1f, 1f, 1f, 0.4f), false,
                labelRight ? TextAnchor.MiddleLeft : TextAnchor.MiddleRight);
            name.horizontalOverflow = HorizontalWrapMode.Overflow;

            if (done)
            {
                int stars = Progress.Stars(level);
                for (int s = 0; s < 3; s++)
                {
                    UIKit.Picture(s < stars ? "star_full" : "star_empty", button.transform, UIKit.Center,
                        new Vector2(-62f + s * 62f, -98f - (s == 1 ? 14f : 0f)), new Vector2(66f, 66f));
                }
            }

            if (level == current && unlocked)
            {
                HeroDef hero = Heroes.Get(data.hero);
                Image marker = UIKit.Picture(hero.sprite + "_happy", button.transform, UIKit.Center, new Vector2(0f, 170f),
                    new Vector2(150f, 150f));
                Hopper hopper = marker.gameObject.AddComponent<Hopper>();
                hopper.height = 40f;
                hopper.period = 1.2f;
                button.gameObject.AddComponent<Pulse>().amount = 0.05f;
            }
        }

        void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape)) Flow.Go(Flow.Menu);
        }
    }
}
