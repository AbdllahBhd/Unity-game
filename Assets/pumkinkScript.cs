using System.Collections;
using UnityEngine;

public class pumkinkScript : MonoBehaviour
{
    public float helth = 4;

    public GameObject deatheffect;
    public Animator animator;
    bool v = false;

    private void Start()
    {
        if (animator != null) animator.enabled = false;
    }

    void OnCollisionEnter2D(Collision2D collision)
    {
        if (v) return;

        if (collision.relativeVelocity.magnitude > helth)
        {
            StartCoroutine(die());
            if (deatheffect != null) Instantiate(deatheffect, transform.position, Quaternion.identity);
        }
    }

    IEnumerator die()
    {
        v = true;
        if (animator != null) animator.enabled = true;
        yield return new WaitForSeconds(0.3f);
        Destroy(gameObject);
    }
}
