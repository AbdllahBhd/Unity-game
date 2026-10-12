using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace HollowNight.EditorTools
{
    /// <summary>
    /// Automated first-run smoke test. Menu: Hollow Night / Smoke Test (all stages).
    /// Enters Play mode in HN_MainMenu, visits the map and prologue, then loads every stage,
    /// launches the hero a few times, forces a win to show the result panel, and writes all
    /// Console warnings/errors to Tools/smoke_report.txt. Progress is saved as in a real win.
    /// </summary>
    [InitializeOnLoad]
    public static class HNSmokeTest
    {
        const string Flag = "HN_SmokeTest_Running";
        const string ReportPath = "Tools/smoke_report.txt";
        const string MenuScenePath = "Assets/Scenes/HollowNight/HN_MainMenu.unity";
        const float ScreenSeconds = 2.5f;
        const float StageSeconds = 10f;
        const float AfterWinSeconds = 2.5f;

        enum Phase { Menu, Map, Story, StageLoad, StagePlay, StageWon, Done }

        static readonly List<string> issues = new List<string>();
        static readonly StringBuilder summary = new StringBuilder();
        static Phase phase;
        static double phaseStart;
        static double lastAction;
        static int level;
        static int launches;
        static bool pendingAbilityRelease;
        static bool sawRest;
        static int launchErrors;

        [MenuItem("Hollow Night/Smoke Test (all stages)")]
        static void Run()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("[SmokeTest] Exit Play mode first.");
                return;
            }
            SceneAsset menu = AssetDatabase.LoadAssetAtPath<SceneAsset>(MenuScenePath);
            if (menu == null)
            {
                Debug.LogError("[SmokeTest] Scene not found: " + MenuScenePath);
                return;
            }
            EditorPrefs.SetBool(Flag, true);
            EditorSceneManager.playModeStartScene = menu;
            EditorApplication.EnterPlaymode();
        }

        static HNSmokeTest()
        {
            if (!EditorPrefs.GetBool(Flag, false)) return;
            if (!EditorApplication.isPlayingOrWillChangePlaymode)
            {
                // Stale flag from an aborted run.
                EditorPrefs.DeleteKey(Flag);
                EditorSceneManager.playModeStartScene = null;
                return;
            }
            phase = Phase.Menu;
            phaseStart = EditorApplication.timeSinceStartup;
            level = 0;
            Application.logMessageReceived += OnLog;
            EditorApplication.update += Tick;
            EditorApplication.playModeStateChanged += OnPlayModeChanged;
        }

        static void OnPlayModeChanged(PlayModeStateChange change)
        {
            if (change == PlayModeStateChange.ExitingPlayMode && phase != Phase.Done) Finish("Play mode was stopped early");
        }

        static void OnLog(string condition, string stackTrace, LogType type)
        {
            if (type == LogType.Log) return;
            if (condition.StartsWith("[SmokeTest]")) return;
            string where = phase == Phase.Menu || phase == Phase.Map || phase == Phase.Story ? phase.ToString() : "Stage " + level;
            string trace = "";
            if (!string.IsNullOrEmpty(stackTrace))
            {
                string[] lines = stackTrace.Split('\n');
                int n = Mathf.Min(4, lines.Length);
                for (int i = 0; i < n; i++) trace += "\n      " + lines[i].Trim();
            }
            issues.Add(type + " @ " + where + ": " + condition + trace);
        }

        static double Elapsed { get { return EditorApplication.timeSinceStartup - phaseStart; } }

        static void Enter(Phase next)
        {
            phase = next;
            phaseStart = EditorApplication.timeSinceStartup;
            lastAction = phaseStart;
        }

        static void Tick()
        {
            if (!EditorApplication.isPlaying) return;
            try
            {
                Step();
            }
            catch (Exception e)
            {
                issues.Add("Exception in smoke test driver @ " + phase + " level " + level + ": " + e);
                Finish("driver exception");
            }
        }

        static void Step()
        {
            switch (phase)
            {
                case Phase.Menu:
                    if (Elapsed < ScreenSeconds) return;
                    Note("Menu: camera=" + (Camera.main != null) + " canvas=" + (HasCanvas()));
                    Flow.Go(Flow.Map);
                    Enter(Phase.Map);
                    return;

                case Phase.Map:
                    if (Elapsed < ScreenSeconds + 1f) return;
                    Note("Map: scene=" + SceneManager.GetActiveScene().name + " canvas=" + (HasCanvas()));
                    Flow.StoryId = "prologue";
                    Flow.AfterStory = Flow.Map;
                    SceneManager.LoadScene(Flow.StoryScene);
                    Enter(Phase.Story);
                    return;

                case Phase.Story:
                    if (Elapsed < ScreenSeconds) return;
                    Note("Story: scene=" + SceneManager.GetActiveScene().name + " canvas=" + (HasCanvas()));
                    level = 1;
                    LoadStage();
                    return;

                case Phase.StageLoad:
                    if (Elapsed < 1f) return;
                    if (StageController.I == null || StageController.I.Hero == null)
                    {
                        if (Elapsed < 4f) return;
                        Note("Stage " + level + ": FAILED to build (no StageController/Hero after 4 s), scene=" + SceneManager.GetActiveScene().name);
                        NextStage();
                        return;
                    }
                    Note("Stage " + level + " \"" + StageController.I.Level.name + "\": built, hero=" + StageController.I.Hero.Def.name
                         + " objects=" + CountLevelObjects());
                    Enter(Phase.StagePlay);
                    return;

                case Phase.StagePlay:
                    PlayStage();
                    return;

                case Phase.StageWon:
                    if (Elapsed < AfterWinSeconds) return;
                    NextStage();
                    return;

                case Phase.Done:
                    return;
            }
        }

        static void LoadStage()
        {
            launches = 0;
            launchErrors = 0;
            sawRest = false;
            pendingAbilityRelease = false;
            Flow.Level = level;
            SceneManager.LoadScene(Flow.Stage);
            Enter(Phase.StageLoad);
        }

        static void NextStage()
        {
            if (level >= Progress.LevelCount)
            {
                Finish("completed");
                return;
            }
            level++;
            LoadStage();
        }

        static void PlayStage()
        {
            StageController sc = StageController.I;
            if (sc == null || sc.Hero == null)
            {
                Note("Stage " + level + ": controller vanished during play");
                NextStage();
                return;
            }
            Hero hero = sc.Hero;
            if (hero.State == HeroState.Resting) sawRest = true;
            double now = EditorApplication.timeSinceStartup;

            if (Elapsed >= StageSeconds || sc.Ended)
            {
                Note("Stage " + level + ": launches=" + launches + " state=" + hero.State + " candies=" + sc.Candies
                     + " restedAgain=" + sawRest + (sc.Ended ? " (won naturally)" : " -> forcing Win"));
                if (!sc.Ended) sc.Win(hero.transform.position);
                Enter(Phase.StageWon);
                return;
            }

            if (pendingAbilityRelease && now - lastAction > 0.4)
            {
                hero.AbilityRelease();
                pendingAbilityRelease = false;
                lastAction = now;
                return;
            }

            if (now - lastAction < 1.2) return;

            if (hero.CanLaunch)
            {
                float dir = UnityEngine.Random.value < 0.5f ? -1f : 1f;
                if (hero.transform.position.x < -3f) dir = 1f;
                if (hero.transform.position.x > 3f) dir = -1f;
                Vector2 drag = new Vector2(dir * UnityEngine.Random.Range(1.5f, 3.5f), UnityEngine.Random.Range(2f, 4f));
                hero.Launch(hero.LaunchVelocity(drag, 4f));
                launches++;
                lastAction = now;
            }
            else if (hero.State == HeroState.Flying)
            {
                hero.AbilityPress();
                pendingAbilityRelease = true;
                lastAction = now;
            }
            else if (hero.State == HeroState.Dead && now - lastAction > 3.0)
            {
                launchErrors++;
                lastAction = now;
                if (launchErrors > 2) Note("Stage " + level + ": hero stuck in Dead state for >3 s");
            }
        }

        static bool HasCanvas()
        {
            return UnityEngine.Object.FindObjectsByType<Canvas>(FindObjectsSortMode.None).Length > 0;
        }

        static int CountLevelObjects()
        {
            GameObject world = GameObject.Find("Level " + level);
            return world == null ? -1 : world.transform.childCount;
        }

        static void Note(string line)
        {
            summary.AppendLine(line);
            Debug.Log("[SmokeTest] " + line);
        }

        static void Finish(string reason)
        {
            if (phase == Phase.Done) return;
            phase = Phase.Done;
            Application.logMessageReceived -= OnLog;
            EditorApplication.update -= Tick;
            EditorApplication.playModeStateChanged -= OnPlayModeChanged;
            EditorPrefs.DeleteKey(Flag);
            EditorSceneManager.playModeStartScene = null;

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("Hollow Night smoke test  " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "  Unity " + Application.unityVersion);
            sb.AppendLine("Result: " + reason);
            sb.AppendLine();
            sb.AppendLine("== Walkthrough ==");
            sb.Append(summary);
            sb.AppendLine();
            sb.AppendLine("== Console warnings/errors (" + issues.Count + ") ==");
            // Collapse repeats so one spammy warning does not hide the rest.
            Dictionary<string, int> counts = new Dictionary<string, int>();
            List<string> order = new List<string>();
            foreach (string s in issues)
            {
                if (!counts.ContainsKey(s)) { counts[s] = 0; order.Add(s); }
                counts[s]++;
            }
            foreach (string s in order) sb.AppendLine((counts[s] > 1 ? "[x" + counts[s] + "] " : "") + s);

            string path = Path.Combine(Directory.GetCurrentDirectory(), ReportPath);
            File.WriteAllText(path, sb.ToString());
            Debug.Log("[SmokeTest] Report written to " + path + " (" + issues.Count + " issues). Exiting Play mode.");
            if (EditorApplication.isPlaying) EditorApplication.ExitPlaymode();
        }
    }
}
