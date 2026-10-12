using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class player_script : MonoBehaviour
{
	public Animator animator;
	bool ground=false;
    
    public bool isPressed=false;

    public Rigidbody2D rb;

     public Rigidbody2D rb_ball;

     public float waite=.15f;

     Vector2 mousepose;


    public void  OnLanding()
    {
    	ground=true;
    	animator.SetBool("Ground",ground);
        animator.enabled = false;
        rb_ball.isKinematic=false;
        rb.rotation = 0;
    	rb_ball.bodyType = RigidbodyType2D.Static;
    }



    void Update()
    {
    	ground=false;
    	if(isPressed)
    		{
    			 mousepose =Camera.main.ScreenToWorldPoint(Input.mousePosition);
    			rb.position=Camera.main.ScreenToWorldPoint(Input.mousePosition);

    			
    		}
    		
        
    }
    void FixedUpdate()
    {
    	// only aim at the ball while it is being dragged
    	if(!isPressed) return;
    	Vector2 loockdir= rb.position-rb_ball.position;
    	float angle=Mathf.Atan2(loockdir.y,loockdir.x)*Mathf.Rad2Deg;
    	rb.rotation=angle;
    }



	void OnMouseDown()
	{
		isPressed=true;
        animator.enabled = false;
		rb.isKinematic=true;

		//rb_ball.isKinematic=false;
		rb_ball.bodyType = RigidbodyType2D.Static;

	}

	void OnMouseUp()
	{
		isPressed=false;
		rb.isKinematic=false;
		//rb_ball.bodyType = RigidbodyType2D.Dynamic;
		StartCoroutine(delay());
	}


	IEnumerator delay ()
	{
		yield return new WaitForSeconds(waite);
		GetComponent<SpringJoint2D>().enabled=false;
	}


    
    

    // Update is called once per frame
    
}
