using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

// Shared behaviour of the win-menu buttons of the first prototype (Level_1).
// The buttons are world sprites, so a click is tested against the sprite, not a UI element.
public abstract class LegacyButton : MonoBehaviour
{
    public Rigidbody2D rb;
    public Animator transition, animator;
    public float whaite = 0.5f;

    bool pressed = false;

    protected abstract string PressedParameter { get; }
    protected abstract int TargetScene();

    void Update()
    {
        if (pressed || !Input.GetMouseButtonDown(0)) return;

        // the win menu is hidden until its animators are enabled: ignore clicks during play
        if (animator == null || !animator.enabled) return;

        Vector2 pos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
        if (!Contains(pos)) return;

        pressed = true;
        animator.SetBool(PressedParameter, true);
        StartCoroutine(LevelLoader(TargetScene()));
    }

    bool Contains(Vector2 pos)
    {
        SpriteRenderer sprite = GetComponent<SpriteRenderer>();
        if (sprite != null)
        {
            Bounds b = sprite.bounds;
            return pos.x > b.min.x && pos.x < b.max.x && pos.y > b.min.y && pos.y < b.max.y;
        }

        Vector2 centre = rb != null ? rb.position : (Vector2)transform.position;
        return Mathf.Abs(pos.x - centre.x) < 5 && Mathf.Abs(pos.y - centre.y) < 5;
    }

    // kept for the animation events / other scripts that call it
    public void loadNexLevel()
    {
        if (pressed) return;
        pressed = true;
        StartCoroutine(LevelLoader(TargetScene()));
    }

    protected static int Current()
    {
        return SceneManager.GetActiveScene().buildIndex;
    }

    // falls back to the current scene when the wanted one is not in the build
    protected static int SceneOrCurrent(string path, int index)
    {
        int found = path != null ? SceneUtility.GetBuildIndexByScenePath(path) : index;
        if (found >= 0 && found < SceneManager.sceneCountInBuildSettings) return found;
        return Current();
    }

    IEnumerator LevelLoader(int indexx)
    {
        yield return new WaitForSeconds(whaite);
        if (transition != null) transition.SetTrigger("fade");
        yield return new WaitForSeconds(whaite + 0.5f);

        SceneManager.LoadScene(indexx);
    }
}
