using System.Collections;
using HollowNight.Logic;
using UnityEngine;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>In-game interface: stage title and stars, hints, pause and result panels. Every text is a TalesText id.</summary>
    public class StageHud : MonoBehaviour
    {
        StageController stage;
        Transform root;

        Text goalLabel;
        Image[] starIcons;
        Image[] bossIcons;
        Text abilityLabel;
        RectTransform hintPanel;
        Text hintLabel;
        CanvasGroup hintGroup;
        RectTransform pausePanel;
        Image pauseSound;
        Coroutine hintRoutine;
        int shownSmashed = -1;

        public void Build(StageController controller, bool boss)
        {
            stage = controller;
            Canvas canvas = UIKit.MakeCanvas("HudCanvas", 20);
            root = canvas.transform;
            LevelData level = controller.Level;

            Image bar = UIKit.Picture("panel_dark", root, UIKit.Top, new Vector2(0f, -110f), new Vector2(900f, 250f), true);
            bar.color = new Color(1f, 1f, 1f, 0.88f);
            Text title = UIKit.Label("", bar.transform, UIKit.Center, new Vector2(0f, 62f), new Vector2(860f, 70f), 46,
                UIKit.Gold);
            UIKit.Say(title, UIKit.T("ui.stage") + " " + level.id + "  -  " + level.name);

            // One star per hunter broken, up to three.
            starIcons = new Image[Rules.MaxStars];
            for (int i = 0; i < starIcons.Length; i++)
            {
                starIcons[i] = UIKit.Picture("star_empty", bar.transform, UIKit.Center,
                    new Vector2(-90f + i * 90f, -40f), new Vector2(84f, 84f));
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

            // Dash reminder: a wide box that wraps, since UIKit.Say decides the overflow per language.
            abilityLabel = UIKit.Label("", root, UIKit.BottomRight, new Vector2(-470f, 80f), new Vector2(900f, 110f), 34,
                UIKit.Cream, false, TextAnchor.MiddleRight);

            Image hint = UIKit.Picture("panel_dark", root, UIKit.Bottom, new Vector2(0f, 330f), new Vector2(980f, 230f), true);
            hintPanel = hint.rectTransform;
            hintGroup = hint.gameObject.AddComponent<CanvasGroup>();
            hintGroup.blocksRaycasts = false;
            hintGroup.interactable = false;
            hintLabel = UIKit.Label("", hintPanel, UIKit.Center, Vector2.zero, new Vector2(880f, 180f), 40, UIKit.Cream);
            hintPanel.gameObject.SetActive(false);
            if (!string.IsNullOrEmpty(level.hint)) ShowHint(UIKit.T(level.hint), 0f);

            BuildPause();
        }

        // ------------------------------------------------------------------ score bar
        public void SetStars(int stars)
        {
            for (int i = 0; i < starIcons.Length; i++)
            {
                bool got = i < stars;
                starIcons[i].sprite = Art.Get(got ? "star_full" : "star_empty");
                if (got && i >= shownSmashed && shownSmashed >= 0)
                {
                    StartCoroutine(Tween.Pop(starIcons[i].transform, 0.4f));
                    Sfx.Play(Sound.Star, 0.7f, 1f + i * 0.12f);
                }
            }
            shownSmashed = stars;
        }

        /// <summary>The line under the score bar, from a text id; null or "" clears it.</summary>
        public void SetGoal(string id)
        {
            UIKit.Say(goalLabel, string.IsNullOrEmpty(id) ? "" : UIKit.T(id));
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

        public void SetHero(HeroDef def)
        {
            UIKit.Say(abilityLabel, def.Hint);
        }

        // ------------------------------------------------------------------ hints
        /// <summary>Shows a hint. duration 0 keeps it until HideHint is called.</summary>
        public void ShowHint(string text, float duration = 4f)
        {
            if (hintRoutine != null) StopCoroutine(hintRoutine);
            UIKit.Say(hintLabel, text);
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
            Text title = UIKit.Label("", panel.transform, UIKit.Top, new Vector2(0f, -130f), new Vector2(700f, 160f), 110,
                UIKit.Gold, true);
            UIKit.Say(title, UIKit.T("ui.paused"), true);
            UIKit.TextButton("btn_green", UIKit.T("ui.resume"), panel.transform, UIKit.Center, new Vector2(0f, 130f),
                new Vector2(520f, 150f), stage.TogglePause, 56);
            UIKit.TextButton("btn_orange", UIKit.T("ui.restart"), panel.transform, UIKit.Center, new Vector2(0f, -40f),
                new Vector2(520f, 150f), stage.Restart, 56);
            UIKit.TextButton("btn_purple", UIKit.T("ui.map"), panel.transform, UIKit.Center, new Vector2(0f, -210f),
                new Vector2(520f, 150f), stage.ToMap, 56);
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
        public void ShowResult(int stars)
        {
            hintPanel.gameObject.SetActive(false);

            RectTransform overlay = UIKit.Stretch("Result", root);
            Image shade = UIKit.Fill(overlay, new Color(0.02f, 0.01f, 0.06f, 0f), true);
            Image panel = UIKit.Picture("panel", overlay, UIKit.Center, new Vector2(0f, 40f), new Vector2(900f, 1100f), true);

            Text title = UIKit.Label("", panel.transform, UIKit.Top, new Vector2(0f, -150f), new Vector2(860f, 200f), 90,
                UIKit.Gold, true);
            UIKit.Say(title, UIKit.T("ui.doorOpens"), true);

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

            // The prototype's verdict: all three broken, some, or none.
            string verdict = stars >= Rules.MaxStars ? UIKit.T("ui.allThree")
                : stars > 0 ? TalesText.Format(UIKit.T("ui.someBroken"), "n", stars.ToString()) : UIKit.T("ui.noneBroken");
            Text row = UIKit.Label("", panel.transform, UIKit.Center, new Vector2(0f, -170f), new Vector2(760f, 220f), 46,
                UIKit.Cream);
            UIKit.Say(row, verdict);

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
