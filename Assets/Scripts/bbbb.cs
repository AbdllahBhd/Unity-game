using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class bbbb : MonoBehaviour
{
	

    public float power=10f;
    public Rigidbody2D rb_b;

    public Vector2 minpower;
    public Vector2 maxpower;

    Camera cam;
    Vector2 force;
    Vector3 startpoint;
    Vector3 endpoint;


     //Start is called before the first frame update
    void Start()
    {
        cam=Camera.main;
    }

    // Update is called once per frame
    void Update()
    {
        if(Input.GetMouseButtonDown(0))
        {
            startpoint=cam.ScreenToWorldPoint(Input.mousePosition);
            //startpoint.z=15;
        }

        if(Input.GetMouseButtonUp(0))
        { 
            endpoint=cam.ScreenToWorldPoint(Input.mousePosition);
            //endpoint.z=15;
            force=new Vector2(Mathf.Clamp(startpoint.x-endpoint.x,minpower.x,maxpower.x),Mathf.Clamp(startpoint.y-endpoint.y,minpower.y,maxpower.y));
           rb_b.rotation=endpoint.z;
            rb_b.AddForce(force*power,ForceMode2D.Impulse);
        }
        
    }

}
