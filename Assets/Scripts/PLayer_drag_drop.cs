using UnityEngine;
using UnityEngine.SceneManagement;

public class PLayer_drag_drop : MonoBehaviour
{
    public trajectory_Script trajectory_b;

    public PLayer_drag_drop ball;

    public Animator animator;
    public Animator animator_menu, star_l, star_m, star_r, stone, b_r, b_m, b_n;
    public Collider2D door_col;

    public Rigidbody2D rbz;
    public CircleCollider2D coll;
    public Vector3 Pose { get { return transform.position; } }

    bool reloading = false;

    public void Update()
    {
        if (reloading) return;

        if (rbz.position.x < -20 || rbz.position.x > 20 || rbz.position.y < -30 || rbz.position.y > 30)
        {
            reloading = true;
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }
    }

    private void Awake()
    {
        SetMenuAnimators(false);
    }

    private void Start()
    {
        if (animator != null) animator.enabled = true;
    }

    // the win menu is shown by enabling its animators (they are not assigned in the test scenes)
    void SetMenuAnimators(bool on)
    {
        Animator[] menu = { animator_menu, star_l, star_m, star_r, stone, b_r, b_m, b_n };
        foreach (Animator a in menu)
        {
            if (a != null) a.enabled = on;
        }
    }

    public void Push(Vector2 force)
    {
        rbz.AddForce(force, ForceMode2D.Impulse);
        if (force.x > 0)
            rbz.rotation = force.magnitude * -1;
        else rbz.rotation = force.magnitude * 1;
    }

    public void activaterb()
    {
        rbz.isKinematic = false;
    }

    public void desactivaterb()
    {
        rbz.velocity = Vector2.zero;
        rbz.angularVelocity = 0f;
        rbz.isKinematic = true;
    }

    public void OnLanding()
    {
        if (animator != null)
        {
            animator.enabled = true;
            animator.SetBool("Ground", true);
        }

        rbz.rotation = 0;
    }

    void OnTriggerEnter2D(Collider2D collision)
    {
        if (door_col != null && collision == door_col)
        {
            SetMenuAnimators(true);
        }
    }
}
