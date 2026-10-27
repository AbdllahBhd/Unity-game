using System.Collections;
using System.Collections.Generic;
using HollowNight.Logic;
using UnityEngine;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>
    /// Plays the chain of stories in <see cref="Flow.Stories"/>: backdrop per beat, speaker portrait and
    /// name plate, typewriter text in the chosen language (Arabic appears from the right). Tap to advance.
    /// </summary>
    public class StoryScreen : MonoBehaviour
    {
        const float CharsPerSecond = 45f;

        /// <summary>One line to show, with the beat and story it belongs to.</summary>
        struct Entry
        {
            public int beat;    // index of the beat in the whole chain
            public string scene;
            public string fx;
            public string line;
        }

        readonly List<Entry> entries = new List<Entry>();
        Lang lang;
        int index = -1;
        bool typing;
        bool finished;
        string fullText = "";

        Image backdrop;
        RectTransform card;
        Text cardTale;
        Text cardNight;
        Text body;
        Text speaker;
        Image leftPortrait;
        Image rightPortrait;
        RectTransform namePlate;
        RectTransform prompt;
        Coroutine typer;

        void Start()
        {
            lang = Progress.Language;
            int beats = 0;
            foreach (string id in Flow.Stories)
            {
                if (!TalesStory.Has(id))
                {
                    Debug.LogError("[HollowNight] Unknown story id '" + id + "'; it is not in TalesStory.");
                    continue;
                }
                foreach (Beat beat in TalesStory.Get(id))
                {
                    foreach (string line in beat.Lines)
                        entries.Add(new Entry { beat = beats, scene = beat.Scene, fx = beat.Fx, line = line });
                    beats++;
                }
            }
            if (entries.Count == 0)
            {
                Flow.StoryFinished();
                return;
            }
            Build();
            Sfx.StartMusic();
            Next();
        }

        void Build()
        {
            Canvas canvas = UIKit.MakeCanvas("StoryCanvas", 10);
            Transform root = canvas.transform;

            backdrop = UIKit.Backdrop(Story.Backdrop(entries[0].scene), root);
            UIKit.Fill(root, new Color(0.03f, 0.01f, 0.08f, 0.35f), false);

            BuildCard(root);

            leftPortrait = UIKit.Picture("portrait_jida", root, UIKit.Bottom, new Vector2(-270f, 900f), new Vector2(520f, 520f));
            rightPortrait = UIKit.Picture("portrait_girl", root, UIKit.Bottom, new Vector2(270f, 900f), new Vector2(520f, 520f));
            leftPortrait.gameObject.AddComponent<Pulse>().amount = 0.02f;
            rightPortrait.gameObject.AddComponent<Pulse>().amount = 0.02f;
            leftPortrait.enabled = false;
            rightPortrait.enabled = false;

            Image panel = UIKit.Picture("panel", root, UIKit.Bottom, new Vector2(0f, 380f), new Vector2(1000f, 560f), true);
            body = UIKit.Label("", panel.transform, UIKit.Center, new Vector2(0f, -10f), new Vector2(860f, 400f), 50,
                UIKit.Cream, false, TextAnchor.UpperLeft);
            body.lineSpacing = 1.15f;

            Image plate = UIKit.Picture("btn_purple", panel.transform, UIKit.TopLeft, new Vector2(260f, 0f),
                new Vector2(460f, 110f), true);
            namePlate = plate.rectTransform;
            speaker = UIKit.Label("", namePlate, UIKit.Center, new Vector2(0f, 6f), new Vector2(440f, 100f), 46, Color.white);

            Text tap = UIKit.Label("", panel.transform, UIKit.BottomRight, new Vector2(-230f, 60f),
                new Vector2(420f, 60f), 34, new Color(1f, 1f, 1f, 0.7f));
            UIKit.Say(tap, TalesText.Get("ui.tap", lang), lang);
            prompt = tap.rectTransform;
            tap.gameObject.AddComponent<Pulse>().amount = 0.05f;

            UIKit.TextButton("btn_orange", TalesText.Get("ui.skip", lang), root, UIKit.TopRight, new Vector2(-150f, -80f),
                new Vector2(240f, 100f), Finish, 42);

            // Full-screen invisible button that advances the dialogue.
            Image tapArea = UIKit.Fill(root, new Color(0f, 0f, 0f, 0f), true);
            tapArea.transform.SetSiblingIndex(2);
            Button advance = tapArea.gameObject.AddComponent<Button>();
            advance.transition = Selectable.Transition.None;
            advance.onClick.AddListener(Next);
        }

        /// <summary>
        /// The night's card. The tale's Taqbaylit name keeps a Latin font in every language (the Arabic
        /// font has no Latin letters); "Night N" and the tale's name in the chosen language sit above it.
        /// </summary>
        void BuildCard(Transform root)
        {
            card = UIKit.Node("Card", root, UIKit.Top, new Vector2(0f, -250f), new Vector2(1000f, 360f));
            int night = Story.NightCard(Flow.Stories);
            card.gameObject.SetActive(night > 0);
            if (night == 0) return;
            cardNight = UIKit.Label("", card, UIKit.Top, new Vector2(0f, -50f), new Vector2(1000f, 100f), 56, UIKit.Cream);
            string subtitle = UIKit.T("ui.night") + " " + night;
            if (lang != Lang.Tq) subtitle += "  -  " + TalesText.Get("tale." + night, lang);
            UIKit.Say(cardNight, subtitle, lang);
            cardTale = UIKit.Label("", card, UIKit.Top, new Vector2(0f, -190f), new Vector2(1000f, 160f), 100, UIKit.Gold, true);
            UIKit.Say(cardTale, TalesText.Get("tale." + night, Lang.Tq), Lang.Tq, true);
        }

        void Update()
        {
            if (Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.Return)) Next();
            if (Input.GetKeyDown(KeyCode.Escape)) Finish();
        }

        void Next()
        {
            if (finished || entries.Count == 0) return;
            if (typing)
            {
                // First tap completes the current line.
                if (typer != null) StopCoroutine(typer);
                typing = false;
                UIKit.Say(body, fullText, lang);
                prompt.gameObject.SetActive(true);
                return;
            }

            index++;
            if (index >= entries.Count)
            {
                Finish();
                return;
            }
            Show(entries[index], index == 0 ? (Entry?)null : entries[index - 1]);
        }

        void Show(Entry entry, Entry? previous)
        {
            if (previous == null || previous.Value.beat != entry.beat)
            {
                backdrop.sprite = Art.Get(Story.Backdrop(entry.scene));
                // The card belongs to the first beat only.
                if (entry.beat > 0) card.gameObject.SetActive(false);
                if (entry.fx == "thud")
                {
                    Sfx.Play(Sound.Crush, 1f, 0.8f);
                    StartCoroutine(Tween.Run(0.4f, t => backdrop.color = Color.Lerp(new Color(1f, 0.85f, 0.7f), Color.white, t)));
                }
            }

            TaleLine line = TalesText.Line(entry.line);
            string portrait = Story.Portrait(line.Who);
            bool narration = portrait == null;
            namePlate.gameObject.SetActive(!narration);
            if (!narration) UIKit.Say(speaker, TalesText.Get("who." + line.Who, lang), lang);
            // Jida's hushed lines are told in gold, like the narration.
            bool hushed = line.Mood == "hushed";
            body.fontStyle = narration ? FontStyle.Italic : FontStyle.Normal;
            body.color = narration || hushed ? UIKit.Gold : UIKit.Cream;

            if (!narration)
            {
                bool right = Story.OnRight(line.Who);
                Image active = right ? rightPortrait : leftPortrait;
                Image other = right ? leftPortrait : rightPortrait;
                active.sprite = Art.Get(portrait);
                active.enabled = true;
                active.color = Color.white;
                // Portraits face the centre of the screen. A turn, not a negative scale: Pulse rewrites the scale.
                active.rectTransform.localRotation = Quaternion.Euler(0f, right ? 180f : 0f, 0f);
                if (other.enabled) other.color = new Color(0.45f, 0.45f, 0.55f, 1f);
                StartCoroutine(Hop(active.rectTransform));
            }
            else
            {
                if (leftPortrait.enabled) leftPortrait.color = new Color(0.45f, 0.45f, 0.55f, 1f);
                if (rightPortrait.enabled) rightPortrait.color = new Color(0.45f, 0.45f, 0.55f, 1f);
            }

            fullText = line.In(lang);
            if (typer != null) StopCoroutine(typer);
            typer = StartCoroutine(Type());
        }

        IEnumerator Hop(RectTransform target)
        {
            Vector2 origin = new Vector2(target.anchoredPosition.x, 900f);
            yield return Tween.Run(0.3f, t =>
            {
                if (target != null) target.anchoredPosition = origin + Vector2.up * Mathf.Sin(t * Mathf.PI) * 40f;
            });
        }

        IEnumerator Type()
        {
            typing = true;
            prompt.gameObject.SetActive(false);
            // Sets the font, alignment and wrapping for the whole line before revealing it.
            UIKit.Say(body, fullText, lang);
            bool arabic = lang == Lang.Ar;
            // Arabic is revealed by shaped letters, which are fewer (lam-alef is one).
            int total = arabic ? ArabicText.Shape(fullText).Length : fullText.Length;
            float shown = 0f;
            int last = -1;
            while (shown < total)
            {
                shown += Time.unscaledDeltaTime * CharsPerSecond;
                int count = Mathf.Min(total, (int)shown);
                if (count != last)
                {
                    // Arabic is shaped and laid out right to left, so its prefix is revealed from the right.
                    if (arabic) UIKit.SayArabicPart(body, fullText, count);
                    else body.text = fullText.Substring(0, count);
                    if (count % 3 == 0) Sfx.Play(Sound.Type, 0.6f, Random.Range(0.9f, 1.15f));
                    last = count;
                }
                yield return null;
            }
            UIKit.Say(body, fullText, lang);
            typing = false;
            prompt.gameObject.SetActive(true);
        }

        void Finish()
        {
            if (finished) return;
            finished = true;
            Flow.StoryFinished();
        }
    }
}
