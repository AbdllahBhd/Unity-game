using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class balltest : MonoBehaviour
{
    // Start is called before the first frame update
    public bool ispressed=false;

    public Rigidbody2D rb;
    

    // Update is called once per frame
    

    void OnMouseDown()
    {
    	ispressed=true;
    	rb.isKinematic=true;

    }
    void OnMouseUp()
    {
    	ispressed=false;
    	rb.isKinematic=false;

    }
    void Update()
    {
    	if(ispressed)
    		{
    			rb.position=Camera.main.ScreenToWorldPoint(Input.mousePosition);
    		}
        
    }
}
