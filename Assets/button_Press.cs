using UnityEngine;

public class button_Press : MonoBehaviour
{
    public Animator animator;
    public Rigidbody2D rb;

    public level_Loader load;

    bool pressed = false;

    void Update()
    {
        if (pressed || !Input.GetMouseButtonDown(0)) return;

        Vector2 pos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
        if (rb.position.x - 30 < pos.x && rb.position.x + 30 > pos.x && rb.position.y - 30 < pos.y && rb.position.y + 30 > pos.y)
        {
            // a second click used to start a second scene load
            pressed = true;
            animator.SetBool("pressed", true);
            load.loadNexLevel();
        }
    }
}
