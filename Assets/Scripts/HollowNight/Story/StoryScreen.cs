using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>Plays a dialogue scene: portraits, name plate and typewriter text. Tap to advance.</summary>
    public class StoryScreen : MonoBehaviour
    {
        const float CharsPerSecond = 45f;

        Dialogue scene;
        int index = -1;
        bool typing;
        bool finished;
        string fullText = "";

        Text body;
        Text speaker;
        Image leftPortrait;
        Image rightPortrait;
        RectTransform namePlate;
        RectTransform prompt;
        Coroutine typer;

        void Start()
        {
            scene = Story.Get(Flow.StoryId);
            if (scene == null)
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

            UIKit.Backdrop(scene.backdrop, root);
            UIKit.Fill(root, new Color(0.03f, 0.01f, 0.08f, 0.45f), false);

            Text title = UIKit.Label(scene.title, root, UIKit.Top, new Vector2(0f, -170f), new Vector2(1000f, 160f), 96,
                UIKit.Gold, true);
            title.horizontalOverflow = HorizontalWrapMode.Overflow;

            leftPortrait = UIKit.Picture("izan_idle", root, UIKit.Bottom, new Vector2(-270f, 900f), new Vector2(520f, 520f));
            rightPortrait = UIKit.Picture("hoot_idle", root, UIKit.Bottom, new Vector2(270f, 900f), new Vector2(520f, 520f));
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

            Text tap = UIKit.Label("tap to continue", panel.transform, UIKit.BottomRight, new Vector2(-230f, 60f),
                new Vector2(420f, 60f), 34, new Color(1f, 1f, 1f, 0.7f));
            prompt = tap.rectTransform;
            tap.gameObject.AddComponent<Pulse>().amount = 0.05f;

            UIKit.TextButton("btn_orange", "SKIP", root, UIKit.TopRight, new Vector2(-150f, -80f), new Vector2(240f, 100f),
                Finish, 42);

            // Full-screen invisible button that advances the dialogue.
            Image tapArea = UIKit.Fill(root, new Color(0f, 0f, 0f, 0f), true);
            tapArea.transform.SetSiblingIndex(2);
            Button advance = tapArea.gameObject.AddComponent<Button>();
            advance.transition = Selectable.Transition.None;
            advance.onClick.AddListener(Next);
        }

        void Update()
        {
            if (Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.Return)) Next();
            if (Input.GetKeyDown(KeyCode.Escape)) Finish();
        }

        void Next()
        {
            if (finished || scene == null) return;
            if (typing)
            {
                // First tap completes the current line.
                if (typer != null) StopCoroutine(typer);
                typing = false;
                body.text = fullText;
                prompt.gameObject.SetActive(true);
                return;
            }

            index++;
            if (index >= scene.lines.Length)
            {
                Finish();
                return;
            }
            Show(scene.lines[index]);
        }

        void Show(Line line)
        {
            bool narration = string.IsNullOrEmpty(line.portrait);
            namePlate.gameObject.SetActive(!narration);
            speaker.text = line.who;
            body.fontStyle = narration ? FontStyle.Italic : FontStyle.Normal;
            body.color = narration ? UIKit.Gold : UIKit.Cream;

            if (!narration)
            {
                Image active = line.right ? rightPortrait : leftPortrait;
                Image other = line.right ? leftPortrait : rightPortrait;
                active.sprite = Art.Get(line.portrait);
                active.enabled = true;
                active.color = Color.white;
                // Portraits face the centre of the screen.
                active.rectTransform.localScale = new Vector3(line.right ? -1f : 1f, 1f, 1f);
                if (other.enabled) other.color = new Color(0.45f, 0.45f, 0.55f, 1f);
                StartCoroutine(Hop(active.rectTransform));
            }
            else
            {
                if (leftPortrait.enabled) leftPortrait.color = new Color(0.45f, 0.45f, 0.55f, 1f);
                if (rightPortrait.enabled) rightPortrait.color = new Color(0.45f, 0.45f, 0.55f, 1f);
            }

            fullText = line.text;
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
            float shown = 0f;
            int last = 0;
            while (shown < fullText.Length)
            {
                shown += Time.unscaledDeltaTime * CharsPerSecond;
                int count = Mathf.Min(fullText.Length, (int)shown);
                if (count != last)
                {
                    body.text = fullText.Substring(0, count);
                    if (count % 3 == 0) Sfx.Play(Sound.Type, 0.6f, Random.Range(0.9f, 1.15f));
                    last = count;
                }
                yield return null;
            }
            body.text = fullText;
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
