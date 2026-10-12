using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class trajectory_Script : MonoBehaviour
{
    [SerializeField] int dots_number;
    [SerializeField] GameObject dots_parent;
    [SerializeField] GameObject dotsprefab;
    [SerializeField]  float dots_spacing;


    Transform[] dotsliste;
    Vector2 pos;
    float timestamp;

    


    // Start is called before the first frame update
    void Start()
    {
        Hide();
        preparedots();
        
    }

    void preparedots()
    {
        dotsliste = new Transform[dots_number];

        for(int i=0;i<dots_number;i++)
        {
            dotsliste[i] = Instantiate(dotsprefab,null).transform;
            dotsliste[i].parent = dots_parent.transform;
        }
    }

    public void UpdatDots(Vector3 ballpos, Vector2 forceAplied)
    {
        timestamp = dots_spacing;
        for (int i = 0; i < dots_number; i++)
        {
            pos.x = (ballpos.x+forceAplied.x*timestamp);
            pos.y = (ballpos.y + forceAplied.y * timestamp)-(Physics2D.gravity.magnitude*timestamp*timestamp)/2f;

            dotsliste[i].position = pos;
            timestamp += dots_spacing;
        }

    }


    public void Show()
    {
        dots_parent.SetActive(true);
    }

    public void Hide()
    {
        dots_parent.SetActive(false);
    }
}
