using System.Collections;
using HollowNight.Logic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>Builds UI from code: canvases, labels, images and animated buttons.</summary>
    public static class UIKit
    {
        public static readonly Vector2 Center = new Vector2(0.5f, 0.5f);
        public static readonly Vector2 Top = new Vector2(0.5f, 1f);
        public static readonly Vector2 Bottom = new Vector2(0.5f, 0f);
        public static readonly Vector2 TopLeft = new Vector2(0f, 1f);
        public static readonly Vector2 TopRight = new Vector2(1f, 1f);
        public static readonly Vector2 BottomLeft = new Vector2(0f, 0f);
        public static readonly Vector2 BottomRight = new Vector2(1f, 0f);

        public static readonly Color Cream = new Color(1f, 0.96f, 0.84f);
        public static readonly Color Gold = new Color(1f, 0.81f, 0.29f);
        public static readonly Color Ink = new Color(0.07f, 0.03f, 0.13f);

        public static void EnsureEventSystem()
        {
            if (EventSystem.current != null || Object.FindObjectOfType<EventSystem>() != null) return;
            new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
        }

        public static Canvas MakeCanvas(string name, int order)
        {
            EnsureEventSystem();
            GameObject go = new GameObject(name);
            Canvas canvas = go.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = order;
            CanvasScaler scaler = go.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080f, 1920f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            // Portrait screens match the width; wide screens match the height so nothing overflows.
            scaler.matchWidthOrHeight = Screen.width <= Screen.height ? 0f : 1f;
            go.AddComponent<GraphicRaycaster>();
            return canvas;
        }

        public static RectTransform Node(string name, Transform parent, Vector2 anchor, Vector2 position, Vector2 size)
        {
            GameObject go = new GameObject(name, typeof(RectTransform));
            RectTransform rect = (RectTransform)go.transform;
            rect.SetParent(parent, false);
            rect.anchorMin = anchor;
            rect.anchorMax = anchor;
            rect.pivot = Center;
            rect.anchoredPosition = position;
            rect.sizeDelta = size;
            return rect;
        }

        public static RectTransform Stretch(string name, Transform parent)
        {
            GameObject go = new GameObject(name, typeof(RectTransform));
            RectTransform rect = (RectTransform)go.transform;
            rect.SetParent(parent, false);
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return rect;
        }

        public static Image Picture(string sprite, Transform parent, Vector2 anchor, Vector2 position, Vector2 size,
            bool sliced = false)
        {
            RectTransform rect = Node(sprite, parent, anchor, position, size);
            Image image = rect.gameObject.AddComponent<Image>();
            image.sprite = Art.Get(sprite);
            image.type = sliced ? Image.Type.Sliced : Image.Type.Simple;
            image.preserveAspect = !sliced;
            image.raycastTarget = false;
            return image;
        }

        public static Image Fill(Transform parent, Color color, bool blockClicks)
        {
            RectTransform rect = Stretch("Fill", parent);
            Image image = rect.gameObject.AddComponent<Image>();
            image.color = color;
            image.raycastTarget = blockClicks;
            return image;
        }

        /// <summary>Full-screen background picture that always covers the screen.</summary>
        public static Image Backdrop(string sprite, Transform parent)
        {
            RectTransform rect = Stretch("Backdrop", parent);
            Image image = rect.gameObject.AddComponent<Image>();
            image.sprite = Art.Get(sprite);
            image.raycastTarget = false;
            AspectRatioFitter fitter = rect.gameObject.AddComponent<AspectRatioFitter>();
            fitter.aspectMode = AspectRatioFitter.AspectMode.EnvelopeParent;
            Sprite s = image.sprite;
            fitter.aspectRatio = s != null && s.rect.height > 0f ? s.rect.width / s.rect.height : 0.5f;
            return image;
        }

        public static Text Label(string text, Transform parent, Vector2 anchor, Vector2 position, Vector2 size,
            int fontSize, Color color, bool title = false, TextAnchor align = TextAnchor.MiddleCenter)
        {
            RectTransform rect = Node("Label", parent, anchor, position, size);
            Text label = rect.gameObject.AddComponent<Text>();
            label.font = title ? Art.TitleFont : Art.BodyFont;
            label.text = text;
            label.fontSize = fontSize;
            label.color = color;
            label.alignment = align;
            label.horizontalOverflow = HorizontalWrapMode.Wrap;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            label.raycastTarget = false;
            label.supportRichText = true;
            Outline outline = rect.gameObject.AddComponent<Outline>();
            outline.effectColor = new Color(Ink.r, Ink.g, Ink.b, 0.9f);
            float d = Mathf.Max(2f, fontSize * 0.05f);
            outline.effectDistance = new Vector2(d, -d);
            return label;
        }

        /// <summary>A label's text in the tales' language (Progress.Language).</summary>
        public static void Say(Text label, string text, bool title = false)
        {
            Say(label, text, Progress.Language, title);
        }

        /// <summary>
        /// Sets a label's text in a language: Arabic is shaped, wrapped to the label's width and
        /// laid out right to left (UI Text cannot), and Latin text keeps the decorative font
        /// only when that font has every letter (Taqbaylit's ɣ, ḍ... fall back to Noto Sans).
        /// </summary>
        public static void Say(Text label, string text, Lang lang, bool title = false)
        {
            label.resizeTextForBestFit = false;
            if (lang != Lang.Ar)
            {
                Font preferred = title ? Art.TitleFont : Art.BodyFont;
                label.font = Draws(preferred, text) ? preferred : Art.LatinFont;
                label.horizontalOverflow = HorizontalWrapMode.Wrap;
                label.text = text;
                return;
            }
            label.font = Art.ArabicFont;
            label.alignment = RightToLeft(label.alignment);
            // Lines are broken by ArabicText, in reading order, before they are reversed.
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            float width = label.rectTransform.rect.width;
            label.text = ArabicText.Layout(text, s => Width(label, s), width > 0f ? width : float.MaxValue);
        }

        /// <summary>The typewriter for Arabic: the first <paramref name="reveal"/> letters, appearing from the right.</summary>
        public static void SayArabicPart(Text label, string text, int reveal)
        {
            float width = label.rectTransform.rect.width;
            label.text = ArabicText.Layout(text, s => Width(label, s), width > 0f ? width : float.MaxValue, reveal);
        }

        static bool Draws(Font font, string text)
        {
            foreach (char c in text)
                if (!char.IsWhiteSpace(c) && !font.HasCharacter(c)) return false;
            return true;
        }

        static float Width(Text label, string s)
        {
            TextGenerationSettings settings = label.GetGenerationSettings(Vector2.zero);
            return label.cachedTextGeneratorForLayout.GetPreferredWidth(s, settings) / label.pixelsPerUnit;
        }

        static TextAnchor RightToLeft(TextAnchor a)
        {
            switch (a)
            {
                case TextAnchor.UpperLeft: return TextAnchor.UpperRight;
                case TextAnchor.MiddleLeft: return TextAnchor.MiddleRight;
                case TextAnchor.LowerLeft: return TextAnchor.LowerRight;
                default: return a;
            }
        }

        public static Button TextButton(string sprite, string text, Transform parent, Vector2 anchor, Vector2 position,
            Vector2 size, UnityAction onClick, int fontSize = 54)
        {
            RectTransform rect = Node("Button " + text, parent, anchor, position, size);
            Image image = rect.gameObject.AddComponent<Image>();
            image.sprite = Art.Get(sprite);
            image.type = Image.Type.Sliced;
            Button button = MakeButton(rect, image, onClick);
            Text label = Label(text, rect, Center, new Vector2(0f, 6f), size, fontSize, Color.white);
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            return button;
        }

        public static Button IconButton(string sprite, Transform parent, Vector2 anchor, Vector2 position, float size,
            UnityAction onClick)
        {
            RectTransform rect = Node("Button " + sprite, parent, anchor, position, new Vector2(size, size));
            Image image = rect.gameObject.AddComponent<Image>();
            image.sprite = Art.Get(sprite);
            image.preserveAspect = true;
            return MakeButton(rect, image, onClick);
        }

        static Button MakeButton(RectTransform rect, Image image, UnityAction onClick)
        {
            Button button = rect.gameObject.AddComponent<Button>();
            button.targetGraphic = image;
            button.transition = Selectable.Transition.None;
            Navigation navigation = button.navigation;
            navigation.mode = Navigation.Mode.None;
            button.navigation = navigation;
            rect.gameObject.AddComponent<ButtonJuice>();
            button.onClick.AddListener(() => Sfx.Play(Sound.Click));
            if (onClick != null) button.onClick.AddListener(onClick);
            return button;
        }

        /// <summary>True when the pointer (mouse or first touch) is over a UI element.</summary>
        public static bool PointerOverUI()
        {
            EventSystem system = EventSystem.current;
            if (system == null) return false;
            if (Input.touchCount > 0) return system.IsPointerOverGameObject(Input.GetTouch(0).fingerId);
            return system.IsPointerOverGameObject();
        }
    }

    /// <summary>Squashes a button while it is pressed.</summary>
    public class ButtonJuice : MonoBehaviour, IPointerDownHandler, IPointerUpHandler
    {
        float target = 1f;
        float current = 1f;
        Vector3 baseScale = Vector3.one;
        bool captured;

        void OnEnable()
        {
            target = 1f;
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            Capture();
            target = 0.9f;
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            target = 1f;
        }

        void Capture()
        {
            if (captured) return;
            // Buttons can be created at scale zero by a pop-in tween; wait until they have a real size.
            if (transform.localScale.x < 0.5f) return;
            baseScale = transform.localScale;
            captured = true;
        }

        void Update()
        {
            if (!captured) return;
            if (Mathf.Abs(current - target) < 0.001f) return;
            current = Mathf.Lerp(current, target, Time.unscaledDeltaTime * 20f);
            transform.localScale = baseScale * current;
        }
    }
}
