using UnityEngine;

public class GameManager : MonoBehaviour
{
    #region Singleton class:GameManager
    public static GameManager Instance;
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
    }

    private void OnDestroy()
    {
        if (Instance == this)
        {
            Instance = null;
        }
    }
    #endregion

    // a drag shorter than this is a tap, not a launch
    const float mindrag = 0.3f;

    public trajectory_Script trajectory;

    Camera cam;

    Vector2 startpoint;
    Vector2 endpoint;
    Vector2 direction;
    Vector2 force;
    float distance;

    public PLayer_drag_drop ball;

    [SerializeField] float pushforce = 4f;

    public Animator animator;

    bool isdragging = false;

    void Start()
    {
        cam = Camera.main;
        ball.desactivaterb();
    }

    void Update()
    {
        // the player was destroyed by the door
        if (ball == null)
        {
            if (isdragging)
            {
                isdragging = false;
                trajectory.Hide();
            }
            return;
        }

        if (Input.GetMouseButtonDown(0))
        {
            isdragging = true;
            force = Vector2.zero;
            if (animator != null) animator.SetBool("Ground", false);

            OnDragStart();
        }

        if (isdragging)
        {
            OnDrag();
        }

        if (Input.GetMouseButtonUp(0) && isdragging)
        {
            isdragging = false;
            OnDragend();
        }
    }

    void OnDragStart()
    {
        ball.desactivaterb();

        startpoint = cam.ScreenToWorldPoint(Input.mousePosition);

        trajectory.Show();
    }

    void OnDrag()
    {
        endpoint = cam.ScreenToWorldPoint(Input.mousePosition);
        distance = Vector2.Distance(startpoint, endpoint);
        direction = (startpoint - endpoint).normalized;
        force = direction * distance * pushforce;
        Debug.DrawLine(startpoint, endpoint);
        // the preview assumes mass 1, so divide the impulse by the real mass
        trajectory.UpdatDots(ball.Pose, force / Mathf.Max(0.0001f, ball.rbz.mass));
    }

    void OnDragend()
    {
        trajectory.Hide();
        ball.activaterb();

        if (distance < mindrag)
        {
            return;
        }

        if (animator != null) animator.enabled = false;
        ball.Push(force);
    }
}
