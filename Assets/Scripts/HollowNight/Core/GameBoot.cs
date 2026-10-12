using UnityEngine;

namespace HollowNight
{
    public enum ScreenKind { MainMenu = 0, WorldMap = 1, Story = 2, Stage = 3 }

    /// <summary>
    /// The only component stored in the Hollow Night scenes. Everything else (camera, UI, level) is
    /// created from code, so the scenes never need to be edited by hand.
    /// </summary>
    public class GameBoot : MonoBehaviour
    {
        public ScreenKind screen = ScreenKind.MainMenu;

        void Awake()
        {
            Application.targetFrameRate = 60;
            Time.timeScale = 1f;
            EnsureCamera();
            UIKit.EnsureEventSystem();
            Sfx.ApplySettings();

            switch (screen)
            {
                case ScreenKind.MainMenu:
                    gameObject.AddComponent<MainMenuScreen>();
                    break;
                case ScreenKind.WorldMap:
                    gameObject.AddComponent<WorldMapScreen>();
                    break;
                case ScreenKind.Story:
                    gameObject.AddComponent<StoryScreen>();
                    break;
                case ScreenKind.Stage:
                    gameObject.AddComponent<StageController>();
                    break;
            }
        }

        public static Camera EnsureCamera()
        {
            Camera camera = Camera.main;
            if (camera == null)
            {
                GameObject go = new GameObject("Main Camera");
                go.tag = "MainCamera";
                camera = go.AddComponent<Camera>();
                go.AddComponent<AudioListener>();
            }
            camera.orthographic = true;
            camera.orthographicSize = 10f;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.05f, 0.03f, 0.12f);
            camera.transform.position = new Vector3(0f, 0f, -10f);
            camera.nearClipPlane = 0.1f;
            camera.farClipPlane = 50f;
            return camera;
        }
    }
}
