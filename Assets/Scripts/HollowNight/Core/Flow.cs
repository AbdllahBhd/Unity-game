using System.Collections;
using System.Collections.Generic;
using HollowNight.Logic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace HollowNight
{
    /// <summary>Scene navigation with a fade transition. State that must survive a scene load lives here.</summary>
    public static class Flow
    {
        public const string Menu = "HN_MainMenu";
        public const string Map = "HN_WorldMap";
        public const string StoryScene = "HN_Story";
        public const string Stage = "HN_Stage";

        public static int Level = 1;
        /// <summary>The story ids the story screen plays, in order (see TalesStory).</summary>
        public static List<string> Stories = new List<string>();
        public static string AfterStory = Map;

        public static void Go(string scene)
        {
            FlowRunner.Instance.Load(scene);
        }

        /// <summary>Plays a chain of stories in one story screen, then goes on to a scene.</summary>
        public static void ShowStories(List<string> ids, string after)
        {
            if (ids.Count == 0)
            {
                Go(after);
                return;
            }
            Stories = ids;
            AfterStory = after;
            Go(StoryScene);
        }

        /// <summary>Starts a stage with the stories not yet told before it (the hearth, the night, its lines).</summary>
        public static void PlayLevel(int level)
        {
            Level = Mathf.Clamp(level, 1, Progress.LevelCount);
            ShowStories(TalesStory.BeforeStage(Level, Progress.Seen), Stage);
        }

        /// <summary>
        /// Leaves a cleared stage. "Next", as the prototype's nextStage: the last stage of a night first
        /// tells the tale's end and the closing, then the next stage (or the menu after the last one).
        /// "Map" goes straight to the map, as the prototype's toMap.
        /// </summary>
        public static void LeaveLevel(int level, bool toNext)
        {
            if (!toNext)
            {
                Go(Map);
                return;
            }
            List<string> ids = TalesStory.AfterStage(level, Progress.Seen);
            if (level >= Progress.LevelCount)
            {
                ShowStories(ids, Menu);
                return;
            }
            Level = level + 1;
            List<string> told = ids;
            ids.AddRange(TalesStory.BeforeStage(Level, id => Progress.Seen(id) || told.Contains(id)));
            ShowStories(ids, Stage);
        }

        /// <summary>Called by the story screen when the chain ends or is skipped.</summary>
        public static void StoryFinished()
        {
            foreach (string id in Stories) Progress.MarkSeen(id);
            Go(string.IsNullOrEmpty(AfterStory) ? Map : AfterStory);
        }
    }

    /// <summary>Persistent object that owns the fade overlay and runs scene loads.</summary>
    public class FlowRunner : MonoBehaviour
    {
        static FlowRunner instance;
        CanvasGroup group;
        bool busy;
        string pending;

        public static FlowRunner Instance
        {
            get
            {
                if (instance == null)
                {
                    GameObject go = new GameObject("HN_Flow");
                    DontDestroyOnLoad(go);
                    instance = go.AddComponent<FlowRunner>();
                    instance.Build();
                }
                return instance;
            }
        }

        void Build()
        {
            Canvas canvas = gameObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 1000;
            gameObject.AddComponent<GraphicRaycaster>();
            group = gameObject.AddComponent<CanvasGroup>();
            group.alpha = 0f;
            group.blocksRaycasts = false;

            GameObject image = new GameObject("Fade");
            image.transform.SetParent(transform, false);
            Image img = image.AddComponent<Image>();
            img.color = new Color(0.04f, 0.02f, 0.09f, 1f);
            RectTransform rect = img.rectTransform;
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        public void Load(string scene)
        {
            // A load asked for while another runs (a scene that leaves at once, in its Start) waits its turn.
            if (busy)
            {
                pending = scene;
                return;
            }
            StartCoroutine(LoadRoutine(scene));
        }

        /// <summary>Fades the overlay out; called when a scene starts.</summary>
        public void Reveal()
        {
            if (!busy) StartCoroutine(Fade(group.alpha, 0f, 0.35f));
        }

        IEnumerator LoadRoutine(string scene)
        {
            busy = true;
            group.blocksRaycasts = true;
            yield return Fade(group.alpha, 1f, 0.3f);
            Time.timeScale = 1f;
            AsyncOperation op = SceneManager.LoadSceneAsync(scene);
            if (op == null)
            {
                Debug.LogError("[HollowNight] Scene '" + scene + "' is not in Build Settings.");
            }
            else
            {
                while (!op.isDone) yield return null;
            }
            yield return null;
            yield return Fade(1f, 0f, 0.35f);
            group.blocksRaycasts = false;
            busy = false;
            if (pending != null)
            {
                string next = pending;
                pending = null;
                StartCoroutine(LoadRoutine(next));
            }
        }

        IEnumerator Fade(float from, float to, float duration)
        {
            float t = 0f;
            while (t < duration)
            {
                t += Time.unscaledDeltaTime;
                group.alpha = Mathf.Lerp(from, to, t / duration);
                yield return null;
            }
            group.alpha = to;
        }
    }
}
