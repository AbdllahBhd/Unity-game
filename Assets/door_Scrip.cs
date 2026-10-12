using UnityEngine;

public class door_Scrip : MonoBehaviour
{
    public Animator animator_dor;
    public Animator animator_player;

    public Animator transition;
    public float whaite;

    public GameObject player;

    bool open = false;

    void Start()
    {
        if (animator_dor != null) animator_dor.enabled = false;
    }

    void OnTriggerEnter2D(Collider2D collision)
    {
        // only the player opens the door (pumpkins and debris used to open it too)
        if (open || player == null) return;
        if (collision.gameObject != player && !collision.transform.IsChildOf(player.transform)) return;

        open = true;
        if (animator_dor != null) animator_dor.enabled = true;
        Destroy(player);
        if (animator_player != null) animator_player.enabled = true;
    }
}
