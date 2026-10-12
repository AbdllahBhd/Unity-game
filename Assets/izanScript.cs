using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class izanScript : MonoBehaviour
{
     public Rigidbody2D rbz;
     public CircleCollider2D coll;

    [HideInInspector] public Vector3 Pose { get { return transform.position; } }

   


    public void Push(Vector2 force)
    {
        rbz.AddForce(force, ForceMode2D.Impulse);

    }

    public void activaterb()
    {
        rbz.isKinematic = false;
    }

    public void desactivaterb()
    {
        rbz.angularVelocity = 0f;
        rbz.isKinematic = true;
    }
}
