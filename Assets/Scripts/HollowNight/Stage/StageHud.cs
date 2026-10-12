using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>In-game interface: score bar, hero swap, hints, pause and result panels.</summary>
    public class StageHud : MonoBehaviour
    {
        StageController stage;
        Transform root;

        Text launchLabel;
        Text goalLabel;
        Image[] candyIcons;
        Image[] bossIcons;
        RectTransform swap;
        Image swapFace;
        Text abilityLabel;
        RectTransform hintPanel;
        Text hintLabel;
        CanvasGroup hintGroup;
        RectTransform pausePanel;
        Image pauseSound;
        Coroutine hintRoutine;
        int shownCandies = -1;

        public void Build(StageController controller, int candyCount, bool boss)
        {
            stage = controller;
            Canvas canvas = UIKit.MakeCanvas("HudCanvas", 20);
            root = canvas.transform;
            LevelData level = controller.Level;

            Image bar = UIKit.Picture("panel_dark", root, UIKit.Top, new Vector2(0f, -110f), new Vector2(720f, 250f), true);
            bar.color = new Color(1f, 1f, 1f, 0.88f);
            Text title = UIKit.Label(level.id + ".  " + level.name, bar.transform, UIKit.Center, new Vector2(0f, 62f),
                new Vector2(680f, 70f), 46, UIKit.Gold);
            title.horizontalOverflow = HorizontalWrapMode.Overflow;
            launchLabel = UIKit.Label("", bar.transform, UIKit.Center, new Vector2(-150f, -40f), new Vector2(380f, 80f), 40,
                UIKit.Cream);
            launchLabel.horizontalOverflow = HorizontalWrapMode.Overflow;

            candyIcons = new Image[candyCount];
            for (int i = 0; i < candyCount; i++)
            {
                candyIcons[i] = UIKit.Picture("candy_" + (i % 5), bar.transform, UIKit.Center,
                    new Vector2(120f + i * 86f, -40f), new Vector2(80f, 80f));
                candyIcons[i].color = new Color(0f, 0f, 0f, 0.55f);
            }

            UIKit.IconButton("ico_pause", root, UIKit.TopLeft, new Vector2(95f, -100f), 140f, stage.TogglePause);
            UIKit.IconButton("ico_restart", root, UIKit.TopRight, new Vector2(-95f, -100f), 140f, stage.Restart);

            goalLabel = UIKit.Label("", root, UIKit.Top, new Vector2(0f, -280f), new Vector2(900f, 70f), 44, UIKit.Gold);

            if (boss)
            {
                bossIcons = new Image[3];
                for (int i = 0; i < 3; i++)
                {
                    bossIcons[i] = UIKit.Picture("hat", root, UIKit.Top, new Vector2(-100f + i * 100f, -370f),
                        new Vector2(90f, 90f));
                }
            }

            // Hero swap button (bottom left) and ability reminder.
            Button swapButton = UIKit.IconButton("ico_swap", root, UIKit.BottomLeft, new Vector2(120f, 130f), 170f, stage.SwapHero);
            swap = (RectTransform)swapButton.transform;
            swapFace = UIKit.Picture("izan_idle", swap, UIKit.Center, new Vector2(95f, 85f), new Vector2(120f, 120f));
            abilityLabel = UIKit.Label("", root, UIKit.BottomRight, new Vector2(-280f, 70f), new Vector2(520f, 70f), 38,
                UIKit.Cream, false, TextAnchor.MiddleRight);
            abilityLabel.horizontalOverflow = HorizontalWrapMode.Overflow;

            Image hint = UIKit.Picture("panel_dark", root, UIKit.Bottom, new Vector2(0f, 330f), new Vector2(980f, 230f), true);
            hintPanel = hint.rectTransform;
            hintGroup = hint.gameObject.AddComponent<CanvasGroup>();
            hintGroup.blocksRaycasts = false;
            hintGroup.interactable = false;
            hintLabel = UIKit.Label("", hintPanel, UIKit.Center, Vector2.zero, new Vector2(880f, 180f), 40, UIKit.Cream);
            hintPanel.gameObject.SetActive(false);
            if (!string.IsNullOrEmpty(level.hint)) ShowHint(level.hint, 0f);

            BuildPause();
        }

        // ------------------------------------------------------------------ score bar
        public void SetScore(int launches, int par, int candies, int candyCount)
        {
            launchLabel.text = "LAUNCHES  " + launches + " / " + par;
            launchLabel.color = launches <= par ? UIKit.Cream : new Color(1f, 0.55f, 0.45f);
            for (int i = 0; i < candyIcons.Length; i++)
            {
                bool got = i < candies;
                candyIcons[i].color = got ? Color.white : new Color(0f, 0f, 0f, 0.55f);
                if (got && i >= shownCandies && shownCandies >= 0) StartCoroutine(Tween.Pop(candyIcons[i].transform, 0.4f));
            }
            shownCandies = candies;
        }

        public void SetGoal(string text)
        {
            goalLabel.text = text;
        }

        public void SetBoss(int health, int max)
        {
            if (bossIcons == null) return;
            for (int i = 0; i < bossIcons.Length; i++)
            {
                bool alive = i < health;
                bossIcons[i].color = alive ? Color.white : new Color(0f, 0f, 0f, 0.4f);
                if (!alive && i == health) StartCoroutine(Tween.Pop(bossIcons[i].transform, 0.4f));
            }
        }

        public void SetHero(HeroDef def, bool canSwap)
        {
            swapFace.sprite = Art.Get(def.sprite + "_idle");
            abilityLabel.text = "TAP IN AIR:  " + def.ability.ToUpper();
            SetSwapVisible(canSwap);
        }

        public void SetSwapVisible(bool visible)
        {
            if (swap != null) swap.gameObject.SetActive(visible);
        }

        // ------------------------------------------------------------------ hints
        /// <summary>Shows a hint. duration 0 keeps it until HideHint is called.</summary>
        public void ShowHint(string text, float duration = 4f)
        {
            if (hintRoutine != null) StopCoroutine(hintRoutine);
            hintLabel.text = text;
            hintPanel.gameObject.SetActive(true);
            hintGroup.alpha = 1f;
            if (duration > 0f) hintRoutine = StartCoroutine(HideAfter(duration));
        }

        public void HideHint()
        {
            if (!hintPanel.gameObject.activeSelf) return;
            if (hintRoutine != null) StopCoroutine(hintRoutine);
            hintRoutine = StartCoroutine(HideAfter(0f));
        }

        IEnumerator HideAfter(float delay)
        {
            float t = 0f;
            while (t < delay)
            {
                t += Time.unscaledDeltaTime;
                yield return null;
            }
            yield return Tween.Fade(hintGroup, 1f, 0f, 0.4f);
            hintPanel.gameObject.SetActive(false);
            hintRoutine = null;
        }

        // ------------------------------------------------------------------ pause
        void BuildPause()
        {
            pausePanel = UIKit.Stretch("Pause", root);
            UIKit.Fill(pausePanel, new Color(0.02f, 0.01f, 0.06f, 0.75f), true);
            Image panel = UIKit.Picture("panel", pausePanel, UIKit.Center, Vector2.zero, new Vector2(820f, 900f), true);
            Text title = UIKit.Label("PAUSED", panel.transform, UIKit.Top, new Vector2(0f, -130f), new Vector2(700f, 160f), 130,
                UIKit.Gold, true);
            title.horizontalOverflow = HorizontalWrapMode.Overflow;
            UIKit.TextButton("btn_green", "RESUME", panel.transform, UIKit.Center, new Vector2(0f, 130f),
                new Vector2(520f, 150f), stage.TogglePause, 64);
            UIKit.TextButton("btn_orange", "RESTART", panel.transform, UIKit.Center, new Vector2(0f, -40f),
                new Vector2(520f, 150f), stage.Restart, 64);
            UIKit.TextButton("btn_purple", "MAP", panel.transform, UIKit.Center, new Vector2(0f, -210f),
                new Vector2(520f, 150f), stage.ToMap, 64);
            Button sound = UIKit.IconButton(Progress.SoundOn ? "ico_sound_on" : "ico_sound_off", panel.transform, UIKit.Bottom,
                new Vector2(0f, 110f), 130f, ToggleSound);
            pauseSound = sound.GetComponent<Image>();
            pausePanel.gameObject.SetActive(false);
        }

        void ToggleSound()
        {
            Progress.SoundOn = !Progress.SoundOn;
            Sfx.ApplySettings();
            pauseSound.sprite = Art.Get(Progress.SoundOn ? "ico_sound_on" : "ico_sound_off");
        }

        public void ShowPause(bool show)
        {
            pausePanel.gameObject.SetActive(show);
        }

        // ------------------------------------------------------------------ result
        public void ShowResult(LevelData level, int stars, int launches, int candies, int candyCount)
        {
            hintPanel.gameObject.SetActive(false);
            SetSwapVisible(false);

            RectTransform overlay = UIKit.Stretch("Result", root);
            Image shade = UIKit.Fill(overlay, new Color(0.02f, 0.01f, 0.06f, 0f), true);
            Image panel = UIKit.Picture("panel", overlay, UIKit.Center, new Vector2(0f, 40f), new Vector2(900f, 1100f), true);

            bool last = level.id >= Progress.LevelCount;
            Text title = UIKit.Label(last ? "THE FLAME IS FREE!" : "STAGE CLEAR!", panel.transform, UIKit.Top,
                new Vector2(0f, -140f), new Vector2(860f, 170f), last ? 100 : 124, UIKit.Gold, true);
            title.horizontalOverflow = HorizontalWrapMode.Overflow;

            Image hero = UIKit.Picture(stage.Hero.Def.sprite + "_happy", panel.transform, UIKit.Center, new Vector2(0f, 330f),
                new Vector2(250f, 250f));
            Hopper hop = hero.gameObject.AddComponent<Hopper>();
            hop.height = 40f;
            hop.period = 1f;

            for (int i = 0; i < 3; i++)
            {
                Vector2 p = new Vector2(-230f + i * 230f, i == 1 ? 120f : 80f);
                UIKit.Picture("star_empty", panel.transform, UIKit.Center, p, new Vector2(210f, 210f));
                if (i < stars)
                {
                    Image star = UIKit.Picture("star_full", panel.transform, UIKit.Center, p, new Vector2(210f, 210f));
                    star.transform.localScale = Vector3.zero;
                    StartCoroutine(StarPop(star.transform, 0.5f + i * 0.4f, 1f + i * 0.12f));
                }
            }

            string[] rows =
            {
                "Stage cleared",
                "All candy embers   " + candies + " / " + candyCount,
                "Launches   " + launches + "   (par " + level.par + ")"
            };
            bool[] earned = { true, candies >= candyCount, launches <= level.par };
            for (int i = 0; i < rows.Length; i++)
            {
                Text row = UIKit.Label(rows[i], panel.transform, UIKit.Center, new Vector2(40f, -90f - i * 80f),
                    new Vector2(700f, 70f), 42, earned[i] ? UIKit.Cream : new Color(1f, 1f, 1f, 0.45f), false,
                    TextAnchor.MiddleLeft);
                row.horizontalOverflow = HorizontalWrapMode.Overflow;
                UIKit.Picture(earned[i] ? "star_full" : "star_empty", row.transform, UIKit.Center, new Vector2(-400f, 4f),
                    new Vector2(64f, 64f));
            }

            Button home = UIKit.IconButton("ico_home", panel.transform, UIKit.Bottom, new Vector2(-260f, 150f), 190f, stage.ToMap);
            Button retry = UIKit.IconButton("ico_restart", panel.transform, UIKit.Bottom, new Vector2(0f, 150f), 190f, stage.Restart);
            Button next = UIKit.IconButton("ico_next", panel.transform, UIKit.Bottom, new Vector2(260f, 150f), 230f, stage.NextLevel);

            StartCoroutine(Tween.Run(0.3f, t => shade.color = new Color(0.02f, 0.01f, 0.06f, 0.7f * t)));
            StartCoroutine(Tween.Pop(panel.transform, 0.45f));
            StartCoroutine(Tween.Pop(home.transform, 0.3f, 1.6f));
            StartCoroutine(Tween.Pop(retry.transform, 0.3f, 1.7f));
            StartCoroutine(Tween.Pop(next.transform, 0.3f, 1.8f));
        }

        IEnumerator StarPop(Transform star, float delay, float pitch)
        {
            float t = 0f;
            while (t < delay)
            {
                t += Time.unscaledDeltaTime;
                yield return null;
            }
            Sfx.Play(Sound.Star, 1f, pitch);
            yield return Tween.Pop(star, 0.4f);
        }
    }
}
