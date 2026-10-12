using System.Collections;
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
        public static string StoryId = "prologue";
        public static string AfterStory = Map;

        public static void Go(string scene)
        {
            FlowRunner.Instance.Load(scene);
        }

        public static void ShowStory(string id, string after)
        {
            StoryId = id;
            AfterStory = after;
            Go(StoryScene);
        }

        /// <summary>Starts a level, playing its intro story the first time.</summary>
        public static void PlayLevel(int level)
        {
            Level = Mathf.Clamp(level, 1, Progress.LevelCount);
            string id = "pre_" + Level;
            if (Story.Has(id) && !Progress.Seen(id)) ShowStory(id, Stage);
            else Go(Stage);
        }

        /// <summary>Leaves a cleared level towards the next level or the map, playing any story unlocked by it.</summary>
        public static void LeaveLevel(int level, bool toNext)
        {
            string post = "post_" + level;
            bool last = level >= Progress.LevelCount;
            if (Story.Has(post) && !Progress.Seen(post))
            {
                if (last || !toNext)
                {
                    ShowStory(post, last ? Menu : Map);
                }
                else
                {
                    Level = level + 1;
                    ShowStory(post, NextTarget(Level));
                }
                return;
            }
            if (toNext && !last) PlayLevel(level + 1);
            else Go(Map);
        }

        static string NextTarget(int level)
        {
            string id = "pre_" + level;
            return Story.Has(id) && !Progress.Seen(id) ? "story:" + id : Stage;
        }

        /// <summary>Called by the story screen when the dialogue ends.</summary>
        public static void StoryFinished()
        {
            Progress.MarkSeen(StoryId);
            string target = AfterStory;
            if (target != null && target.StartsWith("story:"))
            {
                ShowStory(target.Substring(6), Stage);
                return;
            }
            Go(string.IsNullOrEmpty(target) ? Map : target);
        }
    }

    /// <summary>Persistent object that owns the fade overlay and runs scene loads.</summary>
    public class FlowRunner : MonoBehaviour
    {
        static FlowRunner instance;
        CanvasGroup group;
        bool busy;

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
            if (busy) return;
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
